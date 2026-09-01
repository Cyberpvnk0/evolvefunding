import Link from "next/link";
import { brand } from "@/content/site";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center px-5 sm:px-8">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-[42px] leading-display tracking-tightest sm:text-6xl">
        That page is not here.
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-[3px] border border-line px-6 text-[15px] text-bone transition-colors hover:border-gold"
      >
        Back to {brand.name}
      </Link>
    </main>
  );
}
