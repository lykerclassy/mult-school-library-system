// backend/services/cronJobs.js

import cron from 'node-cron';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Student from '../models/Student.js';

// This function finds and flags overdue books
const checkOverdueBooks = async () => {
  console.log('Running daily cron job: Checking for overdue books...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day

    // Find all transactions that are 'Issued' and whose due date is in the past
    const overdueTransactions = await Transaction.find({
      status: 'Issued',
      dueDate: { $lt: today },
    })
    .populate('book', 'title')
    .populate({
      path: 'student',
      populate: {
        path: 'userAccount',
        model: 'User'
      }
    });

    if (overdueTransactions.length === 0) {
      console.log('No overdue books found.');
      return;
    }

    // Process each overdue transaction
    for (const tx of overdueTransactions) {
      // 1. Update the transaction status
      tx.status = 'Overdue';
      await tx.save();

      // 2. Send a notification to the student
      if (tx.student.userAccount) {
        await Notification.create({
          user: tx.student.userAccount._id,
          school: tx.school,
          message: `Your book "${tx.book.title}" is now overdue. Please return it as soon as possible.`,
          link: '/my-books',
        });
      }
    }
    console.log(`Successfully processed ${overdueTransactions.length} overdue books.`);

  } catch (error) {
    console.error('Error in checkOverdueBooks cron job:', error);
  }
};

// --- The Cron Job Scheduler ---
const startCronJobs = () => {
  // This schedules the task to run once every day at 1:00 AM
  cron.schedule('0 1 * * *', checkOverdueBooks, {
    scheduled: true,
    timezone: "Africa/Nairobi", // Set to your server's timezone
  });

  console.log('Cron jobs scheduled...');
};

export { startCronJobs };