/**
 * ============================================================================
 *  EVOLVE FUNDING — SITE CONTENT
 * ============================================================================
 *  Every word, number, and asset path on the site lives in this file.
 *  Swap copy, testimonials, scores, and images here. You never need to touch
 *  a component.
 *
 *  Placeholders are written in SCREAMING_SNAKE_CASE (CLIENT_NAME_1, CITY_1)
 *  so they are impossible to miss on the live page. Replace every one before
 *  launch. Asset placeholders live in /public/proof/ with descriptive names.
 *
 *  The checkout URL is NOT here on purpose. It lives in the env var
 *  NEXT_PUBLIC_CHECKOUT_URL so it can differ between preview and production.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProofClient {
  /** Stable id used for keys and analytics labels. */
  id: string;
  /** First name + last initial, e.g. "Marcus T." */
  name: string;
  /** Full-bleed photo of the client with the car/house they were approved for. */
  photo: string;
  /** Alt text for the photo. Describe the scene, not the marketing message. */
  photoAlt: string;
  /** Credit score screenshot shown in the lightbox when the card is tapped. */
  scoreShot: string;
  /** Score before Evolve Funding. */
  before: number;
  /** Score after. */
  after: number;
  /** What they were approved for, e.g. "2023 Corvette". */
  approved: string;
}

