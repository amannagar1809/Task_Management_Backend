const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const { auth, adminAuth } = require('../middleware/auth');

// GET /api/users - Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users - Add a new user (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ username, email, password, role: role || 'user' });
    await user.save();

    res.status(201).json({ id: user._id, username, email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id - Delete a user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    if (req.params.id === req.user._id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove tasks assigned to this user
    await Task.deleteMany({ assignedTo: req.params.id });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id/assign-task - Assign task to user (admin only)
router.put('/:id/assign-task', auth, adminAuth, async (req, res) => {
  try {
    const { taskId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.assignedTo = req.params.id;
    await task.save();

    res.json({ message: 'Task assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
