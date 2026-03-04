import Image from "next/image";
import Link from "next/link";

interface StemLogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function StemLogo({ size = "md", href = "/" }: StemLogoProps) {
  const heights = { sm: 28, md: 36, lg: 44 };
  const h = heights[size];

  const content = (
    <Image
      src="/images/logo/sic-logo.png"
      alt="STEM Impact Academy"
      height={h}
      width={h * 5}
      style={{ height: `${h}px`, width: "auto" }}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="outline-none focus:ring-2 focus:ring-[#13eca4] rounded-md inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
