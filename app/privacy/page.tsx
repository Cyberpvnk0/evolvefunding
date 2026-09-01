import type { Metadata } from "next";
import SubpageShell, { LegalArticle } from "@/components/ui/SubpageShell";
import { brand, privacy } from "@/content/site";

export const metadata: Metadata = {
  title: `${privacy.title} | ${brand.name}`,
};

/**
 * PRIVACY POLICY. Placeholder copy from site.ts, rendered with the shared
 * legal article layout. Replace the text and the date with counsel-approved
 * versions before launch.
 */
export default function PrivacyPage() {
  return (
    <SubpageShell>
      <LegalArticle
        title={privacy.title}
        eyebrow={`Last updated ${privacy.updated}`}
        sections={privacy.sections}
      />
    </SubpageShell>
  );
}
