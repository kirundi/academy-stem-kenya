/**
 * Database seed script — Run with: npx tsx src/lib/seed.ts
 *
 * Seeds Firestore with sample data matching the original mock data.
 * Only run once or clear the collections first.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

async function seed() {
  console.log("🌱 Seeding Firestore...");

  // 1. Schools
  const schools = [
    { name: "Roosevelt STEM Academy", type: "Public School", location: "Nairobi, Kenya", studentCount: "201–500", status: "active", plan: "premium", healthScore: 92 },
    { name: "Nairobi Junior Academy", type: "Private School", location: "Nairobi, Kenya", studentCount: "51–200", status: "active", plan: "standard", healthScore: 88 },
    { name: "Mombasa Tech High", type: "Public School", location: "Mombasa, Kenya", studentCount: "201–500", status: "active", plan: "premium", healthScore: 85 },
    { name: "Kisumu Innovation Hub", type: "Community Center", location: "Kisumu, Kenya", studentCount: "51–200", status: "active", plan: "community", healthScore: 76 },
    { name: "Nakuru STEM Center", type: "NGO / Non-Profit", location: "Nakuru, Kenya", studentCount: "1–50", status: "active", plan: "community", healthScore: 71 },
    { name: "Eldoret Digital Academy", type: "Private School", location: "Eldoret, Kenya", studentCount: "51–200", status: "review", plan: "standard", healthScore: 0 },
  ];

  const schoolRefs: Record<string, string> = {};
  for (const s of schools) {
    const ref = await db.collection("schools").add({
      ...s,
      adminId: "",
      createdAt: FieldValue.serverTimestamp(),
    });
    schoolRefs[s.name] = ref.id;
    console.log(`  ✅ School: ${s.name}`);
  }

  // 2. Courses
  const courses = [
    { title: "Intro to Circuitry", category: "Circuitry", description: "Learn the fundamentals of electronic circuits, from basic components to building your first circuit.", difficulty: "Beginner", color: "#13eca4", icon: "electrical_services", totalLessons: 12 },
    { title: "Game Design with Scratch", category: "Game Design", description: "Create interactive games using Scratch. Learn about sprites, events, and game loops.", difficulty: "Beginner", color: "#f59e0b", icon: "sports_esports", totalLessons: 14 },
    { title: "Python Basics", category: "Coding", description: "Start your coding journey with Python. Variables, loops, functions, and more.", difficulty: "Beginner", color: "#3b82f6", icon: "code", totalLessons: 16 },
    { title: "Sensor Calibration Lab", category: "Robotics", description: "Calibrate and program sensors for robotics applications.", difficulty: "Intermediate", color: "#8b5cf6", icon: "sensors", totalLessons: 8 },
    { title: "Intro to Robotics Architecture", category: "Robotics", description: "Understand the fundamentals of robot design and architecture.", difficulty: "Beginner", color: "#8b5cf6", icon: "smart_toy", totalLessons: 10 },
    { title: "Green Tech Innovators", category: "Green Tech", description: "Explore sustainable technology solutions and environmental innovation.", difficulty: "Beginner", color: "#22c55e", icon: "eco", totalLessons: 8 },
    { title: "Web Design Fundamentals", category: "Web Literacy", description: "Build beautiful, responsive websites with HTML, CSS, and JavaScript.", difficulty: "Beginner", color: "#06b6d4", icon: "web", totalLessons: 10 },
    { title: "3D Design & Printing", category: "Circuitry", description: "Design 3D models and learn the basics of 3D printing technology.", difficulty: "Intermediate", color: "#ec4899", icon: "view_in_ar", totalLessons: 12 },
    { title: "AP Comp Sci Prep", category: "Coding", description: "Prepare for AP Computer Science exam with data structures and algorithms.", difficulty: "Advanced", color: "#3b82f6", icon: "school", totalLessons: 20 },
    { title: "Cybersecurity 101", category: "Cybersecurity", description: "Learn about digital security, encryption, and ethical hacking basics.", difficulty: "Intermediate", color: "#ef4444", icon: "security", totalLessons: 10 },
  ];

  const courseRefs: Record<string, string> = {};
  for (const c of courses) {
    const ref = await db.collection("courses").add({
      ...c,
      createdBy: "",
      schoolId: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    courseRefs[c.title] = ref.id;
    console.log(`  ✅ Course: ${c.title}`);
  }

  // 3. Lessons for "Intro to Circuitry"
  const circuitryId = courseRefs["Intro to Circuitry"];
  const lessons = [
    { title: "Introduction to LEDs", type: "Video", duration: "5 min", order: 1, content: "Learn about Light Emitting Diodes and how they work in circuits." },
    { title: "Circuit Diagram Basics", type: "Reading", duration: "8 min", order: 2, content: "Understanding circuit diagrams, symbols, and component identification." },
    { title: "Build Your First Circuit", type: "Hands-on", duration: "20 min", order: 3, content: "Step-by-step guide to building a simple LED circuit on a breadboard." },
    { title: "Troubleshooting & Testing", type: "Reading", duration: "6 min", order: 4, content: "Learn common circuit issues and how to use a multimeter." },
    { title: "Advanced LED Patterns", type: "Video", duration: "12 min", order: 5, content: "Create blinking, fading, and sequential LED patterns." },
    { title: "Student Reflection", type: "Reflection", duration: "10 min", order: 6, content: "Reflect on what you learned about circuits and electronics." },
    { title: "Review & Submit", type: "Submit", duration: "5 min", order: 7, content: "Submit your circuit project for review." },
  ];

  for (const l of lessons) {
    await db.collection("courses").doc(circuitryId).collection("lessons").add({
      ...l,
      courseId: circuitryId,
      blocks: [],
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`  ✅ 7 lessons for Intro to Circuitry`);

  // 4. Classrooms
  const classrooms = [
    { name: "Grade 8 Robotics", subject: "Robotics", grade: "8", joinCode: "STEM01", schoolId: schoolRefs["Roosevelt STEM Academy"], schoolName: "Roosevelt STEM Academy", teacherName: "Ms. Sarah Miller", enrolled: 24, capacity: 30, courseIds: [courseRefs["Intro to Circuitry"], courseRefs["Python Basics"], courseRefs["3D Design & Printing"]] },
    { name: "Advanced Robotics & AI", subject: "Robotics", grade: "9-10", joinCode: "ROBO23", schoolId: schoolRefs["Nairobi Junior Academy"], schoolName: "Nairobi Junior Academy", teacherName: "Dr. Sarah Chen", enrolled: 32, capacity: 35, courseIds: [courseRefs["Sensor Calibration Lab"], courseRefs["Intro to Robotics Architecture"]] },
    { name: "Python Basics", subject: "Coding", grade: "7", joinCode: "CODE7X", schoolId: schoolRefs["Mombasa Tech High"], schoolName: "Mombasa Tech High", teacherName: "Mr. James Ochieng", enrolled: 18, capacity: 25, courseIds: [courseRefs["Python Basics"], courseRefs["Cybersecurity 101"]] },
  ];

  for (const c of classrooms) {
    await db.collection("classrooms").add({
      ...c,
      teacherId: "",
      avgProgress: Math.floor(Math.random() * 60) + 30,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`  ✅ Classroom: ${c.name} (${c.joinCode})`);
  }

  // 5. Badges
  const badges = [
    { name: "Code Ninja", icon: "code", color: "#3b82f6", rarity: "rare", xpValue: 500, requirement: "Complete 5 coding courses" },
    { name: "Pixel Perfect", icon: "palette", color: "#f59e0b", rarity: "common", xpValue: 200, requirement: "Submit 3 design projects" },
    { name: "Logic King", icon: "psychology", color: "#8b5cf6", rarity: "epic", xpValue: 750, requirement: "Score 95%+ on 3 logic challenges" },
    { name: "Engineering Core", icon: "engineering", color: "#13eca4", rarity: "common", xpValue: 300, requirement: "Complete Intro to Circuitry" },
    { name: "Team Lead", icon: "groups", color: "#06b6d4", rarity: "rare", xpValue: 400, requirement: "Lead 3 group projects" },
    { name: "Ethical AI", icon: "smart_toy", color: "#ec4899", rarity: "epic", xpValue: 600, requirement: "Complete AI Ethics module" },
    { name: "Circuit Master", icon: "electrical_services", color: "#13eca4", rarity: "rare", xpValue: 500, requirement: "Build 5 working circuits" },
    { name: "Web Weaver", icon: "web", color: "#06b6d4", rarity: "common", xpValue: 250, requirement: "Deploy 2 websites" },
    { name: "AI Pioneer", icon: "neurology", color: "#8b5cf6", rarity: "legendary", xpValue: 1000, requirement: "Complete all AI courses" },
    { name: "Green Builder", icon: "eco", color: "#22c55e", rarity: "rare", xpValue: 450, requirement: "Complete Green Tech Innovators" },
    { name: "Robot Whisperer", icon: "precision_manufacturing", color: "#f59e0b", rarity: "epic", xpValue: 800, requirement: "Program 3 autonomous robots" },
    { name: "30-Day Streak", icon: "local_fire_department", color: "#ef4444", rarity: "legendary", xpValue: 1500, requirement: "Login 30 consecutive days" },
  ];

  for (const b of badges) {
    await db.collection("badges").add({
      ...b,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`  ✅ ${badges.length} badges`);

  console.log("\n🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
