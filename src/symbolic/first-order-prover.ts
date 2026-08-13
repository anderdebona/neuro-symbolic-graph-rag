export interface HornRule {
  id: string;
  premises: string[]; // e.g. ["Parent(X, Y)", "Parent(Y, Z)"]
  conclusion: string; // e.g. "Grandparent(X, Z)"
}

export interface ProverResult {
  proved: boolean;
  targetFact: string;
  proofSteps: string[];
  derivedFactsCount: number;
}

export class FirstOrderLogicProver {
  private knownFacts: Set<string> = new Set();
  private rules: HornRule[] = [];

  public addFact(fact: string): void {
    this.knownFacts.add(fact.trim());
  }

  public addRule(rule: HornRule): void {
    this.rules.push(rule);
  }

  /**
   * Forward chaining resolution algorithm
   */
  public prove(targetFact: string, maxIterations: number = 10): ProverResult {
    const facts = new Set<string>(this.knownFacts);
    const proofSteps: string[] = [];

    if (facts.has(targetFact)) {
      return {
        proved: true,
        targetFact,
        proofSteps: [`Fact '${targetFact}' already directly asserted in knowledge base.`],
        derivedFactsCount: facts.size,
      };
    }

    let newlyAdded = true;
    let iteration = 0;

    while (newlyAdded && iteration < maxIterations) {
      newlyAdded = false;
      iteration++;

      for (const rule of this.rules) {
        const allPremisesSatisfied = rule.premises.every(p => facts.has(p));
        if (allPremisesSatisfied && !facts.has(rule.conclusion)) {
          facts.add(rule.conclusion);
          proofSteps.push(`Applied Rule [${rule.id}]: {${rule.premises.join(', ')}} ⟹ ${rule.conclusion}`);
          newlyAdded = true;

          if (rule.conclusion === targetFact) {
            return {
              proved: true,
              targetFact,
              proofSteps,
              derivedFactsCount: facts.size,
            };
          }
        }
      }
    }

    return {
      proved: facts.has(targetFact),
      targetFact,
      proofSteps,
      derivedFactsCount: facts.size,
    };
  }
}
