const express = require('express');
const router = express.Router();

const Project = require('../../models/Project');
const Task = require('../../models/Task');
const { authMiddleware } = require('../../utils/auth');

// All routes below require a valid JWT
router.use(authMiddleware);


// POST /api/projects — create a project owned by the logged-in user
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    // Ownership is set server-side from the token — client cannot fake this
    const project = await Project.create({
      user: req.user._id,
      name,
      description,
    });

    return res.status(201).json({ message: 'Project created.', project });

  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ message: 'Server error creating project.' });
  }
});


// GET /api/projects — return only projects owned by the logged-in user
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ count: projects.length, projects });

  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({ message: 'Server error fetching projects.' });
  }
});


// GET /api/projects/:id — get one project; must own it
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // .toString() needed because both values are ObjectIds, not plain strings
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this project.' });
    }

    return res.status(200).json({ project });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format.' });
    }
    console.error('Get project error:', error);
    return res.status(500).json({ message: 'Server error fetching project.' });
  }
});


// PUT /api/projects/:id — update a project; must own it
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this project.' });
    }

    const { name, description } = req.body;

    // Patch only the fields that were sent
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    const updated = await project.save();

    return res.status(200).json({ message: 'Project updated.', project: updated });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format.' });
    }
    console.error('Update project error:', error);
    return res.status(500).json({ message: 'Server error updating project.' });
  }
});


// DELETE /api/projects/:id — delete a project; must own it
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this project.' });
    }

    await project.deleteOne();

    return res.status(200).json({ message: 'Project deleted successfully.' });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format.' });
    }
    console.error('Delete project error:', error);
    return res.status(500).json({ message: 'Server error deleting project.' });
  }
});


// POST /api/projects/:projectId/tasks — add a task to a project; must own the project
router.post('/:projectId/tasks', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this project.' });
    }

    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    // Schema default ('To Do') applies if status is not provided
    const task = await Task.create({
      project: project._id,
      title,
      description,
      status,
    });

    return res.status(201).json({ message: 'Task created.', task });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format.' });
    }
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Server error creating task.' });
  }
});


// GET /api/projects/:projectId/tasks — get all tasks for a project; must own the project
router.get('/:projectId/tasks', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You do not own this project.' });
    }

    const tasks = await Task.find({ project: project._id }).sort({ createdAt: -1 });

    return res.status(200).json({ count: tasks.length, tasks });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID format.' });
    }
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Server error fetching tasks.' });
  }
});


module.exports = router;
