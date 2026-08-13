export interface TripleEmbedding {
  head: string;
  relation: string;
  tail: string;
  headVec: number[];
  relVec: number[];
  tailVec: number[];
}

export class KnowledgeGraphEmbeddingRanker {
  /**
   * TransE Energy score: - || h + r - t ||_2
   * Higher score (closer to 0) means higher confidence that the triple holds true
   */
  public static scoreTransE(headVec: number[], relVec: number[], tailVec: number[]): number {
    if (headVec.length !== relVec.length || relVec.length !== tailVec.length) {
      throw new Error('Vector dimension mismatch in TransE calculation');
    }

    let distSq = 0.0;
    for (let i = 0; i < headVec.length; i++) {
      const diff = headVec[i] + relVec[i] - tailVec[i];
      distSq += diff * diff;
    }

    const dist = Math.sqrt(distSq);
    return parseFloat((-dist).toFixed(4));
  }

  /**
   * Ranks candidate entities for link prediction (h, r, ?)
   */
  public static rankCandidates(
    headVec: number[],
    relVec: number[],
    candidates: Array<{ id: string; vector: number[] }>
  ): Array<{ id: string; score: number }> {
    const scores = candidates.map(c => ({
      id: c.id,
      score: this.scoreTransE(headVec, relVec, c.vector),
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores;
  }
}
