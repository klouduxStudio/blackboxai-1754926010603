// Bland AI Knowledge Base Integration API
// Handles knowledge base creation, update, retrieval, and deletion

const express = require('express');
const router = express.Router();

// Mock knowledge base storage
let knowledgeBases = [];

// POST /api/bland-ai/knowledgebase - Create new knowledge base
router.post('/', (req, res) => {
  const kb = req.body;
  kb.id = 'kb_' + Date.now();
  knowledgeBases.push(kb);
  res.status(201).json({ knowledgeBase: kb });
});

// GET /api/bland-ai/knowledgebase - List all knowledge bases
router.get('/', (req, res) => {
  res.json({ knowledgeBases });
});

// GET /api/bland-ai/knowledgebase/:id - Get knowledge base details
router.get('/:id', (req, res) => {
  const kb = knowledgeBases.find(k => k.id === req.params.id);
  if (!kb) {
    return res.status(404).json({ error: 'Knowledge base not found' });
  }
  res.json({ knowledgeBase: kb });
});

// PATCH /api/bland-ai/knowledgebase/:id - Update knowledge base
router.patch('/:id', (req, res) => {
  const index = knowledgeBases.findIndex(k => k.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Knowledge base not found' });
  }
  knowledgeBases[index] = { ...knowledgeBases[index], ...req.body };
  res.json({ knowledgeBase: knowledgeBases[index] });
});

// DELETE /api/bland-ai/knowledgebase/:id - Delete knowledge base
router.delete('/:id', (req, res) => {
  const index = knowledgeBases.findIndex(k => k.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Knowledge base not found' });
  }
  knowledgeBases.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
