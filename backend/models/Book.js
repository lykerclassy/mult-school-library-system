import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    available: {
      type: Number,
      required: true,
      default: 1,
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

// A 'text' index allows us to easily search books by title or author
bookSchema.index({ title: 'text', author: 'text' });

const Book = mongoose.model('Book', bookSchema);
export default Book;