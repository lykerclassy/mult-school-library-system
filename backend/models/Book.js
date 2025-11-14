// backend/models/Book.js

import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      unique: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    quantityAvailable: {
      type: Number,
      // --- THIS IS THE FIX: 'required: true' has been removed ---
    },
    // We'll add more fields later (e.g., category, borrowedBy)
  },
  {
    timestamps: true,
  }
);

// When creating a new book, set available quantity to total quantity
bookSchema.pre('save', function (next) {
  if (this.isNew) {
    this.quantityAvailable = this.quantity;
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);
export default Book;