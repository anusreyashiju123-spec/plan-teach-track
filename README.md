# Plan & Progress

Build a complete modern web application called ACADIFY.

Tagline:
“Plan. Teach. Track. Complete.”

Acadify is a Smart Syllabus Management System for Teachers. Its main purpose is to help teachers organize their syllabus, divide it into modules and topics, plan how many classes are needed, track teaching progress, and know whether they are ahead or behind schedule.

The website should be designed primarily for teachers.

1. Teacher Login Page

Create a professional teacher login page.

The page must have:

ACADIFY logo/name

Tagline: “Plan. Teach. Track. Complete.”

Teacher Name input

Email input

Password input

Remember Me checkbox

Forgot Password option

Login button

Example:

              ACADIFY
       Plan. Teach. Track. Complete.

Teacher Name
[ Enter your name ]

Email
[ Enter your email ]

Password
[ Enter your password ]

☐ Remember me       Forgot Password?

          [ LOGIN ]


The teacher's name, email and password should be properly connected to the teacher account.

After successful login:

If the teacher is logging in for the first time, show the Syllabus Setup page.

If the teacher has already completed setup, directly open the Main Dashboard.

2. First Login — Syllabus Setup

After the teacher logs in for the first time, show a setup page.

Title:

Set Up Your Syllabus

Subtitle:

“Let's create your teaching plan.”

Ask the teacher for the following details.

Subject Details

Subject Name

Subject Code

Department

Semester

Academic Year

Example:

Subject Name: Database Management System
Subject Code: CST301
Department: Computer Science
Semester: 3
Academic Year: 2026–27


3. Module Setup

Allow the teacher to enter their complete syllabus module by module.

For every module, ask for:

Module Number

Module Name

Topics

Estimated number of classes required

Example:

Module 1
Introduction to DBMS

Topics:
• Database Concepts
• DBMS Architecture
• Data Models
• Database Languages

Classes Required: 6


Add buttons:

+ Add Module

+ Add Topic

The teacher should be able to add multiple modules and multiple topics.

For example:

Module 1 → 6 classes
Module 2 → 8 classes
Module 3 → 10 classes
Module 4 → 7 classes
Module 5 → 9 classes


4. Teaching Time Details

Ask the teacher:

When do you want to finish the syllabus?

Include:

Start Date

Expected Completion Date

Also ask:

Total Classes Available

Classes Per Week

Example:

Start Date: 05 September 2026
Expected Completion Date: 20 December 2026
Total Classes Available: 40
Classes Per Week: 3


5. Automatic Syllabus Planning

After the teacher enters the syllabus and time information, automatically calculate:

Total Modules

Total Topics

Total Classes Required

Available Weeks

Classes Per Week

Expected Weekly Progress

Example:

Total Modules: 5
Total Topics: 24
Total Classes Required: 40
Available Weeks: 15
Classes Per Week: 3


Generate a simple planned schedule based on the entered information.

For example:

Week 1 → Module 1
Week 2 → Module 1
Week 3 → Module 2
Week 4 → Module 2
...


The calculations should be based on the actual data entered by the teacher.

6. Save Syllabus

At the bottom of the setup page add:

[ SAVE & GO TO DASHBOARD ]

When clicked:

Save teacher information.

Save subject information.

Save modules.

Save topics.

Save estimated class requirements.

Save start and completion dates.

Save classes per week.

Calculate syllabus progress.

Open the Main Dashboard.

7. Main Teacher Dashboard

Create the main dashboard after syllabus setup.

Header:

Welcome, [Teacher Name] 👋

Show summary cards:

Subjects
1

Modules
5

Total Topics
24

Completed Topics
0

Remaining Topics
24


Show a large:

Overall Syllabus Progress

0%

0 / 24 Topics Completed


Use a visual progress bar.

Also display:

Expected Progress: 10%
Actual Progress: 0%

Status: Behind Schedule


The expected progress should be calculated using the current date, start date and expected completion date.

8. Subject Section

Create a Subjects section.

Each subject should display:

Subject Name

Subject Code

Semester

Total Modules

Total Topics

Completed Topics

Remaining Topics

Progress Percentage

Expected Progress

Actual Progress

Status

Example:

Database Management System
CST301

Progress: 42%

Expected: 50%
Actual: 42%

Status: Behind Schedule


9. Module Progress

When the teacher opens a subject, show all modules.

Example:

Module 1
Introduction to DBMS

6 Topics
4 Completed
2 Remaining

Progress: 67%


Each module should have:

[ VIEW TOPICS ]

and

[ EDIT ]

buttons.

10. Topic Tracking

Inside each module, show all topics.

Example:

Module 1 – Introduction to DBMS

✓ Database Concepts
✓ DBMS Architecture
✓ Data Models
□ Database Languages
□ Database Users


Each topic should have:

Topic name

Estimated classes

Completed/Incomplete status

Completion date

Allow the teacher to:

Mark topic as completed

Mark topic as incomplete

Edit topic

Delete topic

When a topic is marked completed, automatically update the module and overall syllabus progress.

11. Record Class

Create a Record Class page.

The teacher can record what was taught.

