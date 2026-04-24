# Attendify 🎓

> Your classroom, online — a lightweight classroom management platform for teachers and students.

---

## What is Attendify?

Attendify is a full-stack web application built to replace physical classroom management. Teachers can manage classes, take attendance via QR code, create quizzes, and post announcements — all in one place. Students join with a class code and interact with everything from their own dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | SvelteKit 5 + Tailwind CSS |
| Backend | SvelteKit server routes + form actions |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel (recommended) |

---

## Features

### Authentication
- Sign up as a **Teacher** or **Student**
- Login / logout
- Role-based redirects (teachers → teacher dashboard, students → student dashboard)
- Profile name editing via avatar dropdown menu

### Teacher Features
- Create classes with auto-generated 6-character class codes
- Edit class name and description (Settings tab)
- Copy class code from Settings tab
- Post announcements to the class feed
- Edit and delete announcements
- Create quizzes with:
  - Multiple choice questions (auto-graded)
  - Short answer questions (manually reviewed)
  - Per-question point values
  - Deadlines
- View student submissions and answers
- Manually set final scores for short answer quizzes
- Generate QR code attendance sessions with:
  - Custom label
  - Start time
  - Duration (5, 10, 15, or 30 minutes)
  - Auto-expiry to prevent late check-ins
- View live list of students who scanned in
- View class roster (Students tab)
- Grades overview — full gradebook table per class
- Export attendance as CSV
- Export grades as CSV
- Auto-announcements when a quiz or attendance session is created

### Student Features
- Join classes via 6-character class code
- View all joined classes on dashboard
- Read class announcements
- Take quizzes before the deadline
- See auto-graded scores for multiple choice
- See final score once teacher grades short answers
- Mark attendance by scanning QR code or tapping "Mark me present"
- View personal attendance history

### Landing Page
- Public-facing dark landing page at `/`
- Redirects logged-in users to their dashboard automatically

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts              # Supabase client setup
│   └── components/
│       └── Navbar.svelte        # Shared navbar with profile dropdown
├── routes/
│   ├── +page.svelte             # Landing page
│   ├── +page.server.ts          # Root redirect logic
│   ├── +layout.svelte           # Root layout
│   ├── +layout.server.ts        # Session + role loader
│   ├── auth/callback/           # Supabase OAuth callback
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page (teacher or student)
│   ├── attend/[token]/          # QR attendance landing page
│   ├── dashboard/
│   │   ├── teacher/             # Teacher dashboard
│   │   └── student/             # Student dashboard
│   └── class/[id]/
│       ├── +page.svelte         # Class page (all tabs)
│       ├── +page.server.ts      # Class data + all form actions
│       └── quiz/[quizId]/       # Quiz taking / grading page
hooks.server.ts                  # Auth + role injection
app.d.ts                         # TypeScript types
```

---

## Database Tables

| Table | Description |
|---|---|
| `profiles` | User profiles with name and role (teacher/student) |
| `classes` | Classes created by teachers with unique codes |
| `class_members` | Students enrolled in classes |
| `announcements` | Posts made by teachers in a class |
| `quizzes` | Quizzes with titles, descriptions, deadlines |
| `questions` | Individual questions (MC or short answer) per quiz |
| `submissions` | Student quiz submissions with scores |
| `answers` | Individual answers per submission |
| `attendance_sessions` | QR attendance sessions with expiry |
| `attendance_records` | Individual student check-ins per session |

---

## Supabase Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database schema

Paste and run the full schema SQL in the Supabase SQL Editor. This creates all tables with proper relationships.

### 3. Run the RLS policies

Row Level Security is enabled on all tables. Run the RLS policy SQL to ensure users can only access data they're allowed to see.

### 4. Run the helper functions

The app uses several `security definer` SQL functions to safely query across tables without RLS recursion:

- `is_class_member(class_id)` — checks if current user is a member of a class
- `get_class_by_code(class_code)` — finds a class by its join code
- `get_class_students(p_class_id)` — returns all students in a class
- `get_attendance_records(p_session_id)` — returns attendance records for a session
- `get_quiz_submissions(p_quiz_id)` — returns all submissions for a quiz with student names
- `get_quiz_submission_answers(p_submission_id)` — returns answers for a submission
- `get_grades_overview(p_class_id)` — returns full gradebook data for a class

---

## Environment Variables

Create a `.env` file in the project root:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from **Supabase Dashboard → Project Settings → API**.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`

---

## Deploying to Vercel

1. Push the project to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set the environment variables:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects SvelteKit

---

## Key Design Decisions

**Why SvelteKit form actions instead of API routes?**
All mutations (create class, post announcement, submit quiz, etc.) use SvelteKit's built-in form actions. This means they work without JavaScript and the server always has the authenticated session available — solving the Supabase RLS auth issues that arise when using client-side inserts.

**Why `security definer` SQL functions?**
Supabase RLS policies can cause infinite recursion when a policy on table A references table B which has a policy referencing table A. Security definer functions run with elevated privileges and bypass this recursion cleanly.

**Why no separate backend?**
SvelteKit's `+page.server.ts` files act as the backend. All database queries happen server-side with the authenticated Supabase session, keeping credentials secure and eliminating the need for a separate Express/Node server.

---

## Pages Overview

| Route | Description |
|---|---|
| `/` | Landing page (redirects logged-in users) |
| `/login` | Login form |
| `/signup` | Signup with role selection |
| `/dashboard/teacher` | Teacher's class list + create class |
| `/dashboard/student` | Student's class list + join class |
| `/class/[id]` | Class page with all tabs |
| `/class/[id]/quiz/[quizId]` | Quiz taking (student) or grading (teacher) |
| `/attend/[token]` | QR attendance landing — marks student present |

---

## Tabs Inside a Class

| Tab | Who sees it | Description |
|---|---|---|
| Announcements | Everyone | Class feed with posts |
| Quizzes | Everyone | Quiz list — take or grade |
| Attendance | Everyone | QR sessions — generate or scan |
| Students | Everyone | Enrolled student roster |
| Grades | Teacher only | Full gradebook table |
| Settings | Teacher only | Edit class name, copy code |

---

## Notes for the New Owner

- The app uses **Supabase free tier** which has limits on database size and API calls. For production use with many classes and students, consider upgrading to Supabase Pro.
- QR codes are generated using the free [goqr.me API](https://goqr.me/api/). No API key needed.
- All CSV exports happen client-side — no server storage needed.
- The app is fully responsive and works on mobile browsers, which is important for students scanning QR codes.

---

*Built with SvelteKit + Supabase. Designed for real classrooms.*
