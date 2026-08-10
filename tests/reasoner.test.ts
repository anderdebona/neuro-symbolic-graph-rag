import { describe, it, expect } from 'vitest';
import { KnowledgeGraph } from '../src/kg/graph.js';
import { VectorEngine } from '../src/rag/vector-engine.js';
import { NeuroSymbolicReasoner } from '../src/ai/reasoner.js';
import { OntologyReasoner } from '../src/symbolic/ontology-reasoner.js';
import { ExplainabilityEngine } from '../src/symbolic/explainability.js';

describe('Knowledge Graph', () => {
  it('should infer transitive relations', () => {
    const kg = new KnowledgeGraph();
    kg.addTriple('A', 'subclass_of', 'B');
    kg.addTriple('B', 'subclass_of', 'C');
    const inferred = kg.inferTransitive('subclass_of');
    expect(inferred.length).toBe(1);
    expect(inferred[0].subject).toBe('A');
    expect(inferred[0].object).toBe('C');
  });
});

describe('Neuro-Symbolic Reasoner', () => {
  it('should validate neural results against KG', () => {
    const kg = new KnowledgeGraph();
    kg.addTriple('Raft', 'is_a', 'ConsensusProtocol');
    const ve = new VectorEngine();
    ve.addDocument('d1', 'Raft overview', [1, 0, 0]);
    const reasoner = new NeuroSymbolicReasoner(kg, ve);
    const result = reasoner.reason('Raft', [1, 0, 0]);
    expect(result.isLogicallyConsistent).toBe(true);
  });
});

describe('Ontology Reasoner', () => {
  it('should traverse is-a hierarchy and get ancestors', () => {
    const reasoner = new OntologyReasoner();
    reasoner.addConcept({ id: 'Animal', label: 'Animal', properties: ['alive'] });
    reasoner.addConcept({ id: 'Mammal', label: 'Mammal', superClass: 'Animal', properties: ['warm-blooded'] });
    reasoner.addConcept({ id: 'Dog', label: 'Dog', superClass: 'Mammal', properties: ['barks'] });

    const ancestors = reasoner.getAncestors('Dog');
    expect(ancestors).toContain('Mammal');
    expect(ancestors).toContain('Animal');
  });

  it('should check subsumption correctly', () => {
    const reasoner = new OntologyReasoner();
    reasoner.addConcept({ id: 'A', label: 'A', properties: [] });
    reasoner.addConcept({ id: 'B', label: 'B', superClass: 'A', properties: [] });
    reasoner.addConcept({ id: 'C', label: 'C', superClass: 'B', properties: [] });
    expect(reasoner.subsumes('A', 'C')).toBe(true);
    expect(reasoner.subsumes('C', 'A')).toBe(false);
  });

  it('should inherit properties from ancestors', () => {
    const reasoner = new OntologyReasoner();
    reasoner.addConcept({ id: 'Vehicle', label: 'Vehicle', properties: ['has_wheels'] });
    reasoner.addConcept({ id: 'Car', label: 'Car', superClass: 'Vehicle', properties: ['has_engine'] });
    const props = reasoner.getInheritedProperties('Car');
    expect(props).toContain('has_wheels');
    expect(props).toContain('has_engine');
  });
});

describe('Explainability Engine', () => {
  it('should generate a reasoning trace', () => {
    const trace = ExplainabilityEngine.generateTrace(
      'What is Raft?',
      ['Found in doc: Raft consensus'],
      ['KG: Raft is-a ConsensusProtocol'],
      ['Graph: Raft → Paxos'],
      'Raft is a consensus protocol used in distributed systems'
    );
    expect(trace.totalSteps).toBe(3);
    expect(trace.overallConfidence).toBeGreaterThan(0.5);
  });

  it('should format explanation as human-readable string', () => {
    const trace = ExplainabilityEngine.generateTrace(
      'Q?', ['evidence1'], ['evidence2'], [], 'Answer'
    );
    const formatted = ExplainabilityEngine.formatExplanation(trace);
    expect(formatted).toContain('Query: "Q?"');
    expect(formatted).toContain('Answer: Answer');
  });
});
