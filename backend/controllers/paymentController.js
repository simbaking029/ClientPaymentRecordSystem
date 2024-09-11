const Payment = require('../models/Payment');
const User = require('../models/User');

// Get payments for the authenticated user
exports.getPayments = async (req, res) => {
  try {
    const user =await User.find({_id: req.user.id});
    if(user[0].role==='admin'){
        const payments = await Payment.aggregate([
            {
              $lookup: {
                from: "users",                // The collection to join with
                localField: "userId",         // The field from the payments collection
                foreignField: "_id",          // The field from the users collection
                as: "userInfo"                // The name of the field to add with joined data
              }
            },
            {
              $unwind: "$userInfo"             // Deconstruct the array from the previous stage
            },
            {
              $project: {                      // Specify the fields to include in the output
                _id: 1,
                userId: 1,
                amount: 1,
                proof: 1,
                date: 1,
                email: "$userInfo.email",     // Add email field from the joined data
                __v: 1
              }
            }
          ]);
        res.json(payments);
    } else {
        const payments = await Payment.find({ userId: req.user.id }); // Fetch payments for the logged-in user
        res.json(payments);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new payment
exports.createPayment = async (req, res) => {
    const { amount } = req.body; // Extract amount from the request body
    const proof = req.file.path; // Get the path of the uploaded file
    
    const payment = new Payment({
      userId: req.user.id, // Get user ID from the authenticated user
      amount,
      proof,
    });
    
    try {
      await payment.save();
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
};

// Edit payment
exports.editPayment = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPayment = await Payment.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating payment', error });
    }
  };

  // Delete payment
exports.deletePayment = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedPayment = await Payment.findByIdAndDelete(id);
      if (!deletedPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting payment', error });
    }
  };