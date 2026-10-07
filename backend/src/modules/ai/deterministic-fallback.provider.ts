import { AIProvider, RecommendationSummaryInput } from './ai.interface';

export class DeterministicFallbackProvider implements AIProvider {
  public readonly name = 'deterministic';

  public async generateRecommendationSummary(input: RecommendationSummaryInput): Promise<string> {
    const { workRequirement, rankedRecommendations, totalCandidates } = input;
    const eligible = rankedRecommendations.filter((r) => r.eligibility === 'ELIGIBLE');
    const disqualified = rankedRecommendations.filter((r) => r.eligibility === 'DISQUALIFIED');

    if (eligible.length === 0) {
      const reasonsList = disqualified
        .slice(0, 3)
        .map((d) => `- **${d.vendorName}**: ${d.disqualificationReasons?.join(', ') || 'Compliance or eligibility criteria unmet'}`)
        .join('\n');

      return `### Executive Recommendation Summary
No eligible vendors were found for requirement **"${workRequirement.title}"** out of ${totalCandidates} evaluated candidate(s).

#### Disqualification Insights:
${reasonsList || '- All evaluated vendors violated mandatory compliance or location criteria.'}

**Recommendation**: Consider adjusting the mandatory rating threshold, expanding geographic location scope, or requesting vendor compliance updates.`;
    }

    const winner = eligible[0];
    const runnerUp = eligible.length > 1 ? eligible[1] : null;

    let narrative = `### Executive Recommendation Summary\n\n`;
    narrative += `For requirement **"${workRequirement.title}"** (${workRequirement.category} in ${workRequirement.location}), **${winner.vendorName}** is the top-ranked recommendation with a composite score of **${winner.score.toFixed(2)}/100** (Rank #1).\n\n`;

    // Winner strengths
    if (winner.strengths.length > 0) {
      narrative += `**Key Strengths of ${winner.vendorName}**:\n`;
      winner.strengths.forEach((s) => {
        narrative += `- ${s}\n`;
      });
      narrative += '\n';
    }

    // Comparison with runner-up
    if (runnerUp) {
      const scoreDiff = (winner.score - runnerUp.score).toFixed(2);
      narrative += `**Comparative Analysis**:\n`;
      narrative += `Runner-up **${runnerUp.vendorName}** placed second with a score of **${runnerUp.score.toFixed(2)}/100** (a margin of ${scoreDiff} points). `;

      if (winner.scoreBreakdown.location > runnerUp.scoreBreakdown.location) {
        narrative += `${winner.vendorName} demonstrated superior regional proximity. `;
      }
      if (winner.scoreBreakdown.compliance > runnerUp.scoreBreakdown.compliance) {
        narrative += `${winner.vendorName} possesses higher compliance integrity. `;
      }
      if (runnerUp.weaknesses.length > 0) {
        narrative += `Notable tradeoffs for ${runnerUp.vendorName}: ${runnerUp.weaknesses.join('; ')}. `;
      }
      narrative += '\n\n';
    }

    // Mention disqualifications if any
    if (disqualified.length > 0) {
      narrative += `**Compliance & Filtering Observations**:\n`;
      narrative += `${disqualified.length} vendor(s) were excluded based on strict mandatory criteria (e.g., `;
      const sampleReasons = disqualified
        .map((d) => `${d.vendorName}: ${d.disqualificationReasons?.[0] || 'Unmet criteria'}`)
        .slice(0, 2)
        .join('; ');
      narrative += `${sampleReasons}).\n\n`;
    }

    narrative += `*Note: This summary reflects deterministic weighted scoring and rules-based evaluation. Rankings and scores are computed mathematically and are not altered by generative AI.*`;

    return narrative;
  }
}