export interface ScoreShot {
  id: string;
  /** Optional label, e.g. client first name + last initial. */
  label: string;
  before: { image: string; score: number; date: string };
  after: { image: string; score: number; date: string };
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  city: string;
  avatar: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** One figure in the hero's stat bar. */
export interface HeroStat {
  /** The figure exactly as it should read, e.g. "724", "$3M", "4.9". */
  value: string;
  /** Keep these a similar length: even labels are what make the row even. */
  label: string;
  /**
   * Count up to `value` on load instead of rendering it straight away.
   * Only valid when `value` is a plain number. Omit for a static figure.
   */
  countFrom?: number;
  /** Milliseconds for that count. Ignored without `countFrom`. */
  durationMs?: number;
}

/** The hero's video sales letter. */
export interface Vsl {
  /**
   * "file"  plays a self-hosted MP4 from /public/proof/.
   * "embed" shows the poster until it is clicked, then swaps in an iframe
   *         (YouTube, Vimeo, Wistia). Their scripts never load until play,
   *         so an unplayed video costs the page nothing.
   */
  type: "file" | "embed";
  /** Used when type is "file". */
  src: string;
  /** Used when type is "embed". Paste the platform's EMBED url, not the share url. */
  embedUrl: string;
  /** Thumbnail shown before play. This is the single biggest lever on play rate. */
  poster: string;
  posterAlt: string;
  /** CSS aspect ratio. "16 / 9" for landscape, "9 / 16" for a vertical cut. */
  aspect: string;
  /** Accessible name for the play button. */
  playLabel: string;
  /** One short line under the video before it is played. Empty string hides it. */
  hint: string;
  /** Optional WebVTT captions track for a self-hosted file. Empty string for none. */
  captions: string;
}

export interface Step {
  title: string;
  body: string;
  /** Minimal line icon. One of the keys in components/ui/StepIcon.tsx. */
  icon: "signup" | "dispute" | "climb";
}

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export const brand = {
  name: "Evolve Funding",
  legalName: "Evolve Funding LLC",
  tagline: "Credit repair that ends in an approval.",
  /** Contact email shown in the footer and on the thank-you page. */
  email: "support@evolvefundingllc.com",
  /** E.164 phone number used for the "Text us" buttons. Replace before launch. */
  smsNumber: "+15555550123",
  /** Pre-filled text message body for the "Text us" buttons. */
  smsBody: "Hi, I just signed up with Evolve Funding and have a question.",
  /** Mailing address required on the Disclosures page. */
  address: "COMPANY_STREET_ADDRESS, CITY, STATE ZIP",
  /** Used in the <title> and Open Graph tags. */
  seoTitle: "Evolve Funding | Credit Repair That Ends In An Approval",
  seoDescription:
    "Real clients. Real scores. 550 to 720+ in a few months, then approved for the car, the house, the funding. $147 a month. Cancel anytime.",
  ogImage: "/proof/og-image.jpg",
} as const;

// ---------------------------------------------------------------------------
// Offer
// ---------------------------------------------------------------------------

export const offer = {
  price: 147,
  priceLabel: "$147/mo",
  priceSentence: "$147 a month",
  cancelLine: "Cancel anytime. No contract.",
  /** Shown in the value anchor inside "What's Included". */
  competitorRange: "$199 to $299/month",
} as const;

// ---------------------------------------------------------------------------
// 1. Hero
// ---------------------------------------------------------------------------

export const hero = {
  headline: "They Were Told No. Now They Drive This.",
  /** One line. It sits between the headline and the video, so keep it short. */
  subheadline: "Real clients. Real scores. Watch what happened.",

  /**
   * Still image behind the video. Deliberately dark and low contrast: it adds
   * depth without competing with the VSL for attention.
   */
  backdrop: "/proof/hero-backdrop.jpg",
  backdropAlt: "Evolve Funding clients standing beside the cars they were approved for",

  /** The video sales letter. The centrepiece of the page. */
  vsl: {
    type: "file",
    src: "/proof/vsl.mp4",
    embedUrl: "",
    poster: "/proof/vsl-poster.jpg",
    posterAlt: "Evolve Funding founder with client results on screen",
    aspect: "16 / 9",
    playLabel: "Play the video",
    hint: "VSL_LENGTH_PLACEHOLDER, sound on.",
    captions: "",
  } as Vsl,

  /**
   * The stat bar under the button. Three figures, equal columns.
   * Keep it to three and keep the labels a similar length: the row is only
   * as clean as its least even column.
   */
  stats: [
    {
      value: "724",
      label: "Average 90-day jump",
      // TODO: confirm the real average before launch.
      countFrom: 550,
      durationMs: 2000,
    },
    { value: "$3M", label: "Items removed monthly" },
    { value: "4.9", label: "Average client rating" },
  ] as HeroStat[],

  cta: {
    label: "Start My Repair – $147/mo",
    subtext: "Cancel anytime. No contract. First results typically in 30–45 days.",
    /** Small reassurance directly under the button, beside a lock. */
    secure: "Secure checkout",
  },
};

// ---------------------------------------------------------------------------
// 2. Sticky CTA bar
// ---------------------------------------------------------------------------

export const stickyBar = {
  left: "$147/mo, cancel anytime",
  cta: "Start Now",
} as const;

// ---------------------------------------------------------------------------
// 3. Proof wall
// ---------------------------------------------------------------------------

export const proof = {
  headline: "This Is What A 720 Looks Like.",
  subheadline: "Tap any photo to see the score.",
  scoreStripHeadline: "The Numbers Behind The Photos.",
  scoreStripSubheadline: "Screenshots straight from the bureaus. Dates included.",
  lightboxHint: "Credit score screenshot",
} as const;

/**
 * Client photo cards. Add as many as you like. Twelve is a good minimum.
 * Every value below is a placeholder. Replace the name, scores, approval,
 * and both images for each client before launch.
 */
export const proofClients: ProofClient[] = [
  {
    id: "client-1",
    name: "CLIENT_NAME_1",
    photo: "/proof/client-corvette-1.jpg",
    photoAlt: "Client standing beside a red Corvette",
    scoreShot: "/proof/score-before-after-1.png",
    before: 552,
    after: 718,
    approved: "APPROVED_ITEM_1",
  },
  {
    id: "client-2",
    name: "CLIENT_NAME_2",
    photo: "/proof/client-bmw-2.jpg",
    photoAlt: "Client leaning on a black BMW",
    scoreShot: "/proof/score-before-after-2.png",
    before: 561,
    after: 731,
    approved: "APPROVED_ITEM_2",
  },
  {
    id: "client-3",
    name: "CLIENT_NAME_3",
    photo: "/proof/client-mercedes-3.jpg",
    photoAlt: "Client beside a white Mercedes",
    scoreShot: "/proof/score-before-after-3.png",
    before: 538,
    after: 702,
    approved: "APPROVED_ITEM_3",
  },
  {
    id: "client-4",
    name: "CLIENT_NAME_4",
    photo: "/proof/client-tesla-4.jpg",
    photoAlt: "Client holding keys in front of a Tesla",
    scoreShot: "/proof/score-before-after-4.png",
    before: 574,
    after: 726,
    approved: "APPROVED_ITEM_4",
  },
  {
    id: "client-5",
    name: "CLIENT_NAME_5",
    photo: "/proof/client-f150-5.jpg",
    photoAlt: "Client beside a Ford F-150",
    scoreShot: "/proof/score-before-after-5.png",
    before: 549,
    after: 709,
    approved: "APPROVED_ITEM_5",
  },
  {
    id: "client-6",
    name: "CLIENT_NAME_6",
    photo: "/proof/client-range-rover-6.jpg",
    photoAlt: "Client beside a Range Rover",
    scoreShot: "/proof/score-before-after-6.png",
    before: 567,
    after: 740,
    approved: "APPROVED_ITEM_6",
  },
  {
    id: "client-7",
    name: "CLIENT_NAME_7",
    photo: "/proof/client-charger-7.jpg",
    photoAlt: "Client beside a Dodge Charger",
    scoreShot: "/proof/score-before-after-7.png",
    before: 543,
    after: 712,
    approved: "APPROVED_ITEM_7",
  },
  {
    id: "client-8",
    name: "CLIENT_NAME_8",
    photo: "/proof/client-audi-8.jpg",
    photoAlt: "Client beside an Audi",
    scoreShot: "/proof/score-before-after-8.png",
    before: 558,
    after: 721,
    approved: "APPROVED_ITEM_8",
  },
  {
    id: "client-9",
    name: "CLIENT_NAME_9",
    photo: "/proof/client-lexus-9.jpg",
    photoAlt: "Client beside a Lexus",
    scoreShot: "/proof/score-before-after-9.png",
    before: 571,
    after: 733,
    approved: "APPROVED_ITEM_9",
  },
  {
    id: "client-10",
    name: "CLIENT_NAME_10",
    photo: "/proof/client-tahoe-10.jpg",
    photoAlt: "Client beside a Chevrolet Tahoe",
    scoreShot: "/proof/score-before-after-10.png",
    before: 546,
    after: 705,
    approved: "APPROVED_ITEM_10",
  },
  {
    id: "client-11",
    name: "CLIENT_NAME_11",
    photo: "/proof/client-mustang-11.jpg",
    photoAlt: "Client beside a Ford Mustang",
    scoreShot: "/proof/score-before-after-11.png",
    before: 555,
    after: 719,
    approved: "APPROVED_ITEM_11",
  },
  {
    id: "client-12",
    name: "CLIENT_NAME_12",
    photo: "/proof/client-house-12.jpg",
    photoAlt: "Client holding keys in front of a new house",
    scoreShot: "/proof/score-before-after-12.png",
    before: 563,
    after: 728,
    approved: "APPROVED_ITEM_12",
  },
];

/**
 * Pure score screenshots, before and after side by side, with dates.
 * Replace each image with a real bureau or monitoring-app screenshot.
 */
export const scoreShots: ScoreShot[] = [
  {
    id: "score-1",
    label: "CLIENT_NAME_1",
    before: { image: "/proof/score-before-1.png", score: 552, date: "DATE_BEFORE_1" },
    after: { image: "/proof/score-after-1.png", score: 718, date: "DATE_AFTER_1" },
  },
  {
    id: "score-2",
    label: "CLIENT_NAME_2",
    before: { image: "/proof/score-before-2.png", score: 561, date: "DATE_BEFORE_2" },
    after: { image: "/proof/score-after-2.png", score: 731, date: "DATE_AFTER_2" },
  },
  {
    id: "score-3",
    label: "CLIENT_NAME_3",
    before: { image: "/proof/score-before-3.png", score: 538, date: "DATE_BEFORE_3" },
    after: { image: "/proof/score-after-3.png", score: 702, date: "DATE_AFTER_3" },
  },
  {
    id: "score-4",
    label: "CLIENT_NAME_4",
    before: { image: "/proof/score-before-4.png", score: 574, date: "DATE_BEFORE_4" },
    after: { image: "/proof/score-after-4.png", score: 726, date: "DATE_AFTER_4" },
  },
  {
    id: "score-5",
    label: "CLIENT_NAME_5",
    before: { image: "/proof/score-before-5.png", score: 549, date: "DATE_BEFORE_5" },
    after: { image: "/proof/score-after-5.png", score: 709, date: "DATE_AFTER_5" },
  },
  {
    id: "score-6",
    label: "CLIENT_NAME_6",
    before: { image: "/proof/score-before-6.png", score: 567, date: "DATE_BEFORE_6" },
    after: { image: "/proof/score-after-6.png", score: 740, date: "DATE_AFTER_6" },
  },
];

// ---------------------------------------------------------------------------
// 4. The problem
// ---------------------------------------------------------------------------

export const problem = {
  lines: [
    "Denied for the car.",
    "Paying 24% interest instead of 6%.",
    "Landlords picking the other applicant.",
  ],
  closer: "Bad credit is costing you more than $147 a month. Every month.",
} as const;

// ---------------------------------------------------------------------------
// 5. How it works
// ---------------------------------------------------------------------------

export const howItWorks = {
  headline: "Three Steps. We Handle The Rest.",
  steps: [
    {
      title: "Sign up",
      body: "Two minutes. Checkout, then a short intake so we know where you are starting.",
      icon: "signup",
    },
    {
      title: "We pull your reports and dispute",
      body: "All three bureaus. Every negative item. First round filed the week you join.",
      icon: "dispute",
    },
    {
      title: "You watch your score climb",
      body: "Items fall off. Your score moves. You see all of it in your client portal.",
      icon: "climb",
    },
  ] as Step[],
} as const;

// ---------------------------------------------------------------------------
// 6. What's included
// ---------------------------------------------------------------------------

export const included = {
  headline: "What $147 Covers.",
  items: [
    "Full 3-bureau dispute process: Equifax, Experian, and TransUnion",
    "Unlimited disputes, every 30 days, until every item is resolved",
    "Monthly progress updates with every response from the bureaus",
    "A personal case manager who knows your file by name",
    "Funding readiness review the month you cross 700",
    "Client portal access, day one, from any device",
  ],
  anchor: {
    lead: "Similar services charge $199 to $299/month.",
    close: "You pay $147.",
  },
} as const;

// ---------------------------------------------------------------------------
// 7. Testimonials
// ---------------------------------------------------------------------------

export const testimonialsSection = {
  headline: "In Their Words.",
} as const;

/**
 * SAMPLE quotes. Replace with verbatim client words before launch.
 * Testimonials must reflect real client experiences.
 */
export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    quote:
      "Two dealerships turned me down in the same week. Four months later I drove off the lot at 5.9 percent.",
    name: "TESTIMONIAL_NAME_1",
    city: "CITY_1",
    avatar: "/proof/testimonial-1.jpg",
  },
  {
    id: "t-2",
    quote:
      "I had tried disputing on my own and got nowhere. They removed six items in the first round.",
    name: "TESTIMONIAL_NAME_2",
    city: "CITY_2",
    avatar: "/proof/testimonial-2.jpg",
  },
  {
    id: "t-3",
    quote:
      "My case manager texted me every time something came off. That alone was worth it.",
    name: "TESTIMONIAL_NAME_3",
    city: "CITY_3",
    avatar: "/proof/testimonial-3.jpg",
  },
  {
    id: "t-4",
    quote:
      "I went from 561 to 731. The mortgage closed in March. I still cannot believe the number.",
    name: "TESTIMONIAL_NAME_4",
    city: "CITY_4",
    avatar: "/proof/testimonial-4.jpg",
  },
  {
    id: "t-5",
    quote:
      "Cheapest thing I ever paid for that actually changed my life. I told my whole family.",
    name: "TESTIMONIAL_NAME_5",
    city: "CITY_5",
    avatar: "/proof/testimonial-5.jpg",
  },
];

