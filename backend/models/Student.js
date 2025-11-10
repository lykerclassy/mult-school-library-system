import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      // We'll need a way to make this unique *per school*,
      // which we'll handle in the controller logic.
    },
    class: {
      type: String,
      required: true,
    },
    stream: {
      type: String,
    },
    dorm: {
      type: String,
    },
    parentPhone: {
      type: String,
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

// Ensure studentId is unique within a specific school
studentSchema.index({ studentId: 1, school: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;