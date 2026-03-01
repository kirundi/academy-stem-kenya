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
} as const;

// ---------------------------------------------------------------------------
// Route paths
// ---------------------------------------------------------------------------
export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  ONBOARDING: "/onboarding",
  REGISTER_TEACHER: "/register/teacher",

  // Student
  STUDENT_DASHBOARD: "/student/dashboard",
  STUDENT_BADGES: "/student/badges",
  STUDENT_PORTFOLIO: "/student/portfolio",
  STUDENT_PROGRESS: "/student/progress",

  // Teacher
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_COURSES: "/teacher/courses",
  TEACHER_CLASSROOM: "/teacher/classroom",
  TEACHER_GRADING: "/teacher/grading",
  TEACHER_ANALYTICS: "/teacher/analytics",
  TEACHER_ENROLLMENT: "/teacher/enrollment",
  TEACHER_GROUPS: "/teacher/groups",
  TEACHER_CLASS_REVIEW: "/teacher/class-review",

  // Admin
  ADMIN_SETUP: "/admin/setup",
  ADMIN_PENDING: "/admin/pending",
  ADMIN_TEACHERS: "/admin/teachers",

  // Global Admin
  GLOBAL_ADMIN: "/admin/global",
  GLOBAL_ADMIN_USERS: "/admin/global/users",
  GLOBAL_ADMIN_SCHOOLS: "/admin/global/schools",
  GLOBAL_ADMIN_CONTENT: "/admin/global/content",
  GLOBAL_ADMIN_SETTINGS: "/admin/global/settings",
  GLOBAL_ADMIN_AUDIT: "/admin/global/audit",
  GLOBAL_ADMIN_REPORTS: "/admin/global/reports",

  // School Admin
  SCHOOL_ADMIN: "/admin/school",
  SCHOOL_ADMIN_STUDENTS: "/admin/school/students",
  SCHOOL_ADMIN_TEACHERS: "/admin/school/teachers",
  SCHOOL_ADMIN_CLASSROOMS: "/admin/school/classrooms",
  SCHOOL_ADMIN_ANALYTICS: "/admin/school/analytics",
  SCHOOL_ADMIN_LIBRARY: "/admin/school/library",

  // Course Creator
  COURSE_CREATOR_STEP1: "/course-creator/step1",
  COURSE_CREATOR_STEP2: "/course-creator/step2",
  COURSE_CREATOR_STEP3: "/course-creator/step3",
  COURSE_CREATOR_STEP4: "/course-creator/step4",
  COURSE_CREATOR_PREVIEW: "/course-creator/preview",
} as const;

// ---------------------------------------------------------------------------
// Role-based redirect mapping
// ---------------------------------------------------------------------------
export const RoleDashboardMap = {
  student: Routes.STUDENT_DASHBOARD,
  teacher: Routes.TEACHER_DASHBOARD,
  school_admin: Routes.SCHOOL_ADMIN,
  admin: Routes.ADMIN_PENDING,
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