// ---------------------------------------------------------------------------
// 8. FAQ
// ---------------------------------------------------------------------------

export const faqSection = {
  headline: "Questions, Answered.",
} as const;

export const faq: FaqItem[] = [
  {
    question: "How fast will I see results?",
    answer:
      "Most clients see their first deletions in 30 to 45 days. The bureaus have 30 days to investigate each dispute, and we file your first round the week you sign up.",
  },
  {
    question: "Can you remove real items?",
    answer:
      "We dispute every negative item that is inaccurate, unverifiable, outdated, or reported incorrectly. That covers far more than most people expect, including many collections, late payments, and charge-offs. We do not remove information that is accurate and current.",
  },
  {
    question: "Is this legal?",
    answer:
      "Yes. Federal law gives you the right to dispute anything on your credit report and requires the bureaus to verify it or delete it. We exercise that right for you, on all three bureaus, every month.",
  },
  {
    question: "What if nothing gets removed?",
    answer:
      "You get your money back. If we do not remove a single negative item in your first three months, we refund every payment you have made. The one condition is that you had negative items to begin with: if your reports are already clean, there is nothing to dispute and the guarantee does not apply.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Any time, from your portal or by email. You are billed month to month. There is no contract and no fee to leave.",
  },
  {
    question: "Do I need to send anything?",
    answer:
      "A photo ID, proof of address, and access to your credit monitoring so we can pull your reports. Your case manager walks you through it in the first 24 hours. After that, we handle the rest.",
  },
  {
    question: "How is this different from doing it myself?",
    answer:
      "You can dispute for free, and you always have that right. Most people send one letter, get a form response, and stop. We send targeted disputes to all three bureaus every 30 days, escalate anything that comes back verified, and track every item until it is gone.",
  },
];

