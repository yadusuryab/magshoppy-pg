import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface SHeadingProps {
  title?: string;
  description?: string;
  linkHref?: string;
  nolink?: boolean;
  buttonText?: string;
  badge?: string;
  size?: "sm" | "md" | "lg";
}

// Abstract mesh gradient, used only as a small accent
const mesh: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  backgroundImage: [
    "radial-gradient(60% 90% at 0% 0%, #22d3ee 0%, transparent 60%)",
    "radial-gradient(55% 80% at 100% 10%, #e879f9 0%, transparent 60%)",
    "radial-gradient(70% 90% at 90% 100%, #fb923c 0%, transparent 60%)",
    "radial-gradient(60% 80% at 10% 100%, #7c3aed 0%, transparent 60%)",
  ].join(","),
};

const sizeStyles = {
  sm: "text-2xl md:text-3xl",
  md: "text-3xl md:text-4xl",
  lg: "text-4xl md:text-5xl",
};

const SHeading = ({
  title = "Get Top Deals on the Newest Products",
  description = "",
  linkHref = "/products",
  nolink = false,
  buttonText = "View all",
  badge,
  size = "md",
}: SHeadingProps) => {
  return (
    <div className="mb-4 mt-3 flex w-full items-end justify-between gap-6 text-left">
      <div className="min-w-0">
        {badge && (
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
            <span
              style={mesh}
              className="size-2.5 rounded-full"
              aria-hidden="true"
            />
            {badge}
          </p>
        )}

        <h2
          className={`${sizeStyles[size]} font-extrabold leading-[1.02] tracking-tighter text-foreground`}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-xl text-sm leading-snug text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>

      {!nolink && (
        <Link
          href={linkHref}
          className="group flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="underline decoration-foreground/30 underline-offset-4 transition-colors group-hover:decoration-foreground">
            {buttonText}
          </span>
          <span
            style={mesh}
            className="grid size-8 place-items-center rounded-full text-white ring-1 ring-white/25"
          >
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}
    </div>
  );
};

// Compact inline version
export const InlineHeading = ({
  title,
  description,
  linkHref,
  buttonText = "View all",
}: Pick<SHeadingProps, "title" | "description" | "linkHref" | "buttonText">) => (
  <SHeading
    title={title}
    description={description}
    linkHref={linkHref}
    nolink={!linkHref}
    buttonText={buttonText}
    size="sm"
  />
);

export default SHeading;