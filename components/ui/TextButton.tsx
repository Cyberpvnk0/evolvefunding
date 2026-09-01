import { brand } from "@/content/site";
import { cn } from "@/lib/cn";

interface TextButtonProps {
  label: string;
  /** Stretch to the container width. */
  block?: boolean;
  className?: string;
}

/**
 * The "Text us" button. Same gold treatment as CtaButton, but a plain server
 * rendered <a> that opens the visitor's SMS app with the number and message
 * from site.ts. The `?&body=` form pre-fills the message on both iOS and
 * Android. Not a checkout link, so it fires no analytics.
 */
export default function TextButton({ label, block = false, className }: TextButtonProps) {
  const href = `sms:${brand.smsNumber}?&body=${encodeURIComponent(brand.smsBody)}`;

  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center select-none whitespace-nowrap",
        "bg-gold text-ink font-sans font-semibold tracking-[0.01em] rounded-[3px]",
        "transition-[background-color,transform] duration-200 ease-expensive",
        "hover:bg-gold-deep active:scale-[0.985]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
        "h-14 px-8 text-[16px]",
        block && "w-full",
        className,
      )}
    >
      {label}
    </a>
  );
}
