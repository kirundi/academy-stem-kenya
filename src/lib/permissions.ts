export const ALL_PERMISSIONS = [
  "manage_users",
  "manage_schools",
  "invite_users",
  "view_analytics",
  "manage_courses",
  "manage_challenges",
  "manage_classrooms",
  "manage_students",
  "grade_submissions",
  "manage_settings",
  "sync_google",
  // Extended-role permissions
  "view_student_progress", // read a linked student's enrollments, grades, badges
  "review_content",        // approve or reject courses/lessons pending review
  "view_support_data",     // read any user, school, or classroom record (support access)
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

/** Default permissions granted to each role. */
export const ROLE_DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  student: [],
  teacher: [
    "manage_classrooms",
    "manage_students",
    "grade_submissions",
    "manage_courses",
    "sync_google",
  ],
  school_admin: [
    "manage_classrooms",
    "manage_students",
    "grade_submissions",
    "manage_courses",
    "invite_users",
    "view_analytics",
    "sync_google",
  ],
  // Editor: content-creation role. Creates and maintains courses, lessons, and challenges.
  // No access to users, schools, classrooms, or student data.
  editor: [
    "manage_courses",
    "manage_challenges",
    "view_analytics",
  ],
  // Parent: read-only view of their linked children's progress, grades, and badges.
  parent: [
    "view_student_progress",
  ],
  // Support: read-only access to any platform data for troubleshooting. Cannot mutate anything.
  support: [
    "view_support_data",
    "view_student_progress",
    "view_analytics",
  ],
  // Observer: read-only view of assigned schools' aggregate data (ministry/NGO/inspector).
  observer: [
    "view_analytics",
  ],
  // Content Reviewer: approves or rejects courses and lessons submitted for review.
  // Cannot create content — that belongs to editor.
  content_reviewer: [
    "review_content",
    "view_analytics",
  ],
  // Analytics Viewer: platform-wide read-only analytics. No PII, no management actions.
  analytics_viewer: [
    "view_analytics",
  ],
  // Mentor: external challenge judge. Can review and grade submissions for assigned challenges.
  mentor: [
    "grade_submissions",
    "view_student_progress",
  ],
  admin: [
    "manage_users",
    "manage_schools",
    "invite_users",
    "view_analytics",
    "manage_courses",
    "manage_challenges",
    "manage_classrooms",
    "manage_students",
    "grade_submissions",
    "sync_google",
  ],
  super_admin: [...ALL_PERMISSIONS],
};

/** Resolve a user's effective permissions from explicit overrides or role defaults. */
export function resolvePermissions(role: string, explicit?: Permission[]): Permission[] {
  return explicit ?? ROLE_DEFAULT_PERMISSIONS[role] ?? [];
}

/** Human-readable labels for the permissions management UI. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_users: "Manage Users",
  manage_schools: "Manage Schools",
  invite_users: "Invite Users",
  view_analytics: "View Analytics",
  manage_courses: "Manage Courses",
  manage_challenges: "Manage Challenges",
  manage_classrooms: "Manage Classrooms",
  manage_students: "Manage Students",
  grade_submissions: "Grade Submissions",
  manage_settings: "Platform Settings",
  sync_google: "Google Classroom Sync",
  view_student_progress: "View Student Progress",
  review_content: "Review Content",
  view_support_data: "View Support Data",
};

/** Descriptions for tooltips in the permissions management UI. */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  manage_users: "Change user roles, delete users, and view all platform users",
  manage_schools: "Create, approve, reject, and manage schools",
  invite_users: "Send invite links to bring new users onto the platform",
  view_analytics: "Access dashboard analytics, reports, and audit logs",
  manage_courses: "Create, edit, and delete courses",
  manage_challenges: "Create and manage student challenges",
  manage_classrooms: "Create classrooms, manage enrollment",
  manage_students: "Add and edit student accounts",
  grade_submissions: "Review and grade student submissions",
  manage_settings: "Modify platform-wide settings",
  sync_google: "Import classrooms and students from Google Classroom",
  view_student_progress: "View linked student enrollments, grades, and badges",
  review_content: "Approve or reject courses and lessons submitted for review",
  view_support_data: "Read-only access to any user, school, or classroom record for support",
};
