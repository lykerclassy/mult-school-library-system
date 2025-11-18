# ScholarlyFlow - Unified School Management & Library SaaS

**ScholarlyFlow** is a robust, multi-tenant SaaS (Software as a Service) platform designed to streamline school operations. It provides a centralized "Control Tower" for developers to manage multiple schools, while offering dedicated, feature-rich portals for School Administrators, Librarians, Teachers, Students, and Parents.

This system automates academic processes, library management, financial billing via M-Pesa, and school-wide communication.

---

## 🚀 Features Overview

### 1. Developer Portal (Super Admin)
* **School Management:** Register, activate, suspend, and delete tenant schools.
* **SaaS Billing:** Create subscription plans (Basic, Premium) and track revenue.
* **System Configuration:** Manage API keys (Cloudinary, OpenAI, IntaSend, SMTP) securely.
* **Audit & Security:** View global activity logs and email/SMS delivery reports.

### 2. School Admin Portal
* **User Management:** Create and manage accounts for all school staff and students.
* **Academic Structure:** Manage classes (Forms/Grades) and subjects.
* **Subscription:** Upgrade school plans via M-Pesa (STK Push).
* **Timetables:** Create and manage class schedules.

### 3. Librarian Portal
* **Inventory:** Add, edit, and track library books.
* **Transactions:** Issue and return books with automatic stock updates.
* **Smart Tools:** QR Code scanner for fast processing and automatic fine calculation.

### 4. Teacher Portal
* **Assignments:** Create assignments with due dates and attachments.
* **Grading:** View submissions, grade work, and provide feedback.
* **Quiz Builder:** Create rich-text quizzes with math equation support.

### 5. Student Portal
* **LMS Dashboard:** View assignments, borrowed books, and announcements.
* **Submission:** Upload homework files (PDF/Docx) directly.
* **Online Quizzes:** Take exams online and view results.

---

## 🛠 Technology Stack

* **Frontend:** React (Vite), Tailwind CSS, TanStack Query, SunEditor.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB (Mongoose ODM).
* **Integrations:** Cloudinary (Files), IntaSend (Payments), Africa's Talking (SMS), Nodemailer (Email).

---

## ⚙️ Installation & Setup Guide

Follow these commands to set up the project on your local machine.

### 1. Clone the Repository
Run this command in your terminal:

```bash
git clone [https://github.com/yourusername/scholarlyflow.git](https://github.com/yourusername/scholarlyflow.git)
cd scholarlyflow