// ---------------------------------------------------------------------------
// 8b. Guarantee (risk reversal)
// ---------------------------------------------------------------------------

/**
 * The money-back guarantee. This is the strongest objection-killer on the
 * page, so it gets its own moment above the final CTA.
 *
 * NOTE: guarantees offered by credit repair organizations are regulated.
 * Have counsel review this wording, and the matching Terms section, before
 * launch.
 */
export const guarantee = {
  eyebrow: "Our guarantee",
  headline: "Nothing Removed In 90 Days? You Get Every Dollar Back.",
  body: "Give us three months. If we do not remove a single negative item from your reports in that time, email us and we refund everything you have paid. You keep the reports and the work we did.",
  /** The honest limit on the offer. Stated plainly rather than buried. */
  fineprint:
    "One condition: there has to be something to remove. If you sign up with no negative items on file, there is nothing to dispute and the guarantee does not apply.",
} as const;

// ---------------------------------------------------------------------------
// 9. Risk reversal + final CTA
// ---------------------------------------------------------------------------

export const finalCta = {
  headline: "Your Next Approval Starts Tonight.",
  body: "Sign up now and your first disputes go out this week. $147 a month. Cancel anytime.",
  image: "/proof/final-cta.jpg",
  imageAlt: "Client holding car keys at dusk",
  cta: {
    label: "Start My Repair Now",
    subtext: "Cancel anytime. No contract.",
  },
  // Name your processor in the first badge once one is chosen,
  // e.g. "Secure checkout by <processor>".
  badges: ["Secure checkout", "256-bit encryption", "Month to month"],
  clientCount: {
    // TODO: replace with the real client count.
    value: 1200,
    /** {count} is replaced with the formatted number. */
    label: "Join {count}+ clients",
  },
} as const;

