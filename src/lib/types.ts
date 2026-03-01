export type UserRole = "student" | "teacher" | "school_admin" | "admin" | "super_admin";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string;
  role: UserRole;
  schoolId: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Student-specific
  xp?: number;
  level?: number;
  badges?: string[];
  skills?: Record<string, number>;
  // Teacher-specific
  subjects?: string[];
  department?: string;
}

export interface School {
  id: string;
  name: string;
  type: string;
  location: string;
  studentCount: number;
  status: "active" | "pending" | "review";
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
