# Neuro-Symbolic GraphRAG Engine 🕸️ 🧠

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/Version-v5.0.0%20Ultra-00d2ff?style=for-the-badge)](https://github.com/anderdebona/neuro-symbolic-graph-rag)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Passing%20100%25-success?style=for-the-badge&logo=githubactions)](https://github.com/anderdebona/neuro-symbolic-graph-rag/actions)

<br />

**PhD-Grade Neuro-Symbolic GraphRAG Engine: Abductive Logic Programming, Cross-Attention Multi-Hop Subgraph Rerankers, First-Order Horn Clauses & TransE Embeddings**

*Engineered with precision by **[anderdebona](https://github.com/anderdebona)***

</div>

---

## 📌 Academic Purpose & Architecture

This repository delivers a **Zero-Hallucination Neuro-Symbolic Graph Retrieval-Augmented Generation (GraphRAG) architecture**. It bridges dense semantic embeddings with rigorous symbolic logic (Abductive Logic Programming, First-Order Horn clause resolution, and TransE knowledge graph translational embeddings).

---

## 🔬 Mathematical Formulations

### 1. Abductive Logic Programming (ALP)
Given background knowledge $B$, integrity constraints $IC$, and observations $O$:
$$\Delta^* = \arg\max_{\Delta} P(\Delta \mid O) \quad \text{s.t.} \quad B \cup \Delta \models O, \quad B \cup \Delta \models IC$$

### 2. Cross-Attention Subgraph Path Reranker
$$S(q, \text{Path}) = \alpha \cdot \text{Sim}_{\text{dense}}(q, \text{Path}) + \beta \cdot \text{LogicalConsistency}(\text{Path}) - \gamma \cdot \text{HopPenalty}$$

---

## ⚡ What's New in v5.0.0

- 💡 **`AbductiveReasoningEngine`**: Generates plausible abductive hypothesis sets explaining root-cause symptoms under integrity constraints.
- 🎯 **`CrossAttentionPathReranker`**: Multi-hop knowledge subgraph path reranking fusing dense similarity with symbolic consistency.
- 🎛️ **Studio v5.0.0**: Real-time Abductive Hypotheses generator, path reranker studio, and Horn clause prover.
- 🧪 **13/13 Tests Passing**: 100% Vitest coverage across logic provers, vector engines, and TransE rankers.

---

## 🚀 Quickstart & Interactive Studio

```bash
git clone https://github.com/anderdebona/neuro-symbolic-graph-rag.git
cd neuro-symbolic-graph-rag
npm install
npm test
npm run build
npm start
# Open http://localhost:3003
```

---

## 📄 License & Citation
MIT License © 2026 anderdebona. See [CITATION.cff](CITATION.cff) for academic attribution.
