const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical', 'Billing', 'General Query', 'Feedback', 'Other'],
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Low',
  },
  status: {
    type: String,
    enum: ['Open', 'Pending', 'Resolved', 'Closed'],
    default: 'Open',
  },
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resolution: {
    type: String,
  },
  comments: [{
    text: {
      type: String,
      required: true,
    },
    commenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commentedAt: {
      type: Date,
      default: Date.now,
    },
  }],
});

module.exports = mongoose.model('Ticket', TicketSchema);