// ---------------------------------------------------------------------------
// 10. Footer + legal
// ---------------------------------------------------------------------------

export const footer = {
  links: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Disclosures", href: "/disclosures" },
  ],
  /**
   * Required disclaimer. Shown in the footer on every page.
   * Have your attorney review before launch.
   */
  disclaimer: [
    "Results vary. No specific outcome is guaranteed. The scores and approvals shown are individual client results and are not typical of every client.",
    "Evolve Funding does not remove accurate and timely information from your credit report. We dispute items that are inaccurate, unverifiable, incomplete, or outdated.",
    "You have the right to dispute inaccurate information in your credit report by contacting the credit bureaus directly, at no cost. You can also cancel this service at any time.",
    "CROA_DISCLOSURE_PLACEHOLDER: Insert the Consumer Credit File Rights Under State and Federal Law statement required by the Credit Repair Organizations Act, 15 U.S.C. § 1679c, plus any state-specific disclosures and registration numbers.",
  ],
} as const;

// ---------------------------------------------------------------------------
// Exit intent / delayed slide-up
// ---------------------------------------------------------------------------

export const exitIntent = {
  headline: "Not ready? Text me your questions.",
  body: "Leave your name and number. You get a real reply from a real person, usually within the hour.",
  fields: {
    firstName: { label: "First name", placeholder: "First name" },
    lastName: { label: "Last name", placeholder: "Last name" },
    phone: { label: "Mobile number", placeholder: "Mobile number" },
  },
  button: "Text Me",
  success: "Got it. Watch your phone.",
  /**
   * Validation messages name the field that is wrong. `send` is reserved for a
   * request that actually failed, so a visitor is never told their number
   * "did not go through" when they simply left a box empty.
   */
  errors: {
    firstName: "Enter your first name.",
    lastName: "Enter your last name.",
    phone: "Enter a valid mobile number.",
    send: "That did not go through. Try again.",
  },
  consent: "By submitting, you agree to receive a text reply. Message and data rates may apply.",
  /** Delay before the slide-up shows on mobile. */
  mobileDelayMs: 45000,
} as const;

