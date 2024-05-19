const express = require('express');
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware'); 
const Ticket = require('../models/Ticket');
const User = require('../models/User'); 

const router = express.Router();

router.use(authMiddleware);

const ticketValidationRules = [
  check('title').not().isEmpty().withMessage('Title is required'),
  check('description').not().isEmpty().withMessage('Description is required'),
  check('category').not().isEmpty().withMessage('Category is required'),
  check('priority').isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority level'),
];

router.post('/', ticketValidationRules, async (req, res) => { 
  try {
    const { title, description, category, priority } = req.body;

    const newTicket = new Ticket({
      title,
      description,
      category,
      priority,
      submitter: req.user.id, 
        });

    const savedTicket = await newTicket.save();

    res.status(201).json(savedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    let tickets;
    if (req.user.isAdmin) {
      tickets = await Ticket.find().populate('submitter', 'username');
    } else {
      tickets = await Ticket.find({ submitter: req.user.id }).populate('submitter', 'username');
    }

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get('/activities', authMiddleware, async (req, res) => {
  try {
    let tickets = await Ticket.find().sort({ updatedAt: -1 });
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    tickets = tickets.filter(ticket => ticket.updatedAt >= weekAgo);

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const openTicketsCount = await Ticket.countDocuments({ status: 'Open' });
    const pendingTasksCount = await Ticket.countDocuments({ status: 'Pending' });
    const resolvedTicketsCount = await Ticket.countDocuments({ status: 'Closed' });
    const newTicketsTodayCount = await Ticket.countDocuments({ createdAt: { $gte: startOfToday } });

    const stats = {
      openTickets: openTicketsCount,
      pendingTasks: pendingTasksCount,
      resolvedTickets: resolvedTicketsCount,
      newTicketsToday: newTicketsTodayCount,
    };

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});



router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id); 
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    console.error(error);
    res.status(500).send('Server error');
  }
});




router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { comment, status } = req.body;
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const newComment = {
      text: comment,
      date: new Date(),
      commenter: req.user.id
    };

    ticket.comments.push(newComment);

    if (status === 'Pending') {
      ticket.status = 'Pending';
      ticket.updatedAt = new Date(); 
    }

    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.put('/:id/close', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    if (ticket.status === 'Closed') {
      return res.status(400).json({ msg: 'Ticket is already closed' });
    }

    ticket.status = 'Closed';
    ticket.updatedAt = new Date(); 

    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.put('/:id/resolved', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    if (ticket.status === 'Resolved') {
      return res.status(400).json({ msg: 'Ticket is already resolved' });
    }

    ticket.status = 'Resolved';
    ticket.updatedAt = new Date(); 

    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



module.exports = router;
