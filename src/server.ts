import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { KnowledgeGraph } from './kg/graph.js';
import { VectorEngine } from './rag/vector-engine.js';
import { NeuroSymbolicReasoner } from './ai/reasoner.js';
import { FirstOrderLogicProver } from './symbolic/first-order-prover.js';
import { KnowledgeGraphEmbeddingRanker } from './symbolic/kg-embedding-ranker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const kg = new KnowledgeGraph();
kg.addTriple('Raft', 'is_a', 'ConsensusProtocol');
kg.addTriple('ConsensusProtocol', 'ensures', 'StateConsistency');
kg.addTriple('StateConsistency', 'prevents', 'SplitBrain');

const vectorEngine = new VectorEngine();
vectorEngine.addDocument('doc-1', 'Raft guarantees fault tolerance using a leader-driven model.', [0.8, 0.2, 0.5]);
vectorEngine.addDocument('doc-2', 'State Machine Replication requires log agreement across majority nodes.', [0.7, 0.3, 0.6]);

const reasoner = new NeuroSymbolicReasoner(kg, vectorEngine);

const prover = new FirstOrderLogicProver();
prover.addFact('LeaderElected');
prover.addFact('QuorumReached');
prover.addRule({
  id: 'R1',
  premises: ['LeaderElected', 'QuorumReached'],
  conclusion: 'SafeToCommit',
});
prover.addRule({
  id: 'R2',
  premises: ['SafeToCommit'],
  conclusion: 'StrictConsistency',
});

app.post('/api/reason', (req, res) => {
  const { query } = req.body;
  const mockEmbedding = [0.8, 0.25, 0.55];
  const result = reasoner.reason(query || 'Raft Consensus', mockEmbedding);
  res.json(result);
});

app.post('/api/symbolic/prove', (req, res) => {
  const { targetFact = 'StrictConsistency' } = req.body;
  const proofResult = prover.prove(targetFact);
  res.json(proofResult);
});

app.post('/api/symbolic/transe', (req, res) => {
  const headVec = [0.8, 0.2, 0.5];
  const relVec = [0.05, 0.05, 0.05];
  const candidates = [
    { id: 'ConsensusProtocol', vector: [0.85, 0.25, 0.55] },
    { id: 'ByzantineGeneral', vector: [0.1, 0.9, 0.4] },
    { id: 'RelationalDatabase', vector: [0.3, 0.3, 0.9] },
  ];

  const ranked = KnowledgeGraphEmbeddingRanker.rankCandidates(headVec, relVec, candidates);
  res.json({ head: 'Raft', relation: 'is_a', ranked });
});

app.listen(PORT, () => {
  console.log(`🚀 Neuro-Symbolic GraphRAG Engine Turbocharged on http://localhost:${PORT}`);
});
