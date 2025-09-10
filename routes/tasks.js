const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

// GET /api/tasks - Get all tasks for logged-in user with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const tasks = await Task.find({ assignedTo: req.user._id })
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const count = await Task.countDocuments({ assignedTo: req.user._id });
    res.json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tasks/:id - Get task details
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and due date are required' });
    }
    const newTask = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      status: 'pending',
      assignedTo: req.user._id,
      createdBy: req.user._id
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, dueDate, status, priority } = req.body;
    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, assignedTo: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
