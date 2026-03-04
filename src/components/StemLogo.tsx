import Image from "next/image";
import Link from "next/link";

interface StemLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function StemLogo({ size = "md", href = "/" }: StemLogoProps) {
  const heights = { sm: 28, md: 36, lg: 44 };
  const padding = { sm: "px-2 py-1", md: "px-3 py-1.5", lg: "px-3 py-2" };
  const h = heights[size];

  const content = (
    <span className={`bg-white rounded-lg ${padding[size]} inline-flex items-center`}>
      <Image
        src="/images/logo/sic-academy.png"
        alt="STEM Impact Academy"
        height={h}
        width={h * 5}
        style={{ height: `${h}px`, width: "auto" }}
        priority
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="outline-none focus:ring-2 focus:ring-[#13eca4] rounded-lg inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
