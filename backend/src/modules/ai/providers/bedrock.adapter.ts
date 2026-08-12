/**
 * Bedrock LLM Provider Adapter
 *
 * Wraps AWS Bedrock to implement the LLMProvider interface
 * Preserves existing BedrockService functionality while adding abstraction
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  LLMMessage,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class BedrockAdapter implements LLMProvider {
  readonly name = 'bedrock';
  private readonly logger = new Logger(BedrockAdapter.name);
  private client: BedrockRuntimeClient;
  private readonly defaultModel = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

  private readonly supportedModels = [
    'anthropic.claude-3-5-sonnet-20241022-v2:0',
    'anthropic.claude-3-sonnet-20240229-v1:0',
    'anthropic.claude-3-haiku-20240307-v1:0',
  ];

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

    this.client = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.log(`Bedrock adapter initialized in region: ${region}`);
  }

  async invoke(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = request.model || this.defaultModel;

    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} not supported by Bedrock adapter`);
    }

    const payload: any = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: request.maxTokens || 2000,
      temperature: request.temperature ?? 0.7,
      messages: this.formatMessages(request.messages),
    };

    if (request.systemPrompt) {
      payload.system = request.systemPrompt;
    }

    if (request.stopSequences) {
      payload.stop_sequences = request.stopSequences;
    }

    try {
      const command = new InvokeModelCommand({
        modelId: model,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(
        new TextDecoder().decode(response.body),
      );

      const latency = Date.now() - startTime;

      return {
        content: responseBody.content[0].text,
        usage: {
          inputTokens: responseBody.usage.input_tokens,
          outputTokens: responseBody.usage.output_tokens,
        },
        metadata: {
          model,
          provider: this.name,
          finishReason: responseBody.stop_reason,
          latency,
        },
      };
    } catch (error) {
      this.logger.error(`Bedrock invocation failed: ${error.message}`, error.stack);
      throw new Error(`Bedrock request failed: ${error.message}`);
    }
  }

  supportsModel(model: string): boolean {
    return this.supportedModels.includes(model);
  }

  getAvailableModels(): string[] {
    return [...this.supportedModels];
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Simple health check - try to invoke with minimal payload
      const testPayload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const command = new InvokeModelCommand({
        modelId: this.defaultModel,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(testPayload),
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      this.logger.warn(`Bedrock health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Format messages to Bedrock's expected format
   * Bedrock expects {role: 'user' | 'assistant', content: string}
   */
  private formatMessages(messages: LLMMessage[]): any[] {
    return messages
      .filter((m) => m.role !== 'system') // System is handled separately
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));
  }
}
