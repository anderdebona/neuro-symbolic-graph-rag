#!/usr/bin/env node
import { KnowledgeGraph } from './kg/graph.js';
import { VectorEngine } from './rag/vector-engine.js';
import { NeuroSymbolicReasoner } from './ai/reasoner.js';
import { HybridFusionRanker } from './ai/hybrid-fusion.js';

console.log(`
===========================================================
  🤖 NEURO-SYMBOLIC KNOWLEDGE GRAPH RAG CLI [v1.0.0]
  Author: anderdebona
===========================================================
`);

const kg = new KnowledgeGraph();
kg.addTriple('NFe_2026', 'hasTaxRate', '15%');
kg.addTriple('NFe_2026', 'isRegulatedBy', 'TaxReform_2026');

const vectorEngine = new VectorEngine();
vectorEngine.addDocument('doc1', 'NFe 2026 tax rate regulation document', [0.1, 0.2, 0.3]);

const reasoner = new NeuroSymbolicReasoner(kg, vectorEngine);

console.log('🤖 Executing Neuro-Symbolic Hybrid Reasoning...');
const result = reasoner.reason('NFe_2026', [0.1, 0.2, 0.3]);

console.log('\n📊 Symbolic Triples Verified:');
console.log(JSON.stringify(result.symbolicFactsVerified, null, 2));

console.log('\n⚡ Hybrid Fusion Score (Neural Similarity + Symbolic Constraints):');
const fusionScore = HybridFusionRanker.calculateFusionScore(result.confidenceScore, result.isLogicallyConsistent);
console.log(`Fused Confidence Score: ${(fusionScore * 100).toFixed(2)}%`);
console.log(`Final Answer: ${result.finalAnswer}`);
