import type { Metadata } from "next";
import SubpageShell, { LegalArticle } from "@/components/ui/SubpageShell";
import { brand, disclosures } from "@/content/site";

export const metadata: Metadata = {
  title: `${disclosures.title} | ${brand.name}`,
};

/**
 * DISCLOSURES. The statements federal and state law require of a credit
 * repair organization, plus the legal name and mailing address. Copy lives in
 * site.ts; the CROA placeholder there must be replaced by counsel before launch.
 */
export default function DisclosuresPage() {
  return (
    <SubpageShell>
      <LegalArticle
        title={disclosures.title}
        intro={disclosures.intro}
        sections={disclosures.sections}
        company
      />
    </SubpageShell>
  );
}
