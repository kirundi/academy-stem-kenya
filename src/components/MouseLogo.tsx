import Link from "next/link";

interface MouseLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  variant?: "dark" | "light";
}

export default function MouseLogo({ size = "md", href = "/", variant = "dark" }: MouseLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 40, text: "text-2xl" },
  };

  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5 group">
      {/* Mouse Create diamond-shaped logo */}
      <div
        className="text-[#13eca4] flex-shrink-0"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={s.icon}
          height={s.icon}
        >
          <path
            d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className={`${s.text} font-bold tracking-tight leading-none`}>
        <span className={variant === "dark" ? "text-white" : "text-slate-900"}>
          mouse{" "}
        </span>
        <span className="text-[#ff4d4d]">create</span>
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
