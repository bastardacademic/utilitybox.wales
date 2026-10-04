/** Shared shape and cross-links for the standalone FAQ pages (/faq/, /faq/money/, /faq/developer/). */

export interface FaqLink {
  href: string;
  label: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  /** Optional links shown under the answer, e.g. the tool the answer relates to. */
  links?: FaqLink[];
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const FAQ_PAGES: FaqLink[] = [
  { href: '/faq/', label: 'About UtilityBox' },
  { href: '/faq/money/', label: 'UK money & budgeting' },
  { href: '/faq/developer/', label: 'Developer & networking' }
];
