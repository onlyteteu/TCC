import { ProductIcon } from "@/components/product-icon";
import type { TodayPayload } from "@/lib/startup-types";

import styles from "./startup-home-screen.module.css";

type NextUnlockProps = {
  unlock: TodayPayload["nextUnlock"];
};

export function NextUnlock({ unlock }: NextUnlockProps) {
  return (
    <section className={styles.nextUnlock} aria-labelledby="next-unlock-title">
      <div className={styles.sectionHeadingRow}>
        <h3 id="next-unlock-title">Próximo desbloqueio</h3>
        <span
          className={
            unlock.available ? styles.unlockStatusAvailable : styles.unlockStatusLocked
          }
        >
          <ProductIcon name={unlock.available ? "check" : "lock"} />
          {unlock.available ? "Disponível" : "Bloqueado"}
        </span>
      </div>
      <strong>{unlock.title}</strong>
      <p>{unlock.description}</p>
    </section>
  );
}
