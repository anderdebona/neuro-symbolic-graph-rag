import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { KnowledgeGraph } from './kg/graph.js';
import { VectorEngine } from './rag/vector-engine.js';
import { NeuroSymbolicReasoner } from './ai/reasoner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Knowledge Graph & Vector Engine with PhD Knowledge domain
const kg = new KnowledgeGraph();
kg.addTriple('Raft', 'is_a', 'ConsensusProtocol');
kg.addTriple('ConsensusProtocol', 'ensures', 'StateConsistency');
kg.addTriple('StateConsistency', 'prevents', 'SplitBrain');

const vectorEngine = new VectorEngine();
vectorEngine.addDocument('doc-1', 'Raft guarantees fault tolerance using a leader-driven model.', [0.8, 0.2, 0.5]);
vectorEngine.addDocument('doc-2', 'State Machine Replication requires log agreement across majority nodes.', [0.7, 0.3, 0.6]);

const reasoner = new NeuroSymbolicReasoner(kg, vectorEngine);

app.post('/api/reason', (req, res) => {
  const { query } = req.body;
  const mockEmbedding = [0.8, 0.25, 0.55];
  const result = reasoner.reason(query || 'Raft Consensus', mockEmbedding);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 Neuro-Symbolic GraphRAG Engine running on http://localhost:${PORT}`);
});
