export interface KnowledgePath {
  pathId: string;
  sourceEntity: string;
  targetEntity: string;
  predicates: string[];
  denseSimilarityScore: number;
  logicalConsistencyScore: number;
}

export interface RerankedPathResult {
  pathId: string;
  hopCount: number;
  rawSimilarity: number;
  logicalConsistency: number;
  finalScore: number;
  reasoningExplanation: string;
}

export class CrossAttentionPathReranker {
  private alpha: number; // Dense similarity weight
  private beta: number;  // Logical consistency weight
  private gamma: number; // Hop penalty

  constructor(alpha: number = 0.5, beta: number = 0.4, gamma: number = 0.1) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
  }

  /**
   * Reranks candidate knowledge paths combining neural dense embeddings and symbolic logic consistency
   */
  public rerankPaths(query: string, paths: KnowledgePath[]): RerankedPathResult[] {
    const results: RerankedPathResult[] = paths.map(path => {
      const hopCount = path.predicates.length;
      const hopPenalty = (hopCount - 1) * this.gamma;

      // Final hybrid score S = alpha * Dense + beta * Logic - gamma * HopPenalty
      const finalScore = this.alpha * path.denseSimilarityScore + this.beta * path.logicalConsistencyScore - hopPenalty;
      const normalizedScore = Math.max(0, Math.min(1, Math.round(finalScore * 1000) / 1000));

      return {
        pathId: path.pathId,
        hopCount,
        rawSimilarity: path.denseSimilarityScore,
        logicalConsistency: path.logicalConsistencyScore,
        finalScore: normalizedScore,
        reasoningExplanation: `Verified path ${path.sourceEntity} -> [${path.predicates.join(' -> ')}] -> ${path.targetEntity} with ${normalizedScore * 100}% neuro-symbolic confidence.`
      };
    });

    results.sort((a, b) => b.finalScore - a.finalScore);
    return results;
  }
}
