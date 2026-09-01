import type { Metadata } from "next";
import SubpageShell, { LegalArticle } from "@/components/ui/SubpageShell";
import { brand, terms } from "@/content/site";

export const metadata: Metadata = {
  title: `${terms.title} | ${brand.name}`,
};

/**
 * TERMS OF SERVICE. Placeholder copy from site.ts, rendered with the shared
 * legal article layout. Replace the text and the date with counsel-approved
 * versions before launch.
 */
export default function TermsPage() {
  return (
    <SubpageShell>
      <LegalArticle
        title={terms.title}
        eyebrow={`Last updated ${terms.updated}`}
        sections={terms.sections}
      />
    </SubpageShell>
  );
}
