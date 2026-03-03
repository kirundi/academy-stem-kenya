// ---------------------------------------------------------------------------
// Firestore collection names
// ---------------------------------------------------------------------------
export const Collections = {
  USERS: "users",
  COURSES: "courses",
  CLASSROOMS: "classrooms",
  ENROLLMENTS: "enrollments",
  SUBMISSIONS: "submissions",
  BADGES: "badges",
  SCHOOLS: "schools",
  NOTIFICATIONS: "notifications",
  ACTIVITIES: "activities",
  SETTINGS: "settings",
  INVITES: "invites",
  SESSIONS: "sessions",
  RATE_LIMITS: "rateLimits",
} as const;

// ---------------------------------------------------------------------------
// Route paths
// ---------------------------------------------------------------------------
export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  ONBOARDING: "/onboarding",
  REGISTER_TEACHER: "/register/teacher",
  AUTH_CHANGE_PASSWORD: "/auth/change-password",
  ACCEPT_INVITE: "/accept-invite",
  SCHOOL_ADMIN_PENDING: "/school/admin/pending",

  // Student
  STUDENT_DASHBOARD: "/school/student/dashboard",
  STUDENT_BADGES: "/school/student/badges",
  STUDENT_PORTFOLIO: "/school/student/portfolio",
  STUDENT_PROGRESS: "/school/student/progress",

  // Teacher
  TEACHER_DASHBOARD: "/school/teacher/dashboard",
  TEACHER_COURSES: "/school/teacher/courses",
  TEACHER_CLASSROOM: "/school/teacher/classroom",
  TEACHER_GRADING: "/school/teacher/grading",
  TEACHER_ANALYTICS: "/school/teacher/analytics",
  TEACHER_ENROLLMENT: "/school/teacher/enrollment",
  TEACHER_GROUPS: "/school/teacher/groups",
  TEACHER_CLASS_REVIEW: "/school/teacher/class-review",

  // Admin
  ADMIN_SETUP: "/admin/setup",
  ADMIN_PENDING: "/dashboard/pending",
  ADMIN_TEACHERS: "/dashboard/teachers",

  // Global Admin (Dashboard)
  GLOBAL_ADMIN: "/dashboard",
  GLOBAL_ADMIN_USERS: "/dashboard/users",
  GLOBAL_ADMIN_SCHOOLS: "/dashboard/schools",
  GLOBAL_ADMIN_CONTENT: "/dashboard/content",
  GLOBAL_ADMIN_SETTINGS: "/dashboard/settings",
  GLOBAL_ADMIN_AUDIT: "/dashboard/audit",
  GLOBAL_ADMIN_REPORTS: "/dashboard/reports",

  // School Admin
  SCHOOL_ADMIN: "/school/admin",
  SCHOOL_ADMIN_SETTINGS: "/school/admin/settings",
  SCHOOL_ADMIN_STUDENTS: "/school/admin/students",
  SCHOOL_ADMIN_TEACHERS: "/school/admin/teachers",
  SCHOOL_ADMIN_CLASSROOMS: "/school/admin/classrooms",
  SCHOOL_ADMIN_ANALYTICS: "/school/admin/analytics",
  SCHOOL_ADMIN_LIBRARY: "/school/admin/library",

  // Course Creator
  COURSE_CREATOR_STEP1: "/dashboard/courses/create/step1",
  COURSE_CREATOR_STEP2: "/dashboard/courses/create/step2",
  COURSE_CREATOR_STEP3: "/dashboard/courses/create/step3",
  COURSE_CREATOR_STEP4: "/dashboard/courses/create/step4",
  COURSE_CREATOR_PREVIEW: "/dashboard/courses/create/preview",
} as const;

// ---------------------------------------------------------------------------
// Role-based redirect mapping
// ---------------------------------------------------------------------------
export const RoleDashboardMap = {
  student: Routes.STUDENT_DASHBOARD,
  teacher: Routes.TEACHER_DASHBOARD,
  school_admin: Routes.SCHOOL_ADMIN,
  admin: Routes.GLOBAL_ADMIN,
  super_admin: Routes.GLOBAL_ADMIN,
} as const;

// ---------------------------------------------------------------------------
// Notification types
// ---------------------------------------------------------------------------
export const NotificationTypes = {
  COURSE_PUBLISHED: "course_published",
  SUBMISSION: "submission",
  GRADE: "grade",
  BADGE: "badge",
  ANNOUNCEMENT: "announcement",
} as const;
