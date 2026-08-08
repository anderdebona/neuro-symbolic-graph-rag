export interface Triple {
  subject: string;
  predicate: string;
  object: string;
}

export class KnowledgeGraph {
  private triples: Triple[] = [];

  public addTriple(subject: string, predicate: string, object: string): void {
    this.triples.push({ subject, predicate, object });
  }

  public query(subject?: string, predicate?: string, object?: string): Triple[] {
    return this.triples.filter((t) => {
      if (subject && t.subject !== subject) return false;
      if (predicate && t.predicate !== predicate) return false;
      if (object && t.object !== object) return false;
      return true;
    });
  }

  public getTriples(): Triple[] {
    return [...this.triples];
  }

  /**
   * Logical Rule Inference: e.g. Transitive relations (A is_a B, B is_a C => A is_a C)
   */
  public inferTransitive(predicate: string): Triple[] {
    const inferred: Triple[] = [];
    const relations = this.query(undefined, predicate, undefined);

    relations.forEach((r1) => {
      relations.forEach((r2) => {
        if (r1.object === r2.subject) {
          inferred.push({
            subject: r1.subject,
            predicate: predicate,
            object: r2.object,
          });
        }
      });
    });

    return inferred;
  }
}
