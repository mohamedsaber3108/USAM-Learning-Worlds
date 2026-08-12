import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { AIUsageService } from './ai-usage.service';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string;
}

@Injectable()
export class BedrockService {
  private readonly logger = new Logger(BedrockService.name);
  private client: BedrockRuntimeClient;
  private readonly defaultModel = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => AIUsageService))
    private aiUsage: AIUsageService,
  ) {
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

    this.client = new BedrockRuntimeClient({
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.logger.log(`Bedrock client initialized in region: ${region}`);
  }

  /**
   * Invoke Claude model via Bedrock
   */
  async invoke(
    messages: AIMessage[],
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
      userId?: string;
      service?: string;
    },
  ): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;
    const maxTokens = options?.maxTokens || 2000;
    const temperature = options?.temperature || 0.7;

    const payload: any = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      temperature,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
    };

    if (options?.systemPrompt) {
      payload.system = options.systemPrompt;
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

      const result = {
        content: responseBody.content[0].text,
        usage: {
          inputTokens: responseBody.usage.input_tokens,
          outputTokens: responseBody.usage.output_tokens,
        },
        stopReason: responseBody.stop_reason,
      };

      if (options?.userId && options?.service) {
        await this.aiUsage.logUsage(
          options.userId,
          options.service,
          model,
          result.usage.inputTokens,
          result.usage.outputTokens,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Bedrock invocation failed: ${error.message}`, error.stack);
      throw new Error(`AI request failed: ${error.message}`);
    }
  }

  /**
   * Generate feedback for learner work
   */
  async generateFeedback(
    work: string,
    rubric: string,
    context?: string,
  ): Promise<string> {
    const systemPrompt = `You are an encouraging and constructive educational AI assistant.
Your role is to provide helpful feedback on student work that:
- Highlights what they did well
- Identifies areas for improvement with specific suggestions
- Maintains an encouraging and supportive tone
- Is appropriate for K-12 learners`;

    const userMessage = `Please provide feedback on this learner's work.

${context ? `Context: ${context}\n\n` : ''}Rubric/Criteria:
${rubric}

Learner's Work:
${work}

Provide constructive feedback in 2-3 paragraphs.`;

    const response = await this.invoke(
      [{ role: 'user', content: userMessage }],
      {
        systemPrompt,
        maxTokens: 1000,
        temperature: 0.7,
      },
    );

    return response.content;
  }

  /**
   * Generate hints for stuck learners
   */
  async generateHint(
    question: string,
    learnerAttempt: string,
    difficulty: 'easy' | 'medium' | 'hard',
  ): Promise<string> {
    const systemPrompt = `You are a patient tutor helping K-12 students.
Provide hints that guide without giving away the answer.
Use Socratic questioning and lead them toward the solution.`;

    const hintLevel =
      difficulty === 'easy'
        ? 'a gentle nudge in the right direction'
        : difficulty === 'medium'
          ? 'a more specific hint about the approach'
          : 'a detailed hint that almost reveals the solution';

    const userMessage = `Question: ${question}

Student's attempt: ${learnerAttempt}

Provide ${hintLevel}. Keep it brief (2-3 sentences).`;

    const response = await this.invoke(
      [{ role: 'user', content: userMessage }],
      {
        systemPrompt,
        maxTokens: 300,
        temperature: 0.8,
      },
    );

    return response.content;
  }

  /**
   * Generate explanations for concepts
   */
  async explainConcept(
    concept: string,
    learnerAge: number,
    context?: string,
  ): Promise<string> {
    const systemPrompt = `You are an expert educator who explains concepts in age-appropriate ways.
Use analogies, examples, and clear language suitable for the learner's age.
Break down complex ideas into digestible pieces.`;

    const userMessage = `Explain "${concept}" for a ${learnerAge}-year-old learner.
${context ? `Additional context: ${context}` : ''}

Provide a clear, engaging explanation in 2-3 paragraphs with an example.`;

    const response = await this.invoke(
      [{ role: 'user', content: userMessage }],
      {
        systemPrompt,
        maxTokens: 800,
        temperature: 0.7,
      },
    );

    return response.content;
  }

  /**
   * Analyze learner's written response
   */
  async analyzeResponse(
    question: string,
    learnerResponse: string,
    keyPoints: string[],
  ): Promise<{
    score: number;
    feedback: string;
    mentionedPoints: string[];
    missedPoints: string[];
  }> {
    const systemPrompt = `You are an educational assessment AI.
Analyze student responses objectively and provide constructive feedback.
Return your analysis in JSON format.`;

    const userMessage = `Question: ${question}

Key points that should be covered: ${keyPoints.join(', ')}

Student's response: ${learnerResponse}

Analyze the response and return JSON with:
{
  "score": <0-1 representing quality>,
  "feedback": "<constructive feedback>",
  "mentionedPoints": [<array of key points student covered>],
  "missedPoints": [<array of key points student missed>]
}`;

    const response = await this.invoke(
      [{ role: 'user', content: userMessage }],
      {
        systemPrompt,
        maxTokens: 800,
        temperature: 0.3,
      },
    );

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        score: 0.5,
        feedback: response.content,
        mentionedPoints: [],
        missedPoints: keyPoints,
      };
    }
  }
}
