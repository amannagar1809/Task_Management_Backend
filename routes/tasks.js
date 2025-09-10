const express = require('express');
const router = express.Router();

// In-memory storage for tasks (replace with database in production)
let tasks = [];
let nextId = 1;

// GET /api/tasks - Get all tasks
router.get('/', (req, res) => {
  res.json(tasks);
});

// POST /api/tasks - Create a new task
router.post('/', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Task text is required' });
  }
  const newTask = {
    id: nextId++,
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  const task = tasks.find(t => t.id === parseInt(id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (text !== undefined) task.text = text;
  if (completed !== undefined) task.completed = completed;
  res.json(task);
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
