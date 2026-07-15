import Link from "next/link";

import { QuestMark } from "@/components/quest-mark";

import styles from "./workspace-shell.module.css";

export function WorkspaceBrand({ href }: { href: string }) {
  return (
    <Link aria-label="Startup Quest" className={styles.brand} href={href}>
      <span className={styles.brandMark}>
        <QuestMark mode="compact" />
      </span>
      <span aria-hidden="true" className={styles.brandName}>
        <span data-brand-line>Startup</span>
        <span data-brand-line>Quest</span>
      </span>
    </Link>
  );
}
