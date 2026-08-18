export interface AbducibleFact {
  predicate: string;
  arguments: string[];
  priorProbability: number;
  cost: number;
}

export interface AbductiveExplanation {
  hypothesisId: string;
  assumptions: AbducibleFact[];
  impliedObservation: string;
  plausibilityScore: number;
  posteriorProbability: number;
  satisfiesIntegrityConstraints: boolean;
}

export class AbductiveReasoningEngine {
  private abducibles: AbducibleFact[] = [];
  private integrityConstraints: Array<(assumptions: AbducibleFact[]) => boolean> = [];

  constructor() {
    this.setupDefaultKnowledgeBase();
  }

  private setupDefaultKnowledgeBase(): void {
    this.registerAbducible({
      predicate: 'DatabaseDeadlock',
      arguments: ['PostgresCluster'],
      priorProbability: 0.25,
      cost: 1.2
    });

    this.registerAbducible({
      predicate: 'NetworkPartition',
      arguments: ['Region_US_East'],
      priorProbability: 0.15,
      cost: 2.0
    });

    this.registerAbducible({
      predicate: 'MemoryLeakInWorker',
      arguments: ['NodeWorkerPool'],
      priorProbability: 0.45,
      cost: 0.8
    });

    // Integrity constraint: cannot have both NetworkPartition and local WorkerMemoryLeak as sole independent causes simultaneously
    this.integrityConstraints.push((assumptions) => {
      const preds = assumptions.map(a => a.predicate);
      return !(preds.includes('NetworkPartition') && preds.includes('DatabaseDeadlock'));
    });
  }

  public registerAbducible(fact: AbducibleFact): void {
    this.abducibles.push(fact);
  }

  /**
   * Performs Abductive Logic Programming (ALP) to explain observed symptom
   */
  public generateExplanations(observation: string): AbductiveExplanation[] {
    const candidateHypotheses: AbductiveExplanation[] = [];

    for (const abducible of this.abducibles) {
      const singleSet = [abducible];
      const valid = this.integrityConstraints.every(ic => ic(singleSet));

      if (valid) {
        const likelihood = 0.90; // P(Obs | Hypothesis)
        const prior = abducible.priorProbability;
        const posterior = (likelihood * prior) / (likelihood * prior + (1 - likelihood) * (1 - prior));

        candidateHypotheses.push({
          hypothesisId: `hyp_${abducible.predicate}_${Date.now()}`,
          assumptions: singleSet,
          impliedObservation: observation,
          plausibilityScore: Math.round((1 / abducible.cost) * 100) / 100,
          posteriorProbability: Math.round(posterior * 1000) / 1000,
          satisfiesIntegrityConstraints: true
        });
      }
    }

    candidateHypotheses.sort((a, b) => b.posteriorProbability - a.posteriorProbability);
    return candidateHypotheses;
  }
}
