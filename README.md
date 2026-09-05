# 🎓 ACADIFY – Smart Syllabus Management System for Teachers

### **Plan. Teach. Track. Complete.**

**ACADIFY** is a Smart Syllabus Management System designed primarily for teachers. It helps teachers organize their syllabus, divide it into modules and topics, estimate the number of classes required, plan their teaching schedule, track completed topics, and understand whether they are **ahead, on schedule, or behind** their planned syllabus.

---

## 👥 Team no 25

### Team Name

**[ctrl+v]**

### Team Members

| No. | Name           | 
| --- | -------------- | 
| 1   | **[Anusreya]** | 
| 2   | **[Heba ]**    | 
| 3   | **[Saniya]**   |

---

## 📌 Project Description

ACADIFY is a modern web application built to simplify **syllabus planning and teaching progress management for teachers**.

Teachers can enter their subject details, create modules and topics, estimate the classes required for each module, set a syllabus completion deadline, and define their weekly teaching capacity.

Based on this information, ACADIFY automatically calculates the teaching plan and compares the teacher's **expected progress with actual progress**.

The system also provides a Smart Planner that generates useful recommendations based on the teacher's real syllabus data, remaining topics, available time, and current progress.

---

# ❗ Problem Statement

Teachers often manage syllabus planning and teaching progress manually using notebooks, spreadsheets, or other disconnected methods.

This can make it difficult to:

* Organize large syllabi efficiently.
* Divide subjects into modules and topics.
* Estimate the number of classes required.
* Maintain a realistic teaching schedule.
* Track which topics have been completed.
* Know whether the syllabus is progressing as planned.
* Identify remaining topics and workload.
* Adjust the teaching plan when progress changes.

Therefore, there is a need for a **simple, centralized, and intelligent syllabus management system specifically designed for teachers**.

ACADIFY addresses this problem by combining **syllabus organization, teaching planning, progress tracking, and smart recommendations** in one platform.

---

# 🎯 Objectives

The main objectives of ACADIFY are:

* 📚 To help teachers organize their complete syllabus.
* 🗂️ To divide a syllabus into modules and topics.
* ⏱️ To estimate the classes required for each topic/module.
* 🗓️ To create a teaching plan based on available time.
* 📊 To track syllabus completion in real time.
* 📈 To compare expected and actual teaching progress.
* 🚦 To identify whether a teacher is **Ahead, On Schedule, or Behind**.
* 💡 To provide data-based teaching recommendations.
* ✏️ To allow teachers to edit their syllabus at any time.
* 📋 To generate detailed syllabus progress reports.
* 🎓 To provide a simple and modern teacher-focused interface.

---

# 💡 Proposed Solution

ACADIFY provides teachers with a complete workflow:

```text
Teacher Login
      ↓
Syllabus Setup
      ↓
Subject Details
      ↓
Add Modules
      ↓
Add Topics
      ↓
Estimate Classes
      ↓
Set Teaching Dates
      ↓
Automatic Syllabus Planning
      ↓
Teacher Dashboard
      ↓
Track Topics
      ↓
Record Classes
      ↓
Expected vs Actual Progress
      ↓
Smart Planner
      ↓
Reports
      ↓
Syllabus Completion
```

---

# ✨ Key Features

## 🔐 Teacher Login

* Teacher Name
* Email
* Password
* Remember Me
* Forgot Password
* Teacher account management
* First-login detection

---

## 📚 Syllabus Setup

Teachers can create their teaching plan by entering:

* Subject Name
* Subject Code
* Department
* Semester
* Academic Year
* Start Date
* Expected Completion Date
* Total Classes Available
* Classes Per Week

---

## 🗂️ Module & Topic Management

Teachers can:

* Add modules
* Edit modules
* Delete modules
* Add topics
* Edit topics
* Delete topics
* Set estimated classes
* Track topic completion

Example:

```text
Module 1 – Introduction to DBMS

✓ Database Concepts
✓ DBMS Architecture
✓ Data Models
□ Database Languages
□ Database Users
```

---

## 📊 Automatic Syllabus Planning

ACADIFY automatically calculates:

* Total Modules
* Total Topics
* Total Classes Required
* Available Weeks
* Classes Per Week
* Expected Weekly Progress

It generates a planned schedule based on the actual syllabus and teaching information entered by the teacher.

---

## 📈 Teacher Dashboard

The dashboard provides an overview of the teacher's syllabus.

Example:

```text
Subjects              1
Modules               5
Total Topics          24
Completed Topics      10
Remaining Topics      14
```

### Overall Syllabus Progress

```text
Progress: 42%

10 / 24 Topics Completed

Expected Progress: 50%
Actual Progress:   42%

Status: Behind Schedule
```

---

## 📝 Topic Tracking

Each topic contains:

* Topic name
* Estimated classes
* Completion status
* Completion date

Teachers can:

* Mark topics as completed.
* Mark topics as incomplete.
* Edit topics.
* Delete topics.

Progress is automatically updated when topic completion changes.

---

## 🗓️ Record Class

Teachers can record their teaching sessions.

### Information Recorded

* Subject
* Module
* Topic
* Class Date
* Number of Classes Used
* Notes

Example:

```text
Subject: DBMS
Module: 2
Topic: SQL Queries
Class Date: 10 September 2026
Classes Used: 1
Notes: Completed SELECT and WHERE clauses
```

---

# 📊 Expected vs Actual Progress

