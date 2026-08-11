export interface SymbolicRule { id: string; condition: (facts: Map<string, any>) => boolean; action: string; priority: number; }
export interface RuleEngineResult { firedRules: string[]; actions: string[]; totalRules: number; }
export class SymbolicRuleEngine {
  private rules: SymbolicRule[] = [];
  public addRule(id: string, condition: (facts: Map<string, any>) => boolean, action: string, priority: number = 0): void {
    this.rules.push({ id, condition, action, priority });
    this.rules.sort((a, b) => a.priority - b.priority);
  }
  public evaluate(facts: Map<string, any>): RuleEngineResult {
    const fired: string[] = []; const actions: string[] = [];
    for (const rule of this.rules) {
      if (rule.condition(facts)) { fired.push(rule.id); actions.push(rule.action); }
    }
    return { firedRules: fired, actions, totalRules: this.rules.length };
  }
}
