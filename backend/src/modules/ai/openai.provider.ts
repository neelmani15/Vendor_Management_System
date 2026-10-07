import { AIProvider, RecommendationSummaryInput } from './ai.interface';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai';

  public async generateRecommendationSummary(input: RecommendationSummaryInput): Promise<string> {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert procurement executive assistant for FieldNerve.
Your task is to summarize the results of a deterministic vendor recommendation engine for an organization's work requirement.

CRITICAL INSTRUCTIONS:
1. NEVER alter, reorder, or question the rankings or scores provided. The rankings were calculated deterministically by mathematical algorithms.
2. NEVER invent vendor facts, capabilities, or details not present in the input.
3. Highlight why the #1 vendor was chosen, their strengths, comparison with the #2 vendor, and mention any compliance disqualifications.
4. Output a concise, executive-level markdown summary suitable for a Chief Procurement Officer.`;

    const userPrompt = `Please synthesize the following deterministic recommendation results into an executive summary:
${JSON.stringify(input, null, 2)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 600,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API responded with status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI returned empty completion');
      }

      return content;
    } catch (error) {
      logger.warn({ error }, 'OpenAI provider failed or timed out. Falling back to deterministic provider.');
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
