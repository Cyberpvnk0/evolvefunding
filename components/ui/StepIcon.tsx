import type { Step } from "@/content/site";

interface StepIconProps {
  name: Step["icon"];
  className?: string;
}

/** Minimal 1.25px line icons in the accent color. */
export default function StepIcon({ name, className }: StepIconProps) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "signup":
      return (
        <svg {...common}>
          <rect x="4.5" y="6.5" width="19" height="15" rx="1.5" />
          <path d="M9 12h10M9 16h6" />
        </svg>
      );
    case "dispute":
      return (
        <svg {...common}>
          <path d="M7 4.5h10l4 4V23.5H7z" />
          <path d="M17 4.5v4h4" />
          <path d="M10.5 15.5l2.5 2.5 4.5-5" />
        </svg>
      );
    case "climb":
      return (
        <svg {...common}>
          <path d="M4.5 21.5L11 14l4.5 4L23.5 8.5" />
          <path d="M18.5 8.5h5v5" />
        </svg>
      );
  }
}
