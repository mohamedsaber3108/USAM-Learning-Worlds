/**
 * LLM Provider Interface
 *
 * Abstract interface for language model providers (Bedrock, OpenAI, local models, etc.)
 * This allows USAM to switch providers without rewriting educational logic.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
  stopSequences?: string[];
}

export interface LLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  metadata: {
    model: string;
    provider: string;
    finishReason: string;
    latency: number;
  };
}

export interface LLMProvider {
  /**
   * Provider name (e.g., 'bedrock', 'openai', 'local')
   */
  readonly name: string;

  /**
   * Invoke the LLM with a request
   */
  invoke(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Check if provider supports a specific model
   */
  supportsModel(model: string): boolean;

  /**
   * Get available models for this provider
   */
  getAvailableModels(): string[];

  /**
   * Check provider health/availability
   */
  isAvailable(): Promise<boolean>;
}

export interface LLMProviderConfig {
  name: string;
  priority: number;
  enabled: boolean;
  models: string[];
  defaultModel: string;
  credentials?: any;
  costPerInputToken?: number;
  costPerOutputToken?: number;
}