// ---------------------------------------------------------------------------
// Thank-you page
// ---------------------------------------------------------------------------

export const thankYou = {
  /** Browser tab title. The page is noindex, so this is for the visitor only. */
  title: "You’re in",
  headline: "You’re in.",
  subheadline: "Your payment went through. Here is what happens next.",
  nextSteps: [
    {
      title: "Check your email",
      body: "Your portal login and intake form arrive within 10 minutes. Check spam if you do not see them.",
    },
    {
      title: "Upload your ID and proof of address",
      body: "Two photos, taken with your phone. The bureaus will not accept a dispute without them.",
    },
    {
      title: "Meet your case manager",
      body: "They review your reports, build your dispute plan, and file round one.",
    },
  ],
  firstWeek: {
    headline: "The First 7 Days.",
    days: [
      { day: "Day 1", body: "Intake done. Reports pulled from all three bureaus." },
      { day: "Day 2 to 3", body: "Your case manager flags every negative item and drafts round one." },
      { day: "Day 4 to 5", body: "Round one disputes are mailed and logged in your portal." },
      { day: "Day 7", body: "You get your first progress update and the timeline for round two." },
    ],
  },
  cta: {
    label: "Text us now",
    subtext: "Questions about your intake? We answer fast.",
  },
} as const;

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------

export const notFound = {
  eyebrow: "404",
  headline: "That page is not here.",
  /** {name} is replaced with the brand name. */
  backLabel: "Back to {name}",
} as const;

// ---------------------------------------------------------------------------
// Disclosures page
// ---------------------------------------------------------------------------

