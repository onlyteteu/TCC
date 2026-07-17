import Link from "next/link";

import { ProductIcon, type ProductIconName } from "@/components/product-icon";
import {
  startupHomeHref,
  startupJourneyHref,
  startupMissionsHref,
} from "@/lib/startup-navigation";

import styles from "./workspace-shell.module.css";

const items = [
  { key: "home", label: "Home", icon: "home", enabled: true },
  { key: "journey", label: "Jornada", icon: "journey", enabled: true },
  { key: "missions", label: "Missoes", icon: "mission", enabled: true },
  { key: "experiments", label: "Experimentos", icon: "flask", enabled: false },
  { key: "learnings", label: "Aprendizados", icon: "book", enabled: false },
  { key: "metrics", label: "Metricas", icon: "chart", enabled: false },
  { key: "documents", label: "Documentos", icon: "file", enabled: false },
  { key: "achievements", label: "Conquistas", icon: "award", enabled: false },
] as const satisfies ReadonlyArray<{
  enabled: boolean;
  icon: ProductIconName;
  key: string;
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
    <nav aria-label="Navegacao principal" className={styles.navigation}>
      <ul className={styles.navigationList}>
        {items.map((item) => {
          const icon = <ProductIcon className={styles.navigationIcon} name={item.icon} />;

          if (item.enabled && startupId !== null) {
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

          const helper = item.enabled ? "Crie uma startup para acessar" : "Em breve";

          return (
            <li key={item.key}>
              <span aria-disabled="true" className={styles.navigationDisabled}>
                {icon}
                <strong>{item.label}</strong>
                <small>{helper}</small>
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
