import type { MissionEvidenceSummary } from "@/lib/startup-types";

import {
  INTERVIEW_ALTERNATIVE_OPTIONS,
  INTERVIEW_FREQUENCY_OPTIONS,
} from "./guided-interview-model";
import styles from "./interview-evidence-collection.module.css";

type InterviewEvidenceCollectionProps = {
  evidences: MissionEvidenceSummary[];
  requiredCount: number;
};

function formatInterviewDate(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function InterviewEvidenceCollection({
  evidences,
  requiredCount,
}: InterviewEvidenceCollectionProps) {
  return (
    <section aria-labelledby="interview-evidence-collection-title" className={styles.collection}>
      <div className={styles.header}>
        <div>
          <span>Coleção</span>
          <h3 id="interview-evidence-collection-title">Fichas de Evidência</h3>
        </div>
        <p>{evidences.length} de {requiredCount} entrevistas registradas</p>
      </div>

      <ol className={styles.grid}>
        {evidences.map((evidence, index) => {
          const frequency = INTERVIEW_FREQUENCY_OPTIONS.find(
            (option) => option.value === evidence.details.frequency
          );
          const alternative = INTERVIEW_ALTERNATIVE_OPTIONS.find(
            (option) => option.value === evidence.details.currentAlternative
          );

          return (
            <li key={evidence.id}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <time dateTime={evidence.occurredOn}>
                    {formatInterviewDate(evidence.occurredOn)}
                  </time>
                </div>
                <div className={styles.person}>
                  <strong>{evidence.intervieweeName}</strong>
                  {evidence.intervieweeProfile ? (
                    <span>{evidence.intervieweeProfile}</span>
                  ) : null}
                </div>
                {evidence.context ? <p className={styles.context}>{evidence.context}</p> : null}
                {frequency || alternative ? (
                  <div className={styles.chips}>
                    {frequency ? <span>{frequency.label}</span> : null}
                    {alternative ? <span>{alternative.label}</span> : null}
                  </div>
                ) : null}
                <blockquote>{evidence.notes}</blockquote>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
