"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizeMap[size]} border-(--border-medium) border-t-(--primary-green) rounded-full animate-spin`}
      />
      {message && <p className="text-(--text-muted) text-sm font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-page)">{spinner}</div>
    );
  }

  return <div className="flex items-center justify-center py-12">{spinner}</div>;
}
