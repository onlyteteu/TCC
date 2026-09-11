import Link from "next/link";

import { ProductIcon, type ProductIconName } from "@/components/product-icon";
import {
  startupHomeHref,
  startupJourneyHref,
  startupMissionsHref,
} from "@/lib/startup-navigation";

import styles from "./workspace-shell.module.css";

const items = [
  { key: "home", label: "Home", icon: "home" },
  { key: "journey", label: "Jornada", icon: "journey" },
  { key: "missions", label: "Missões", icon: "mission" },
] as const satisfies ReadonlyArray<{
  icon: ProductIconName;
  key: "home" | "journey" | "missions";
  label: string;
}>;

export type WorkspaceSection = (typeof items)[number]["key"];

type WorkspaceSidebarProps = {
  activeSection: WorkspaceSection;
  startupId: number | null;
};

function destination(key: "home" | "journey" | "missions", startupId: number) {
  if (key === "home") return startupHomeHref(startupId);
  if (key === "journey") return startupJourneyHref(startupId);
  return startupMissionsHref(startupId);
}

export function WorkspaceSidebar({ activeSection, startupId }: WorkspaceSidebarProps) {
  return (
    <nav aria-label="Navegação principal" className={styles.navigation}>
      <ul className={styles.navigationList}>
        {items.map((item) => {
          const icon = <ProductIcon className={styles.navigationIcon} name={item.icon} />;

          if (startupId !== null) {
            return (
              <li key={item.key}>
                <Link
                  aria-current={activeSection === item.key ? "page" : undefined}
                  className={styles.navigationLink}
                  href={destination(item.key, startupId)}
                >
                  {icon}
                  <strong>{item.label}</strong>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.key}>
              <span aria-disabled="true" className={styles.navigationDisabled}>
                {icon}
                <strong>{item.label}</strong>
                <small>Crie uma startup para acessar</small>
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
