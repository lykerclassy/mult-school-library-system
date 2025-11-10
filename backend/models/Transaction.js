import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Book',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // The Librarian or Admin who issued it
    },
    borrowedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnedDate: {
      type: Date,
      default: null, // Will be set when the book is returned
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'School',
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;