export const disclosures = {
  title: "Disclosures",
  intro:
    "Evolve Funding is a credit repair organization. Federal and state law require the following disclosures. Read them before you purchase.",
  sections: [
    {
      heading: "Results vary",
      body: "No specific outcome is guaranteed. The scores, approvals, and timelines shown on this site are individual client results. Your results depend on the contents of your credit file, the accuracy of the items on it, and how the credit bureaus and creditors respond to disputes.",
    },
    {
      heading: "We do not remove accurate information",
      body: "Evolve Funding does not remove, and cannot remove, information that is accurate and current from your credit report. We dispute items that are inaccurate, unverifiable, incomplete, or outdated, as permitted by the Fair Credit Reporting Act.",
    },
    {
      heading: "Your right to dispute for free",
      body: "You have the right to dispute inaccurate information in your credit report by contacting the credit bureaus directly. There is no charge for this. You can also obtain a free copy of your credit report from each bureau at annualcreditreport.com.",
    },
    {
      heading: "Your right to cancel",
      body: "You may cancel this service at any time. There is no contract and no cancellation fee. You may also cancel any purchase within three business days of signing, for any reason, with no penalty.",
    },
    {
      heading: "Consumer Credit File Rights Under State and Federal Law",
      body: "CROA_DISCLOSURE_PLACEHOLDER: Insert the full statement required by the Credit Repair Organizations Act, 15 U.S.C. § 1679c, here. Include the right to sue a credit repair organization that violates the Act, the prohibition on advance payment, and the statement that you may contact the Federal Trade Commission. Have counsel confirm the text and add any state-specific disclosures, surety bond information, and registration numbers.",
    },
    {
      heading: "Testimonials",
      body: "Testimonials on this site reflect the individual experiences of real clients and were not paid for. They are not a guarantee of the results you will achieve.",
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Privacy + Terms (short placeholder copy; replace with counsel-approved text)
// ---------------------------------------------------------------------------

export const privacy = {
  title: "Privacy Policy",
  updated: "LAST_UPDATED_DATE",
  sections: [
    {
      heading: "What we collect",
      body: "Your name, contact details, and the documents you upload so we can dispute items on your behalf. Payment details are handled by our payment provider and never touch our servers.",
    },
    {
      heading: "How we use it",
      body: "To prepare and send disputes, communicate with you about your case, and improve this service. We do not sell your personal information.",
    },
    {
      heading: "Tracking",
      body: "This site uses analytics and advertising pixels to measure performance. You can limit tracking through your browser or device settings.",
    },
    {
      heading: "Contact",
      body: "Questions about your data? Email us at the address in the footer.",
    },
  ],
} as const;

export const terms = {
  title: "Terms of Service",
  updated: "LAST_UPDATED_DATE",
  sections: [
    {
      heading: "The service",
      body: "Evolve Funding prepares and sends credit disputes on your behalf, provides a client portal, and assigns a case manager. The service is billed monthly at $147 and renews until you cancel.",
    },
    {
      heading: "Cancellation",
      body: "Cancel at any time from your portal or by email. Cancellation stops future billing. Fees already paid for a completed month are not refunded, except as required by law.",
    },
    {
      heading: "Money-back guarantee",
      body: "If Evolve Funding does not remove at least one negative item from your credit reports within the first three months of continuous paid service, you may request a full refund of all fees you have paid, and we will issue it. To qualify you must have had at least one negative, inaccurate, unverifiable, incomplete, or outdated item on your reports when you enrolled, and you must have provided the identification and documents we need to file disputes on your behalf. If you enroll with no such items on file, there is nothing for us to dispute and the guarantee does not apply. Request a refund by emailing the address in the footer within thirty days of the end of your third month.",
    },
    {
      heading: "No guarantee of a specific outcome",
      body: "Outside the money-back guarantee above, results vary. We do not guarantee any specific score increase, the removal of any particular item, or any approval, credit line, or interest rate.",
    },
    {
      heading: "Your responsibilities",
      body: "Provide accurate information, respond to bureau correspondence you receive, and do not dispute items you know to be accurate.",
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Convenience bundle
// ---------------------------------------------------------------------------

export const site = {
  brand,
  offer,
  hero,
  stickyBar,
  proof,
  proofClients,
  scoreShots,
  problem,
  howItWorks,
  included,
  testimonialsSection,
  testimonials,
  faqSection,
  faq,
  guarantee,
  finalCta,
  footer,
  exitIntent,
  thankYou,
  notFound,
  disclosures,
  privacy,
  terms,
};

export default site;
