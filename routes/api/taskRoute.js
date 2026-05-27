
const express = require('express');
const router = express.Router();

const Task = require('../../models/Task');
const Project = require('../../models/Project');

const { authMiddleware } = require('../../utils/auth');


// Protect all routes with authentication middleware
router.use(authMiddleware);


//Put api/tasks/:id to update a task, description, or status

router.put('/:taskId', async (req, res) => {
    try {
        //Find the task by id
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        //Check if the user is the owner of the project
        if (project.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized', });
        }

        //all checks passed, update the task
        const { title, description, status } = req.body;

        //only update the fields that are provided in the request body
        if (title !== undefined) {
            task.title = title;
        }

        if (description !== undefined) {
            task.description = description;
        }

        if (status !== undefined) {
            task.status = status;
        }

        const updatedTask = await task.save();

        return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {

        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        if (error.name === 'castError') {
            return res.status(400).json({ message: 'Invalid project ID' });
        }
        console.error('Error updating task:', error);
        return res.status(500).json({ message: 'Server error updating task' });
    }
});


//delete api/tasks/:id to delete a task

router.delete('/:taskId', async (req, res) => {
    try {
        //Find the task by id
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        //Check if the user is the owner of the project
        if (project.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized', });
        }

        //ownership verified, delete the task
        await task.deleteOne();

        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        if (error.name === 'castError') {
            return res.status(400).json({ message: 'Invalid project ID' });
        }
        console.error('Error deleting task:', error);
        return res.status(500).json({ message: 'Server error deleting task' });
    }
});

module.exports = router;