export interface HybridRankScore {
  docId: string;
  neuralSimilarity: number;
  symbolicGraphMatch: boolean;
  fusedScore: number;
}

export class HybridFusionRanker {
  public static calculateFusionScore(
    neuralSim: number,
    symbolicMatch: boolean,
    alpha: number = 0.6
  ): number {
    const symbolicScore = symbolicMatch ? 1.0 : 0.2;
    return alpha * neuralSim + (1 - alpha) * symbolicScore;
  }
}
