/**
 * AI Provider Service
 *
 * Central service for routing AI requests to appropriate providers/models
 * Handles provider selection, fallback, and model routing logic
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  LLMProvider,
  LLMRequest,
  LLMResponse,
} from './interfaces/llm-provider.interface';
import {
  AITask,
  AITaskType,
  AIResponse,
} from './interfaces/ai-task.interface';

@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private providers: Map<string, LLMProvider> = new Map();
  private primaryProvider: string;

  constructor() {
    // Primary provider will be set when providers are registered
  }

  /**
   * Register an LLM provider
   */
  registerProvider(provider: LLMProvider, isPrimary: boolean = false) {
    this.providers.set(provider.name, provider);
    if (isPrimary || !this.primaryProvider) {
      this.primaryProvider = provider.name;
    }
    this.logger.log(
      `Registered provider: ${provider.name} (primary: ${isPrimary})`,
    );
  }

  /**
   * Execute an AI task with automatic model routing
   */
  async executeTask(task: AITask): Promise<AIResponse> {
    const provider = this.selectProvider(task);
    const model = this.selectModel(task);

    const request: LLMRequest = this.buildRequest(task, model);

    try {
      const response = await provider.invoke(request);
      return this.formatResponse(response);
    } catch (error) {
      this.logger.error(
        `Task execution failed: ${error.message}`,
        error.stack,
      );

      // Attempt fallback if available
      if (this.providers.size > 1) {
        return this.executeWithFallback(task, provider.name);
      }

      throw error;
    }
  }

  /**
   * Direct LLM invocation (for advanced use cases)
   */
  async invoke(
    request: LLMRequest,
    providerName?: string,
  ): Promise<LLMResponse> {
    const provider = providerName
      ? this.providers.get(providerName)
      : this.providers.get(this.primaryProvider);

    if (!provider) {
      throw new Error(
        `Provider ${providerName || this.primaryProvider} not available`,
      );
    }

    return provider.invoke(request);
  }

  /**
   * Select appropriate provider based on task
   */
  private selectProvider(task: AITask): LLMProvider {
    // For now, use primary provider
    // Future: Add provider selection logic based on task requirements
    const provider = this.providers.get(this.primaryProvider);

    if (!provider) {
      throw new Error('No providers available');
    }

    return provider;
  }

  /**
   * Select appropriate model based on task complexity and cost
   */
  private selectModel(task: AITask): string {
    const costTier = task.constraints?.costTier || 'MEDIUM';

    // Model routing logic based on task type and cost tier
    switch (costTier) {
      case 'LOW':
        // Use faster, cheaper model for simple tasks
        return 'anthropic.claude-3-haiku-20240307-v1:0';

      case 'HIGH':
        // Use most capable model for complex reasoning
        return 'anthropic.claude-3-5-sonnet-20241022-v2:0';

      case 'MEDIUM':
      default:
        // Balance between cost and capability
        return this.selectModelByTaskType(task.type);
    }
  }

  /**
   * Select model based on task type
   */
  private selectModelByTaskType(taskType: AITaskType): string {
    // Simple tasks can use Haiku
    const simpleTasks = [
      AITaskType.ENCOURAGE,
      AITaskType.HINT,
      AITaskType.CHARACTER_RESPONSE,
    ];

    // Complex tasks need Sonnet
    const complexTasks = [
      AITaskType.CODE_REVIEW,
      AITaskType.PROJECT_REVIEW,
      AITaskType.CRITICAL_THINKING,
      AITaskType.ASSESS,
    ];

    if (simpleTasks.includes(taskType)) {
      return 'anthropic.claude-3-haiku-20240307-v1:0';
    }

    if (complexTasks.includes(taskType)) {
      return 'anthropic.claude-3-5-sonnet-20241022-v2:0';
    }

    // Default to Sonnet for educational quality
    return 'anthropic.claude-3-5-sonnet-20241022-v2:0';
  }

  /**
   * Build LLM request from AI task
   */
  private buildRequest(task: AITask, model: string): LLMRequest {
    return {
      messages: [{ role: 'user', content: JSON.stringify(task.input) }],
      model,
      maxTokens: task.constraints?.maxTokens || 2000,
      temperature: task.constraints?.temperature ?? 0.7,
    };
  }

  /**
   * Format LLM response to AI response
   */
  private formatResponse(llmResponse: LLMResponse): AIResponse {
    return {
      content: llmResponse.content,
      usage: {
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
      },
      metadata: {
        model: llmResponse.metadata.model,
        provider: llmResponse.metadata.provider,
        latency: llmResponse.metadata.latency,
      },
    };
  }

  /**
   * Execute task with fallback provider
   */
  private async executeWithFallback(
    task: AITask,
    failedProviderName: string,
  ): Promise<AIResponse> {
    this.logger.warn(
      `Attempting fallback after ${failedProviderName} failure`,
    );

    // Find next available provider
    for (const [name, provider] of this.providers.entries()) {
      if (name !== failedProviderName) {
        try {
          const model = this.selectModel(task);
          const request = this.buildRequest(task, model);
          const response = await provider.invoke(request);
          return this.formatResponse(response);
        } catch (error) {
          this.logger.warn(`Fallback provider ${name} also failed`);
        }
      }
    }

    throw new Error('All providers failed');
  }

  /**
   * Check if any provider is available
   */
  async checkHealth(): Promise<{
    available: boolean;
    providers: Record<string, boolean>;
  }> {
    const results: Record<string, boolean> = {};

    for (const [name, provider] of this.providers.entries()) {
      results[name] = await provider.isAvailable();
    }

    const available = Object.values(results).some((isAvailable) => isAvailable);

    return { available, providers: results };
  }
}
