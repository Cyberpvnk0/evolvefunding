import Link from "next/link";
import { brand, footer } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * 10. FOOTER. Brand name and contact email, the three legal links, the
 * required disclaimer, copyright. Minimal: no nav, no columns, no social.
 *
 * Extra bottom padding on phones so the sticky bar, pinned to the bottom edge
 * there, never covers the last lines of the disclaimer. Server component, so
 * the copyright year is computed at render time.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line px-5 pb-24 pt-14 sm:px-8 sm:pb-16 sm:pt-16">
      <div className="mx-auto flex max-w-page flex-col items-center text-center">
        {/* Brand + contact */}
        <div className="flex flex-col items-center gap-y-2">
          <p className="font-display text-xl text-bone">{brand.name}</p>
          <a
            href={`mailto:${brand.email}`}
            className="inline-flex min-h-11 items-center text-[14px] text-mute transition-colors duration-200 ease-expensive hover:text-bone"
          >
            {brand.email}
          </a>
        </div>

        {/* Legal links */}
        <ul className="mt-6 flex flex-wrap justify-center gap-x-6" aria-label="Legal">
          {footer.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="eyebrow inline-flex min-h-11 items-center transition-colors duration-200 ease-expensive hover:text-bone"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Disclaimer */}
        <div className="mt-8 max-w-3xl">
          {footer.disclaimer.map((paragraph, i) => (
            <p
              key={paragraph}
              className={cn("text-[12px] leading-relaxed text-mute/80", i > 0 && "mt-3")}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Copyright */}
        <p className="mt-10 text-[12px] text-mute/80">
          &copy; {year} {brand.legalName}
        </p>
      </div>
    </footer>
  );
}
