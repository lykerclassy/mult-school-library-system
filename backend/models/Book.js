// backend/models/Book.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // <-- 1. IMPORT

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
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    classLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassLevel',
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.pre('save', function (next) {
  if (this.isNew) {
    this.quantityAvailable = this.quantity;
  }
  next();
});

bookSchema.plugin(mongoosePaginate); // <-- 2. APPLY PLUGIN

const Book = mongoose.model('Book', bookSchema);
export default Book;