Fields:

Subject

Module

Topic

Class Date

Number of Classes Used

Notes

Example:

Subject: DBMS
Module: 2
Topic: SQL Queries
Class Date: 10 September 2026
Classes Used: 1
Notes: Completed SELECT and WHERE clauses


After saving:

Update the teaching record.

Update completed topics where applicable.

Update syllabus progress.

12. Expected vs Actual Progress

Acadify must compare:

Expected Progress

with

Actual Progress

Use the syllabus dates and class plan to calculate expected progress.

Show three possible statuses:

Ahead

When actual progress is greater than expected progress.

On Schedule

When actual progress is close to expected progress.

Behind

When actual progress is significantly lower than expected progress.

Display the status clearly using a badge or indicator.

13. Acadify Smart Planner

Create a section called:

Acadify Smart Planner

This feature should give useful recommendations based on the teacher's actual syllabus data and progress.

Examples:

💡 You have 8 topics remaining.

⚠ You are currently behind your planned schedule.

📚 Module 3 has the most remaining topics.

🎯 Try to complete 3 topics this week to get back on schedule.


The recommendations should be generated from actual:

Remaining topics

Completed topics

Available time

Expected completion date

Classes per week

Current progress

Do not generate random recommendations.

14. Edit Syllabus

This is a very important feature.

Add an EDIT SYLLABUS option to the dashboard/sidebar.

When the teacher clicks it, open the same setup form with all previously entered information already filled in.

The teacher must be able to edit:

Subject Name

Subject Code

Department

Semester

Academic Year

Modules

Module Names

Topics

Estimated Classes

Start Date

Expected Completion Date

Total Classes Available

Classes Per Week

Buttons:

[ SAVE CHANGES ]

[ CANCEL ]

After saving changes, automatically recalculate:

Total modules

Total topics

Total classes

Expected progress

Actual progress

Remaining topics

Planned schedule

Current status

15. Edit Modules and Topics

Every module must have an Edit button.

Every topic must also have an Edit button.

Example:

Module 1
Introduction to DBMS

[ Edit Module ]

✓ Database Concepts       [ Edit ]
✓ DBMS Architecture      [ Edit ]
□ Database Languages     [ Edit ]


Allow:

Add Module

Edit Module

Delete Module

Add Topic

Edit Topic

Delete Topic

Before deleting anything, show a confirmation message.

16. Reports

Create a Reports page.

Show:

Teacher name

Subject information

Module-wise progress

Topic-wise completion

Expected progress

Actual progress

Classes completed

Classes remaining

Overall syllabus completion

Current status

Add:

[ GENERATE REPORT ]

and

[ DOWNLOAD REPORT ]

buttons.

17. Teacher Profile

Create a Teacher Profile page.

Show:

Teacher Name

Email

Department

Profile photo placeholder

Allow:

Edit Profile

Change Password

18. Navigation Sidebar

Create a responsive sidebar with:

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


The sidebar should work on desktop, tablet and mobile.

19. Database Structure

Design the application so it can later connect to our Python Flask + MySQL backend.

Use these main tables.

teachers

teacher_id
name
email
password


subjects

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


modules

module_id
subject_id
module_number
module_name
estimated_classes


topics

topic_id
module_id
topic_name
estimated_classes
completed
completed_date


class_sessions

session_id
subject_id
topic_id
class_date
classes_used
notes


syllabus_progress

progress_id
subject_id
expected_percentage
actual_percentage
status
last_updated


Use proper relationships between the tables.

20. UI/UX Design

Make Acadify look like a real modern teacher productivity application.

Use:

Clean professional academic design

Modern dashboard

Responsive layout

Attractive cards

Progress bars

Simple charts

Clear buttons

Good spacing

Easy-to-read typography

Consistent icons

Professional forms

Responsive mobile design

Empty-state messages

Confirmation dialogs

Keep the interface simple and easy for teachers to use.

21. Most Important User Journey

The website must feel like this:

                    ACADIFY
                       ↓
                TEACHER LOGIN
                       ↓
              Enter Name + Email
                  + Password
                       ↓
                  LOGIN
                       ↓
             FIRST LOGIN?
              ↙          ↘
            YES           NO
             ↓             ↓
      SYLLABUS SETUP    DASHBOARD
             ↓
       Subject Details
             ↓
        Add Modules
             ↓
         Add Topics
             ↓
      Add Class Details
             ↓
     Add Time & Deadline
             ↓
      Automatic Planning
             ↓
          SAVE
             ↓
       MAIN DASHBOARD
             ↓
      Track Syllabus
             ↓
       Record Classes
             ↓
      Mark Topics Done
             ↓
    Expected vs Actual
             ↓
      Smart Suggestions
             ↓
       Edit Anytime


Final Requirement

Do not make attendance, student monitoring, or parent monitoring the main purpose of Acadify.

The central purpose is:

Teacher → Syllabus → Modules → Topics → Classes → Progress → Smart Planning → Completion

Make sure that everything entered during the first setup can be viewed and edited later from the dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://plan-teach-track.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/019d893f-7d85-4f8c-9896-d7694c6e4ea3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
