# STEM Impact Academy Kenya — Full Wireframe

> ASCII wireframes for every page/route in the webapp.
> Color palette: Dark green `#10221c` bg, Primary green `#13eca4`, Cyan `#13daec`, Red `#ff4d4d`

---

## Table of Contents

1. [Public Pages](#1-public-pages)
2. [Authentication Pages](#2-authentication-pages)
3. [Student Area](#3-student-area)
4. [Teacher Area](#4-teacher-area)
5. [Course Creator](#5-course-creator)
6. [School Admin Area](#6-school-admin-area)
7. [Global Admin Area](#7-global-admin-area)

---

## 1. Public Pages

### 1.1 Landing Page `/`

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]   Solutions  Curriculum  Educators  About  Help  Contact   │
│                                                  [Login] [Get Started] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   HERO SECTION                                                      │
│  ┌─────────────────────────────────┐  ┌──────────────────────┐      │
│  │  "Build Future-Ready            │  │  ┌────────────────┐  │      │
│  │   Digital Skills"               │  │  │  Skills Mastery │  │      │
│  │                                 │  │  │   Radar Chart   │  │      │
│  │  Empowering schools across      │  │  │  ◇ Coding       │  │      │
│  │  Kenya with hands-on STEM       │  │  │  ◇ Robotics     │  │      │
│  │  education.                     │  │  │  ◇ Web Lit      │  │      │
│  │                                 │  │  │  ◇ Circuitry    │  │      │
│  │  [Get Started] [Learn More]     │  │  │  ◇ Green Tech   │  │      │
│  └─────────────────────────────────┘  │  └────────────────┘  │      │
│                                       │  🏆 🔬 ⚡ badges     │      │
│                                       └──────────────────────┘      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   3-STEP IMPLEMENTATION                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐              │
│  │  ① School     │ │  ② Teacher    │ │  ③ Student     │              │
│  │   Onboarding  │ │   Setup       │ │   Learning     │              │
│  │               │ │               │ │                │              │
│  │  Register &   │ │  Set up       │ │  Students join │              │
│  │  verify your  │ │  classrooms & │ │  with codes &  │              │
│  │  school       │ │  assign       │ │  start earning │              │
│  │               │ │  courses      │ │  badges        │              │
│  └───────────────┘ └───────────────┘ └───────────────┘              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   LESSONS IN ACTION                                                 │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  Mock Live Lesson UI                                    │        │
│  │  ┌──────────────────────┐  ┌─────────────────────────┐  │        │
│  │  │  JavaScript Chatbot  │  │  // Code Preview         │  │        │
│  │  │  Demo                │  │  function greet() {      │  │        │
│  │  │                      │  │    return "Hello!";      │  │        │
│  │  │  💬 Chat interface   │  │  }                       │  │        │
│  │  └──────────────────────┘  └─────────────────────────┘  │        │
│  └─────────────────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   GOOGLE CLASSROOM INTEGRATION                                      │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  Sync visual — classroom integration diagram            │        │
│  └─────────────────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   RECOGNIZED ACHIEVEMENT SYSTEM                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  🏅 Badge 1  │  │  🏅 Badge 2  │  │  🏅 Badge 3  │               │
│  │  "Explorer"  │  │  "Creator"   │  │  "Innovator"  │              │
│  │  description │  │  description │  │  description  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   SCHOOL REGISTRATION CTA                                           │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │  "Register Your School"                                 │        │
│  │  ┌─────────────┐ ┌─────────────┐                        │        │
│  │  │ First Name  │ │ Last Name   │                        │        │
│  │  ├─────────────┤ ├─────────────┤                        │        │
│  │  │ Work Email  │ │ School Name │                        │        │
│  │  ├─────────────┤                                        │        │
│  │  │ Role ▼      │                                        │        │
│  │  └─────────────┘                                        │        │
│  │                        [Register School →]              │        │
│  └─────────────────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                             │
│  Platform        Company         Legal                              │
│  · Solutions     · About Us      · Privacy Policy                   │
│  · Curriculum    · Contact       · Terms of Service                 │
│  · Educators     · Help                                             │
│                                  © STEM Impact Academy Kenya        │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 About Page `/about`

```
┌─────────────────────────────────────────────────────────────────────┐
│  [PublicNavbar]                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   HERO                                                              │
│   "About STEM Impact Academy"                                       │
│   Subtitle text about the mission                                   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   MISSION & VISION                                                  │
│  ┌────────────────────────────┐  ┌────────────────────────────┐     │
│  │  🎯 Our Mission            │  │  🔭 Our Vision             │     │
│  │                            │  │                            │     │
│  │  Empower Kenya's youth     │  │  A future where every      │     │
│  │  with future-ready digital │  │  Kenyan student has access  │     │
│  │  skills through hands-on   │  │  to world-class STEM       │     │
│  │  STEM education            │  │  education                 │     │
│  └────────────────────────────┘  └────────────────────────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   IMPACT NUMBERS                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  500+    │ │  2,000+  │ │  50,000+ │ │  27,000+ │               │
│  │  Schools │ │ Educators│ │ Students │ │  Badges  │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   JOIN OUR MISSION CTA                                              │
│   "Ready to transform STEM education?"                              │
│   [Get Started]                                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  [Footer]                                                           │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Other Public Pages

```
/educators    — PublicNavbar + educator-focused content + CTA + Footer
/contact      — PublicNavbar + contact form / info + Footer
/help         — PublicNavbar + FAQ / help articles + Footer
/privacy      — PublicNavbar + privacy policy text + Footer
/terms        — PublicNavbar + terms of service text + Footer
```

---

## 2. Authentication Pages

### 2.1 Login `/login`

```
┌─────────────────────────────────────────────────────────────────────┐
│                        [StemLogo]                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────┐                       │
│   │         "Welcome Back"                  │                       │
│   │                                         │                       │
│   │   [Student ●] [Email/Password ○]        │  ← Toggle             │
│   │                                         │                       │
│   │   ── STUDENT MODE ──                    │                       │
│   │   Enter your class join code:           │                       │
│   │   ┌───┬───┬───┐ — ┌───┬───┬───┐        │                       │
│   │   │ A │ B │ C │   │ D │ E │ F │        │                       │
│   │   └───┴───┴───┘   └───┴───┴───┘        │                       │
│   │                                         │                       │
│   │   ┌─────────────────────────────┐       │                       │
│   │   │ ✅ Class Found!             │       │  ← Result card        │
│   │   │ "Web Design — Grade 8"     │       │                       │
│   │   │ Teacher: Jane Doe          │       │                       │
│   │   │ [Confirm Enrollment]       │       │                       │
│   │   └─────────────────────────────┘       │                       │
│   │                                         │                       │
│   │   ── or ──                              │                       │
│   │   [Continue with Google Classroom]      │                       │
│   │                                         │                       │
│   │   ── EMAIL MODE ──                      │                       │
│   │   ┌─────────────────────────────┐       │                       │
│   │   │ Email                       │       │                       │
│   │   ├─────────────────────────────┤       │                       │
│   │   │ Password              👁    │       │                       │
│   │   └─────────────────────────────┘       │                       │
│   │   Forgot password? →                    │                       │
│   │   [Sign In]                             │                       │
│   │                                         │                       │
│   │   Don't have an account?                │                       │
│   │   Register as Teacher →                 │                       │
│   │   Register your School →                │                       │
│   └─────────────────────────────────────────┘                       │
│                                                                     │
│   Privacy Policy · Terms of Service · Contact Support               │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Teacher Registration `/register/teacher`

```
┌─────────────────────────────────────────────────────────────────────┐
│                        [StemLogo]                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Step:  [① Personal ●]──[② School ○]──[③ Subjects ○]              │
│                                                                     │
│   ── STEP 1: Personal Info ──                                       │
│   ┌──────────────────┐  ┌──────────────────┐                        │
│   │ First Name       │  │ Last Name        │                        │
│   ├──────────────────┤  └──────────────────┘                        │
│   │ Email            │                                              │
│   ├──────────────────┤  ┌──────────────────┐                        │
│   │ Password         │  │ Confirm Password │                        │
│   └──────────────────┘  └──────────────────┘                        │
│                                           [Next →]                  │
│                                                                     │
│   ── STEP 2: School Info ──                                         │
│   ┌──────────────────┐  ┌──────────────────┐                        │
│   │ School Name      │  │ City / County    │                        │
│   ├──────────────────┤  └──────────────────┘                        │
│   │ Role ▼           │                                              │
│   │ · Teacher        │                                              │
│   │ · Dept Head      │                                              │
│   │ · School Admin   │                                              │
│   │ · After-School   │                                              │
│   │ · Community Ed   │                                              │
│   └──────────────────┘                                              │
│                                    [← Back] [Next →]                │
│                                                                     │
│   ── STEP 3: Subject Selection ──                                   │
│   Select your subjects:                                             │
│   ┌───────────┐ ┌───────────┐ ┌─────────────┐ ┌───────────┐        │
│   │ Circuitry │ │  Coding   │ │ Game Design │ │ Web Lit   │        │
│   │    ☑      │ │    ☑      │ │     ☐       │ │    ☑      │        │
│   ├───────────┤ ├───────────┤ ├─────────────┤ └───────────┘        │
│   │ Green Tech│ │ Robotics  │ │Cybersecurity│                       │
│   │    ☐      │ │    ☑      │ │     ☐       │                       │
│   └───────────┘ └───────────┘ └─────────────┘                       │
│                                    [← Back] [Register →]            │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 School Onboarding `/onboarding`

```
┌─────────────────────────────────────────────────────────────────────┐
│                        [StemLogo]                                    │
├─────────────────────────────────────────────────────────────────────┤
│   Progress: [① School Info ●]──[② Admin Account ○]──[③ Review ○]   │
│                                                                     │
│   Section 01 — School Details                                       │
│   ┌──────────────────────────┐  ┌──────────────────────────┐        │
│   │ School Name *            │  │ School Type ▼            │        │
│   └──────────────────────────┘  │ · Public                 │        │
│   ┌──────────────────────────┐  │ · Private                │        │
│   │ Campus Location          │  │ · Community              │        │
│   └──────────────────────────┘  │ · Afterschool            │        │
│   ┌──────────────────────────┐  │ · NGO                    │        │
│   │ Estimated Students ▼    │  └──────────────────────────┘        │
│   │ · 1-50 / 51-200 / ...   │                                      │
│   └──────────────────────────┘                                      │
│                                                                     │
│   Section 02 — Administrator Account                                │
│   ┌──────────────────────────┐  ┌──────────────────────────┐        │
│   │ Full Name *              │  │ Role / Designation       │        │
│   ├──────────────────────────┤  ├──────────────────────────┤        │
│   │ Contact Number (+254)    │  │ Email *                  │        │
│   ├──────────────────────────┤  ├──────────────────────────┤        │
│   │ Password *               │  │ Confirm Password *       │        │
│   └──────────────────────────┘  └──────────────────────────┘        │
│                                                                     │
│                              [Submit Registration →]                │
│                                                                     │
│   ── POST-SUBMIT STATE ──                                           │
│   ┌─────────────────────────────────────────────┐                   │
│   │  ✅ Registration Received                    │                   │
│   │  Your application is under review.           │                   │
│   │  Expected turnaround: 24-48 hours            │                   │
│   │                                              │                   │
│   │  School: ABC Academy                         │                   │
│   │  Admin: John Doe                             │                   │
│   │  Email: john@school.com                      │                   │
│   │                                              │                   │
│   │  [Edit Application]  [Back to Home]          │                   │
│   └─────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.4 Forgot & Reset Password

```
/forgot-password                          /reset-password
┌──────────────────────────────┐         ┌──────────────────────────────┐
│       [StemLogo]             │         │       [StemLogo]             │
│                              │         │                              │
│  "Forgot Password"          │         │  "Reset Password"            │
│                              │         │                              │
│  ┌────────────────────────┐  │         │  ┌────────────────────────┐  │
│  │ Email                  │  │         │  │ New Password           │  │
│  └────────────────────────┘  │         │  ├────────────────────────┤  │
│  [Send Reset Link]          │         │  │ Confirm Password       │  │
│                              │         │  └────────────────────────┘  │
│  ── SUCCESS STATE ──        │         │  [Reset Password]            │
│  📧 Check Your Email        │         │                              │
│  We sent a reset link to    │         │  ← Back to Login             │
│  your email.                │         │                              │
│                              │         │                              │
│  ← Back to Login            │         │                              │
└──────────────────────────────┘         └──────────────────────────────┘
```

### 2.5 Admin Pending `/admin/pending`

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Verification Timeline                                             │
│   ① Application Submitted ✅                                        │
│   ② Initial Screening ⏳ (in progress)                              │
│   ③ Manual Verification ○                                           │
│   ④ Dashboard Access ○                                              │
│                                                                     │
│   ┌─────────────────────────────────────────┐                       │
│   │  School Profile Summary                 │                       │
│   │  School: ABC Academy                    │                       │
│   │  Type: Private                          │                       │
│   │  Location: Nairobi                      │                       │
│   │  Admin: John Doe                        │                       │
│   │  Status: Under Review                   │                       │
│   └─────────────────────────────────────────┘                       │
│                                                                     │
│   [Edit Application]   [← Back to Form]                             │
└─────────────────────────────────────────────────────────────────────┘
```
