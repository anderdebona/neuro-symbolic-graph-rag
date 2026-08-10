/**
 * Ontology concept node
 */
export interface OntologyConcept {
  id: string; label: string; superClass?: string; properties: string[];
}

/**
 * Reasoning inference result
 */
export interface InferenceResult {
  query: string; inferred: string[]; confidence: number;
  reasoningChain: string[]; isConsistent: boolean;
}

/**
 * Ontology Reasoner — Performs subsumption reasoning and property inheritance
 * over a lightweight OWL-style ontology for knowledge graph enrichment.
 *
 * Supports:
 * - Subsumption (is-a) hierarchy traversal
 * - Property inheritance from parent classes
 * - Transitive closure for ancestor queries
 *
 * Reference: Baader et al., "The Description Logic Handbook" (2003)
 */
export class OntologyReasoner {
  private concepts: Map<string, OntologyConcept> = new Map();

  public addConcept(concept: OntologyConcept): void {
    this.concepts.set(concept.id, concept);
  }

  /**
   * Gets all ancestors of a concept via is-a chain (transitive closure).
   */
  public getAncestors(conceptId: string): string[] {
    const ancestors: string[] = [];
    let current = this.concepts.get(conceptId);
    while (current?.superClass) {
      ancestors.push(current.superClass);
      current = this.concepts.get(current.superClass);
    }
    return ancestors;
  }

  /**
   * Checks if concept A subsumes concept B (A is-a ancestor of B).
   */
  public subsumes(ancestorId: string, descendantId: string): boolean {
    return this.getAncestors(descendantId).includes(ancestorId);
  }

  /**
   * Inherits all properties from ancestors.
   */
  public getInheritedProperties(conceptId: string): string[] {
    const concept = this.concepts.get(conceptId);
    if (!concept) return [];

    const ownProps = [...concept.properties];
    const ancestors = this.getAncestors(conceptId);
    for (const ancestorId of ancestors) {
      const ancestor = this.concepts.get(ancestorId);
      if (ancestor) ownProps.push(...ancestor.properties);
    }

    return [...new Set(ownProps)];
  }

  /**
   * Performs inference query: what can be inferred about a concept?
   */
  public infer(conceptId: string): InferenceResult {
    const concept = this.concepts.get(conceptId);
    if (!concept) {
      return { query: conceptId, inferred: [], confidence: 0, reasoningChain: [], isConsistent: true };
    }

    const ancestors = this.getAncestors(conceptId);
    const inheritedProps = this.getInheritedProperties(conceptId);
    const reasoningChain = [`${conceptId} is-a ${ancestors.join(' → ')}`];

    return {
      query: conceptId,
      inferred: inheritedProps,
      confidence: ancestors.length > 0 ? 0.9 : 0.5,
      reasoningChain,
      isConsistent: true,
    };
  }
}
