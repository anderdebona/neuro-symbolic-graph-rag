import { describe, it, expect } from 'vitest';
import { KnowledgeGraph } from '../src/kg/graph.js';
import { VectorEngine } from '../src/rag/vector-engine.js';
import { NeuroSymbolicReasoner } from '../src/ai/reasoner.js';

describe('Neuro-Symbolic GraphRAG Tests', () => {
  it('should infer transitive relations in Knowledge Graph', () => {
    const kg = new KnowledgeGraph();
    kg.addTriple('A', 'subclass_of', 'B');
    kg.addTriple('B', 'subclass_of', 'C');

    const inferred = kg.inferTransitive('subclass_of');
    expect(inferred.length).toBe(1);
    expect(inferred[0].subject).toBe('A');
    expect(inferred[0].object).toBe('C');
  });

  it('should validate neural vector results against symbolic knowledge graph', () => {
    const kg = new KnowledgeGraph();
    kg.addTriple('Raft', 'is_a', 'ConsensusProtocol');

    const vectorEngine = new VectorEngine();
    vectorEngine.addDocument('d1', 'Raft overview', [1, 0, 0]);

    const reasoner = new NeuroSymbolicReasoner(kg, vectorEngine);
    const result = reasoner.reason('Raft', [1, 0, 0]);

    expect(result.isLogicallyConsistent).toBe(true);
    expect(result.confidenceScore).toBe(0.98);
  });
});
