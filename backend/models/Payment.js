const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  proof: { type: String, required: true }, // URL or path to the proof of payment
});

module.exports = mongoose.model('Payment', paymentSchema);