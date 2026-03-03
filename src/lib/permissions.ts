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
};
