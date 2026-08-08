export interface DocumentVector {
  id: string;
  text: string;
  embedding: number[];
}

export class VectorEngine {
  private documents: DocumentVector[] = [];

  public addDocument(id: string, text: string, embedding: number[]): void {
    this.documents.push({ id, text, embedding });
  }

  /**
   * Cosine Similarity calculation between query embedding and document embedding
   */
  public search(queryEmbedding: number[], topK: number = 3): DocumentVector[] {
    const scored = this.documents.map((doc) => {
      const sim = this.cosineSimilarity(queryEmbedding, doc.embedding);
      return { doc, sim };
    });

    scored.sort((a, b) => b.sim - a.sim);
    return scored.slice(0, topK).map((s) => s.doc);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
