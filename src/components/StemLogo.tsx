import Link from "next/link";

interface StemLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  variant?: "dark" | "light";
}

export default function StemLogo({ size = "md", href = "/", variant = "dark" }: StemLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 40, text: "text-2xl" },
  };

  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5 group">
      <span
        className="material-symbols-outlined shrink-0 text-[#13eca4]"
        style={{ fontSize: s.icon }}
      >
        token
      </span>
      <span className={`${s.text} font-bold tracking-tight leading-none uppercase italic`}>
        <span className={variant === "dark" ? "text-white" : "text-slate-900"}>STEM Impact </span>
        <span className="text-[#ff4d4d]">Academy</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="outline-none focus:ring-2 focus:ring-[#13eca4] rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
