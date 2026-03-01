"use client";

import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Course } from "@/lib/types";

export default function CourseLibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { appUser } = useAuthContext();
  const schoolId = appUser?.schoolId ?? null;

  // Fetch courses that belong to this school or are global (schoolId is null)
  const { data: schoolCourses, loading: schoolLoading } = useCollection<Course>(
    "courses",
    schoolId ? [where("schoolId", "==", schoolId)] : [],
    !!schoolId
  );
  const { data: globalCourses, loading: globalLoading } = useCollection<Course>(
    "courses",
    [where("schoolId", "==", null)]
  );

  const loading = schoolLoading || globalLoading;
  const allCourses = [...schoolCourses, ...globalCourses];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">progress_activity</span>
      </div>
    );
  }

  const categories = ["All", ...Array.from(new Set(allCourses.map((c) => c.category).filter(Boolean)))];

  const filtered = allCourses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All" || c.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const difficultyColor: Record<string, string> = {
    Beginner: "#13eca4",
    Intermediate: "#f59e0b",
    Advanced: "#ff4d4d",
  };

  return (
    <div className="min-h-screen bg-[#10221c]">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-14 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Course Library</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Course
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        <section>
          <div className="flex items-center gap-2 text-[#13eca4] mb-1">
            <span className="material-symbols-outlined text-[16px]">library_books</span>
            <span className="text-xs font-bold uppercase tracking-wider">Curriculum</span>
          </div>
          <h1 className="text-white text-4xl font-black leading-tight">Course Library</h1>
          <p className="text-slate-400 mt-1">{allCourses.length} courses available for your school.</p>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#13eca4] text-[#10221c]"
                    : "bg-[rgba(255,255,255,0.06)] text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No courses match your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <div key={course.id} className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.07)] overflow-hidden hover:border-[rgba(19,236,164,0.2)] transition-all group">
                <div className="h-32 flex items-center justify-center" style={{ background: `${course.color ?? "#13eca4"}15` }}>
                  <span className="material-symbols-outlined text-5xl" style={{ color: course.color ?? "#13eca4" }}>{course.icon ?? "auto_stories"}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ color: difficultyColor[course.difficulty] ?? "#13eca4", background: `${difficultyColor[course.difficulty] ?? "#13eca4"}18` }}
                    >
                      {course.difficulty}
                    </span>
                    {course.category && (
                      <span className="text-[10px] text-slate-500 font-medium">{course.category}</span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:text-[#13eca4] transition-colors">{course.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{course.description ?? "No description."}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <span className="text-xs text-slate-500">{course.totalLessons ?? 0} lessons</span>
                    {course.estimatedDuration && (
                      <span className="text-xs text-slate-500">{course.estimatedDuration}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
