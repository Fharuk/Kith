import type { SVGProps } from "react";

/**
 * Kith icon set — inline stroke SVG, 24px grid, stroke 1.5.
 * No icon fonts, no <img> icons (playbook 04).
 */
type P = SVGProps<SVGSVGElement>;

const base = (p: P) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const IconShieldCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconMailCheck = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
    <path d="M9.5 13.5l1.8 1.8 3.2-3.6" />
  </svg>
);

export const IconScanFace = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2" />
    <path d="M9 10h.01M15 10h.01M9.5 14.5a3.5 3.5 0 005 0" />
  </svg>
);

export const IconHomeCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 14.5l2 2 3.5-4" />
  </svg>
);

export const IconGavel = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4l6 6M12 6l6 6M13 5l-8 8 2 2 8-8" />
    <path d="M3 21h9" />
    <path d="M7 13l-3 3 2 2 3-3" />
  </svg>
);

export const IconKey = (p: P) => (
  <svg {...base(p)}>
    <circle cx="8" cy="15" r="4" />
    <path d="M10.8 12.2L20 3M15 8l3 3M18 5l2 2" />
  </svg>
);

export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
    <path d="M12 15v2" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
    <path d="M16 5a3.5 3.5 0 010 7M18 14.7c2 .8 3.2 2.6 3.6 5.3" />
  </svg>
);

export const IconPulse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l2.5-6 4 12L16 12h5" />
  </svg>
);

export const IconBuilding = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="3" width="14" height="18" rx="1.5" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
  </svg>
);

export const IconNaira = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 20V4l10 16V4" />
    <path d="M4 9.5h16M4 14.5h16" />
  </svg>
);