ACADIFY compares the teacher's planned syllabus progress with actual progress.

### Status Types

### 🟢 Ahead

Actual progress is greater than expected progress.

### 🔵 On Schedule

Actual progress is close to the expected progress.

### 🔴 Behind

Actual progress is significantly lower than expected progress.

This allows teachers to quickly understand their current teaching position.

---

# 🤖 Acadify Smart Planner

The **Acadify Smart Planner** provides recommendations based on the teacher's actual syllabus data.

Examples:

```text
💡 You have 8 topics remaining.

⚠ You are currently behind your planned schedule.

📚 Module 3 has the most remaining topics.

🎯 Try to complete 3 topics this week to get back on schedule.
```

Recommendations are based on:

* Remaining topics
* Completed topics
* Available teaching time
* Expected completion date
* Classes per week
* Current syllabus progress

The system does not generate random recommendations.

---

# ✏️ Edit Syllabus

Teachers can edit their syllabus after initial setup.

Editable information includes:

* Subject Name
* Subject Code
* Department
* Semester
* Academic Year
* Modules
* Module Names
* Topics
* Estimated Classes
* Start Date
* Expected Completion Date
* Total Classes Available
* Classes Per Week

After changes are saved, ACADIFY automatically recalculates the relevant syllabus information and progress.

---

# 📋 Reports

The Reports section provides:

* Teacher information
* Subject information
* Module-wise progress
* Topic-wise completion
* Expected progress
* Actual progress
* Classes completed
* Classes remaining
* Overall syllabus completion
* Current teaching status

Teachers can:

**Generate Report**

and

**Download Report**

---

# 👤 Teacher Profile

The profile section contains:

* Teacher Name
* Email
* Department
* Profile Photo

Teachers can:

* Edit Profile
* Change Password

---

# 🧭 Navigation

The application provides a responsive navigation sidebar:

```text
🏠 Dashboard
📚 Subjects
📖 Modules
📝 Topics
🗓 Record Class
📊 Progress
📋 Reports
✏️ Edit Syllabus
👤 Profile
🚪 Logout
```

The interface is designed to work across:

* 💻 Desktop
* 📱 Mobile
* 📲 Tablet

---

# 🛠️ Technologies Used

## Frontend

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **JavaScript**
* **HTML5**
* **CSS3**

## Backend

* **Python**
* **Flask**

## Database

* **MySQL**

## Tools & Platforms

* **Visual Studio Code**
* **Git**
* **GitHub**
* **npm**
* **Lovable**

---

# 🗄️ Database Design

The application is designed to work with a Python Flask + MySQL backend.

### Main Tables

#### `teachers`

```text
teacher_id
name
email
password
```

#### `subjects`

```text
subject_id
teacher_id
subject_name
subject_code
department
semester
academic_year
total_classes
classes_per_week
start_date
end_date
```

#### `modules`

```text
module_id
subject_id
module_number
module_name
estimated_classes
```

#### `topics`

```text
topic_id
module_id
topic_name
estimated_classes
completed
completed_date
```

#### `class_sessions`

```text
session_id
subject_id
topic_id
class_date
classes_used
notes
```

#### `syllabus_progress`

```text
progress_id
subject_id
expected_percentage
actual_percentage
status
last_updated
```

---

# 🔗 Project Links

## 🌐 Live Project

**[https://plan-teach-track.lovable.app]**


## 💻 GitHub Repository

**[https://github.com/anusreyashiju123-spec/plan-teach-track]**





The demonstration video showcases:

* Teacher login
* Syllabus setup
* Module creation
* Topic management
* Automatic planning
* Dashboard
* Topic tracking
* Class recording
* Expected vs actual progress
* Smart Planner
* Syllabus editing
* Reports

---

# 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/anusreyashiju123-spec/plan-teach-track.git
```

### 2. Navigate to the project

```bash
cd plan-teach-track
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173/
```

---

# 🔮 Future Enhancements

Future versions of ACADIFY can include:

* 🤖 AI-powered teaching recommendations
* 📱 Dedicated mobile application
* 🔔 Automated deadline reminders
* 📊 Advanced progress analytics
* 📅 Automatic timetable integration
* ☁️ Cloud-based deployment
* 📈 Teaching performance analytics
* 🔗 Integration with institutional academic systems
* 📄 Advanced report generation
* 🔐 Enhanced authentication and security

---

# 🎯 Expected Impact

ACADIFY aims to help teachers:

* Save time on syllabus planning.
* Maintain organized teaching records.
* Monitor syllabus completion easily.
* Identify schedule delays early.
* Make better teaching plans.
* Complete the syllabus within the planned academic period.

The system transforms syllabus management from a **manual tracking process into a structured and data-driven workflow**.

---

# 🏁 Conclusion

ACADIFY provides a centralized solution for teachers to **Plan, Teach, Track, and Complete** their syllabus efficiently.

By combining syllabus organization, module and topic management, teaching records, automatic progress calculation, expected-vs-actual analysis, and smart planning recommendations, ACADIFY helps teachers maintain better control over their academic schedule.

### **ACADIFY — Plan. Teach. Track. Complete.** 🎓

---

## 🙏 Acknowledgement

We sincerely thank our teachers, mentors, institution, and everyone who supported us during the development of this project.

---

## ⭐ Support the Project

If you find **ACADIFY** useful, consider giving the repository a ⭐ on GitHub.

**Made with ❤️ by Team[25]**
