import styles from "./quest-mark.module.css";

type QuestMarkProps = {
  animated?: boolean;
  mode?: "login" | "register";
};

export function QuestMark({ animated = false, mode = "login" }: QuestMarkProps) {
  return (
    <div
      className={[
        styles.shell,
        mode === "register" ? styles.register : styles.login,
        animated ? styles.hasBreath : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.pulse}>
        <svg
          className={styles.svg}
          viewBox="0 0 132 132"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="66" cy="66" r="47" fill="#1A1411" />
          <circle cx="66" cy="66" r="47" stroke="#D89A35" strokeOpacity="0.46" strokeWidth="2" />
          <circle
            cx="66"
            cy="66"
            r="65"
            stroke="#D89A35"
            strokeOpacity="0.16"
            strokeDasharray="8 10"
          />
          <path
            d="M46 66C46 77.0457 54.9543 86 66 86C77.0457 86 86 77.0457 86 66C86 54.9543 77.0457 46 66 46C54.9543 46 46 54.9543 46 66Z"
            stroke="#D89A35"
            strokeWidth="7"
          />
          <path
            d="M94 74C91 85 81 97 65 105"
            stroke="#D89A35"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
