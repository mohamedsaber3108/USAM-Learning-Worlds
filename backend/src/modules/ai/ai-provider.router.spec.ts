import { AIProviderService } from './ai-provider.service';
import { AITaskType } from './interfaces/ai-task.interface';
import { LLMProvider, LLMRequest, LLMResponse } from './interfaces/llm-provider.interface';

/**
 * Unit tests for the AI model router (audit AI-002/AI-003).
 * Proves invoke() routes to a task-appropriate model when given a hint,
 * respects an explicitly-pinned model, and logs cost/latency usage.
 */

class FakeProvider implements LLMProvider {
  readonly name = 'fake';
  lastRequest?: LLMRequest;

  async invoke(request: LLMRequest): Promise<LLMResponse> {
    this.lastRequest = request;
    return {
      content: 'ok',
      usage: { inputTokens: 100, outputTokens: 200 },
      metadata: {
        model: request.model || 'default',
        provider: this.name,
        finishReason: 'stop',
        latency: 5,
      },
    };
  }
  supportsModel(): boolean {
    return true;
  }
  getAvailableModels(): string[] {
    return [];
  }
  async isAvailable(): Promise<boolean> {
    return true;
  }
}

const HAIKU = 'anthropic.claude-3-haiku-20240307-v1:0';
const SONNET = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

describe('AIProviderService model router', () => {
  it('routes LOW cost tier to the cheaper model', () => {
    const svc = new AIProviderService();
    expect(svc.pickModel(AITaskType.CHARACTER_RESPONSE, 'LOW')).toBe(HAIKU);
  });

  it('routes HIGH cost tier to the capable model', () => {
    const svc = new AIProviderService();
    expect(svc.pickModel(AITaskType.CODE_REVIEW, 'HIGH')).toBe(SONNET);
  });

  it('invoke() applies the routed model when none is pinned', async () => {
    const svc = new AIProviderService();
    const provider = new FakeProvider();
    svc.registerProvider(provider, true);

    await svc.invoke(
      { messages: [{ role: 'user', content: 'hi' }] },
      undefined,
      { taskType: AITaskType.CHARACTER_RESPONSE, costTier: 'LOW' },
    );

    expect(provider.lastRequest?.model).toBe(HAIKU);
  });

  it('invoke() does not override an explicitly-pinned model', async () => {
    const svc = new AIProviderService();
    const provider = new FakeProvider();
    svc.registerProvider(provider, true);

    await svc.invoke(
      { messages: [{ role: 'user', content: 'hi' }], model: SONNET },
      undefined,
      { taskType: AITaskType.CHARACTER_RESPONSE, costTier: 'LOW' },
    );

    expect(provider.lastRequest?.model).toBe(SONNET);
  });

  it('logs usage with estimated cost + latency when a userId is provided', async () => {
    const logUsage = jest.fn().mockResolvedValue(undefined);
    const usage = { logUsage } as any;
    const svc = new AIProviderService(usage);
    svc.registerProvider(new FakeProvider(), true);

    await svc.invoke(
      { messages: [{ role: 'user', content: 'hi' }] },
      undefined,
      { taskType: AITaskType.CHARACTER_RESPONSE, costTier: 'LOW', userId: 'child-1', service: 'character' },
    );

    // allow the fire-and-forget log to run
    await new Promise((r) => setImmediate(r));

    expect(logUsage).toHaveBeenCalledTimes(1);
    const [userId, service, model, inTok, outTok, meta] = logUsage.mock.calls[0];
    expect(userId).toBe('child-1');
    expect(service).toBe('character');
    expect(model).toBe(HAIKU);
    expect(inTok).toBe(100);
    expect(outTok).toBe(200);
    // Haiku pricing: 100/1000*0.00025 + 200/1000*0.00125 = 0.000275
    expect(meta.costUsd).toBeCloseTo(0.000275, 6);
    expect(typeof meta.latencyMs).toBe('number');
  });
});
