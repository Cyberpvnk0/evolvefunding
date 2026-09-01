import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/sections/Footer";
import { brand } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Shell for the secondary routes: thank-you, disclosures, privacy, terms.
 * A one-line top bar with the brand name linking home, the page content in
 * the site column, then the same footer as the funnel. No sticky bar and no
 * exit intent: nothing on these pages sells.
 *
 * Server component. The footer sits outside <main>, as on the funnel page.
 */
export default function SubpageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="min-h-screen">
        <header className="flex h-16 items-center border-b border-line px-5 sm:px-8">
          <div className="mx-auto w-full max-w-page">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-display text-xl text-bone"
            >
              {brand.name}
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-page px-5 py-16 sm:px-8 sm:py-24">{children}</div>
      </main>
      <Footer />
    </>
  );
}

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalArticleProps {
  title: string;
  /** Small line above the title, e.g. the last-updated date. */
  eyebrow?: string;
  intro?: string;
  sections: ReadonlyArray<LegalSection>;
  /** Append the legal name and mailing address. Required on Disclosures. */
  company?: boolean;
}

/** "Your right to cancel" -> "your-right-to-cancel", for heading anchors. */
function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Title, optional intro, then heading + paragraph pairs straight from
 * site.ts. Shared by the three legal pages so they cannot drift apart.
 * Every heading carries an id so a section can be linked to directly.
 */
export function LegalArticle({ title, eyebrow, intro, sections, company = false }: LegalArticleProps) {
  return (
    <article className="max-w-3xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1
        className={cn(
          "font-display text-[42px] leading-display tracking-tightest text-bone sm:text-6xl",
          eyebrow && "mt-4",
        )}
      >
        {title}
      </h1>
      {intro && <p className="mt-6 max-w-prose text-lg leading-relaxed text-bone/80">{intro}</p>}

      {sections.map((section) => (
        <div key={section.heading}>
          <h2
            id={slug(section.heading)}
            className="mt-12 font-display text-[26px] leading-snugger tracking-tightest text-bone sm:text-3xl"
          >
            {section.heading}
          </h2>
          <p className="mt-4 max-w-prose text-[16px] leading-relaxed text-mute">{section.body}</p>
        </div>
      ))}

      {company && (
        <div className="mt-16 border-t border-line pt-8">
          <p className="eyebrow">Company</p>
          <address className="mt-3 text-[15px] not-italic leading-relaxed text-bone/85">
            {brand.legalName}
            <br />
            {brand.address}
          </address>
        </div>
      )}
    </article>
  );
}
