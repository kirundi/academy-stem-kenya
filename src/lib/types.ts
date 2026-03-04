import type { Permission } from "@/lib/permissions";

export type UserRole =
  | "student"
  | "teacher"
  | "school_admin"
  | "editor"
  | "admin"
  | "super_admin"
  // Extended roles
  | "parent"           // linked to one or more students; read-only child progress
  | "support"          // platform helpdesk; read-only across all data
  | "observer"         // external viewer (ministry/NGO); read-only on assigned schools
  | "content_reviewer" // reviews & approves/rejects content before publishing
  | "analytics_viewer" // read-only access to platform-wide analytics
  | "mentor";          // challenge judge; reviews/grades submissions for assigned challenges

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string;
  role: UserRole;
  schoolId: string | null;
  requiresPasswordChange?: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Permissions & multi-school scoping
  permissions?: Permission[];
  schoolIds?: string[];
  // Student-specific
  studentCode?: string;
  age?: number;
  grade?: string;
  classroomIds?: string[];
  xp?: number;
  level?: number;
  badges?: string[];
  skills?: Record<string, number>;
  // Teacher-specific
  subjects?: string[];
  department?: string;
  // Multi-role: secondary roles granted in addition to the primary role
  additionalRoles?: UserRole[];
  // Parent-specific: UIDs of linked student accounts
  childIds?: string[];
  // Mentor-specific: challenge IDs this mentor is assigned to judge
  assignedChallengeIds?: string[];
}

export interface School {
  id: string;
  name: string;
  type: string;
  location: string;
  studentCount: number;
  status: "active" | "pending" | "review" | "rejected" | "suspended";
  plan: "premium" | "standard" | "community";
  healthScore: number;
  adminId: string;
  createdAt: Date;
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: string;
  joinCode: string;
  schoolId: string;
  teacherId: string;
  enrolled: number;
  capacity: number;
  avgProgress: number;
  courseIds: string[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  color: string;
  icon: string;
  totalLessons: number;
  createdBy: string;
  schoolId: string | null;
  targetGrade?: string;
  estimatedDuration?: string;
  coverImageUrl?: string;
  badgeId?: string;
  // Content review workflow
  status?: "draft" | "pending_review" | "published";
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewFeedback?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: "Video" | "Reading" | "Hands-on" | "Project" | "Quiz" | "Reflection" | "Submit";
  duration: string;
  order: number;
  content: string;
  blocks: LessonBlock[];
}

export interface LessonBlock {
  type: "text" | "image" | "video" | "task";
  content: string;
  url?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  classroomId: string;
  courseId: string;
  progress: number;
  completedLessons: number;
  startedAt: Date;
}

export interface Submission {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  classroomId: string;
  status: "pending" | "graded" | "draft";
  grade: string | null;
  score: number | null;
  content: string;
  fileUrl: string | null;
  submittedAt: Date | null;
  feedback: string | null;
  rubricScores: Record<string, number>;
  gradedBy: string | null;
  gradedAt: Date | null;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpValue: number;
  requirement: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  icon: string;
  scope: "global" | "school";
  schoolId: string | null;
  createdBy: string;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
}

export interface ChallengeEnrollment {
  id: string;
  challengeId: string;
  classroomId: string;
  classroomName: string;
  enrolledBy: string; // teacher uid
  lateAccess: boolean;
  enrolledAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  schoolId?: string;
  type: string;
  description: string;
  courseId?: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: string;
}

export interface InviteRecord {
  id: string; // Firestore doc ID = sha256(token)
  email: string;
  displayName: string;
  role: UserRole;
  schoolId: string | null;
  invitedBy: string; // UID of admin who sent it
  invitedAt: Date;
  expiresAt: Date;
  status: "pending" | "accepted" | "expired";
  permissions?: Permission[];
  schoolIds?: string[];
}

export interface SessionRecord {
  id: string;
  uid: string;
  createdAt: Date;
  expiresAt: Date;
  lastSeenAt: Date;
  ip: string;
  device: string;
}

export interface PlatformSettings {
  siteName: string;
  supportEmail: string;
  platformUrl: string;
  features: {
    studentRegistration: boolean;
    googleClassroomSync: boolean;
    publicCourseLibrary: boolean;
  };
  updatedAt: Date;
  updatedBy: string;
}
