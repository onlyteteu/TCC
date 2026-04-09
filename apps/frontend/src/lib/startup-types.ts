export interface StartupSummary {
  id: number;
  name: string;
  description: string;
  segment: string;
  currentStage: string;
  currentStageLabel: string;
  initialGoal: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartupListPayload {
  startups: StartupSummary[];
}

export interface StartupCreatePayload {
  message: string;
  startup: StartupSummary;
}
