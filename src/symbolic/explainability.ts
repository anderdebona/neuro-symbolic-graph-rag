/**
 * Explanation node in the reasoning trace
 */
export interface ExplanationNode {
  step: number; component: 'neural' | 'symbolic' | 'graph';
  description: string; confidence: number; evidence: string[];
}

/**
 * Full explanation trace for a neuro-symbolic query
 */
export interface ExplanationTrace {
  query: string; totalSteps: number; nodes: ExplanationNode[];
  finalAnswer: string; overallConfidence: number;
}

/**
 * Explainability Engine — Generates human-readable reasoning traces
 * for neuro-symbolic inference, making the decision process transparent.
 *
 * Follows the XAI (Explainable AI) principle: every inference must be
 * accompanied by a traceable reasoning chain.
 *
 * Reference: Arrieta et al., "Explainable Artificial Intelligence (XAI)" (2020)
 */
export class ExplainabilityEngine {
  /**
   * Generates an explanation trace for a query result.
   */
  public static generateTrace(
    query: string,
    neuralEvidence: string[],
    symbolicEvidence: string[],
    graphEvidence: string[],
    finalAnswer: string
  ): ExplanationTrace {
    const nodes: ExplanationNode[] = [];
    let step = 1;

    if (neuralEvidence.length > 0) {
      nodes.push({
        step: step++, component: 'neural',
        description: 'Neural embedding similarity search retrieved relevant passages',
        confidence: 0.85, evidence: neuralEvidence,
      });
    }

    if (graphEvidence.length > 0) {
      nodes.push({
        step: step++, component: 'graph',
        description: 'Knowledge graph traversal found connected entities',
        confidence: 0.9, evidence: graphEvidence,
      });
    }

    if (symbolicEvidence.length > 0) {
      nodes.push({
        step: step++, component: 'symbolic',
        description: 'Symbolic reasoning validated logical consistency',
        confidence: 0.95, evidence: symbolicEvidence,
      });
    }

    const overallConfidence = nodes.length > 0
      ? nodes.reduce((s, n) => s + n.confidence, 0) / nodes.length
      : 0;

    return {
      query, totalSteps: nodes.length, nodes,
      finalAnswer, overallConfidence,
    };
  }

  /**
   * Formats a trace into a human-readable explanation string.
   */
  public static formatExplanation(trace: ExplanationTrace): string {
    const lines = [`Query: "${trace.query}"`, `Answer: ${trace.finalAnswer}`, `Confidence: ${(trace.overallConfidence * 100).toFixed(1)}%`, '', 'Reasoning Chain:'];
    for (const node of trace.nodes) {
      lines.push(`  Step ${node.step} [${node.component}]: ${node.description}`);
      lines.push(`    Evidence: ${node.evidence.join(', ')}`);
    }
    return lines.join('\n');
  }
}
