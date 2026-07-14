import type { SVGProps } from "react";

export type ProductIconName =
  | "award"
  | "book"
  | "building"
  | "chart"
  | "check"
  | "chevron"
  | "file"
  | "flame"
  | "flask"
  | "home"
  | "info"
  | "journey"
  | "level"
  | "lock"
  | "mission"
  | "plus"
  | "settings";

type ProductIconProps = SVGProps<SVGSVGElement> & {
  name: ProductIconName;
};

export function ProductIcon({ name, ...props }: ProductIconProps) {
  const paths: Record<ProductIconName, React.ReactNode> = {
    award: (
      <>
        <circle cx="12" cy="8" r="5" />
        <path d="m8.7 12.1-1.2 8 4.5-2.4 4.5 2.4-1.2-8" />
        <path d="m10.5 8 1 1 2-2" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </>
    ),
    building: (
      <>
        <path d="M4 21V7l8-4 8 4v14" />
        <path d="M8 10h1m3 0h1m3 0h1M8 14h1m3 0h1m3 0h1M3 21h18" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    file: (
      <>
        <path d="M6 2h8l4 4v16H6z" />
        <path d="M14 2v5h5M9 12h6m-6 4h6" />
      </>
    ),
    flame: (
      <path d="M12.5 22c4 0 7-2.8 7-6.8 0-3.2-1.7-5.7-4.5-8.7-.4 2-1.5 3.3-2.8 4.3.2-3.5-1.4-6.5-4-8.8.1 3.7-3.7 6.3-3.7 12.7 0 4.5 3.3 7.3 8 7.3Z" />
    ),
    flask: (
      <>
        <path d="M9 2h6m-5 0v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V2" />
        <path d="M7.5 15h9" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-7h6v7" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5m0-9h.01" />
      </>
    ),
    journey: (
      <>
        <path d="M4 5.5 9 3l6 2.5L20 3v15.5L15 21l-6-2.5L4 21z" />
        <path d="M9 3v15.5m6-13V21" />
      </>
    ),
    level: <path d="m12 2 8 4.6v9.2L12 20l-8-4.2V6.6z" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    mission: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3V1m0 22v-2M3 12H1m22 0h-2" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      {...props}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
}
