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

import { SymbolicRuleEngine } from '../src/symbolic/rule-engine.js';

describe('Symbolic Rule Engine', () => {
  it('should evaluate rules against facts', () => {
    const engine = new SymbolicRuleEngine();
    engine.addRule('R1', (f) => (f.get('temp') || 0) > 100, 'ALERT_OVERHEAT', 1);
    engine.addRule('R2', (f) => (f.get('temp') || 0) < 0, 'ALERT_FREEZE', 2);
    const facts = new Map([['temp', 150]]);
    const result = engine.evaluate(facts);
    expect(result.firedRules).toContain('R1');
    expect(result.actions).toContain('ALERT_OVERHEAT');
  });
  it('should not fire unmatched rules', () => {
    const engine = new SymbolicRuleEngine();
    engine.addRule('R1', (f) => (f.get('x') || 0) > 100, 'ACTION', 1);
    const result = engine.evaluate(new Map([['x', 50]]));
    expect(result.firedRules.length).toBe(0);
  });
});

describe('FirstOrderLogicProver (v4.0.0)', () => {
  it('should derive forward chaining proofs across Horn clauses', async () => {
    const { FirstOrderLogicProver } = await import('../src/symbolic/first-order-prover.js');
    const prover = new FirstOrderLogicProver();

    prover.addFact('Mammal(Whale)');
    prover.addRule({
      id: 'R_MammalWarmBlooded',
      premises: ['Mammal(Whale)'],
      conclusion: 'WarmBlooded(Whale)',
    });
    prover.addRule({
      id: 'R_WarmBloodedVertebrate',
      premises: ['WarmBlooded(Whale)'],
      conclusion: 'Vertebrate(Whale)',
    });

    const result = prover.prove('Vertebrate(Whale)');
    expect(result.proved).toBe(true);
    expect(result.proofSteps.length).toBe(2);
  });
});

describe('KnowledgeGraphEmbeddingRanker (v4.0.0)', () => {
  it('should score TransE triples with Euclidean translation distance', async () => {
    const { KnowledgeGraphEmbeddingRanker } = await import('../src/symbolic/kg-embedding-ranker.js');
    const head = [1, 2];
    const rel = [0, 1];
    const perfectTail = [1, 3]; // h + r = [1, 3]

    const score = KnowledgeGraphEmbeddingRanker.scoreTransE(head, rel, perfectTail);
    expect(score).toBeCloseTo(0.0, 3);

    const candidates = [
      { id: 'perfect', vector: [1, 3] },
      { id: 'flawed', vector: [5, 5] },
    ];
    const ranked = KnowledgeGraphEmbeddingRanker.rankCandidates(head, rel, candidates);
    expect(ranked[0].id).toBe('perfect');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});

describe('AbductiveReasoningEngine (v5.0.0)', () => {
  it('should infer most plausible abductive hypothesis for symptom observation', async () => {
    const { AbductiveReasoningEngine } = await import('../src/symbolic/abductive-reasoning-engine.js');
    const engine = new AbductiveReasoningEngine();

    const explanations = engine.generateExplanations('HighResponseLatency');
    expect(explanations.length).toBeGreaterThan(0);
    expect(explanations[0].posteriorProbability).toBeGreaterThan(0.5);
    expect(explanations[0].satisfiesIntegrityConstraints).toBe(true);
  });
});

describe('CrossAttentionPathReranker (v5.0.0)', () => {
  it('should rerank knowledge paths balancing dense vector similarity and symbolic logic', async () => {
    const { CrossAttentionPathReranker } = await import('../src/rag/cross-attention-path-reranker.js');
    const reranker = new CrossAttentionPathReranker(0.5, 0.4, 0.1);

    const candidatePaths = [
      {
        pathId: 'path-direct',
        sourceEntity: 'User',
        targetEntity: 'Service',
        predicates: ['authenticates_with'],
        denseSimilarityScore: 0.95,
        logicalConsistencyScore: 1.0
      },
      {
        pathId: 'path-long',
        sourceEntity: 'User',
        targetEntity: 'Service',
        predicates: ['connects_to', 'proxied_by', 'authenticated_at'],
        denseSimilarityScore: 0.70,
        logicalConsistencyScore: 0.80
      }
    ];

    const results = reranker.rerankPaths('How does User authenticate with Service?', candidatePaths);
    expect(results.length).toBe(2);
    expect(results[0].pathId).toBe('path-direct');
    expect(results[0].finalScore).toBeGreaterThan(results[1].finalScore);
  });
});


