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
````

### 2\. Install Backend Dependencies

Open a terminal, navigate to the backend folder, and install packages:

```bash
cd backend
npm install
```

### 3\. Install Frontend Dependencies

Open a **new** terminal, navigate to the frontend folder, and install packages:

```bash
cd frontend
npm install
```

### 4\. Environment Configuration

Create a `.env` file inside the **`/backend`** folder and paste the following configuration:

```env
# Server Config
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/multischool_library

# Security
JWT_SECRET=my_super_secret_key_123

# Frontend Connection
CLIENT_URL=http://localhost:5173
```

> **Note:** You do not need to add API keys here. They are managed securely via the Developer Portal UI.

-----

## 🚀 Running the Application

You need to run the backend and frontend servers simultaneously.

**Terminal 1 (Backend):**

```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

-----

## 🧪 Testing Payment Webhooks (Locally)

To test M-Pesa payments on localhost, you must expose your server to the internet.

1.  **Install Ngrok:**

    ```bash
    npm install -g ngrok
    ```

2.  **Run Ngrok:**

    ```bash
    ngrok http 5000
    ```

3.  **Configure IntaSend:**

      * Copy the `https` URL provided by Ngrok.
      * Go to your **IntaSend Dashboard \> Settings \> Webhooks**.
      * Add this URL: `https://your-ngrok-url.app/api/v1/billing/webhook`

-----

## 🔮 Future Project Roadmap

We have established a solid core. The following features are planned for future updates:

1.  **AI Quiz Generation:** Integration with OpenAI/Gemini to auto-generate quizzes from topics.
2.  **Attendance Tracking:** Digital roll-call for teachers with daily reports.
3.  **Report Cards:** Automated PDF generation of end-of-term report cards.
4.  **Invoicing System:** Auto-generate tuition fee invoices for parents.
5.  **Real-time Chat:** WebSocket integration for Teacher-Student-Parent chat.
6.  **Biometric Integration:** Support for fingerprint scanners for library/attendance.

-----

**Author:** BRIAN MAKINI
**License:** MIT

```
```
