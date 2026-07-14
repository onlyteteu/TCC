export interface StartupSummary {
  id: number;
  name: string;
  description: string;
  segment: string;
  problem: string;
  audience: string;
  currentStage: string;
  currentStageLabel: string;
  initialGoal: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string | null;
  lastActivityAt?: string;
  /** Presentes apenas na listagem do painel. */
  journeyProgress?: number;
  nextStepLabel?: string | null;
}

export interface Achievement {
  key: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export interface AccountProgress {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpPerLevel: number;
  achievements: Achievement[];
  unlockedCount: number;
  currentStreak?: number;
  longestStreak?: number;
  streakStatus?: "inactive" | "maintained" | "at_risk" | "broken";
  lastActivityDate?: string | null;
}

export interface StartupListPayload {
  startups: StartupSummary[];
  accountProgress?: AccountProgress;
}

export interface StartupCreatePayload {
  message: string;
  startup: StartupSummary;
}

export interface StartupOpenPayload {
  message: string;
  startup: StartupSummary;
}

export interface StartupDeletePayload {
  deletedStartupId: number;
  message: string;
  nextStartupId: number | null;
}

export interface StartupUpdatePayload {
  message: string;
  startup: StartupSummary;
}

export interface StartupDetailPayload {
  startup: StartupSummary;
}

export type JourneyStepStatus = "pending" | "current" | "done";

export interface JourneyStepSummary {
  key: string;
  title: string;
  status: JourneyStepStatus;
  answer: string;
  order: number;
  completedAt: string | null;
}

export interface JourneyPayload {
  journey: JourneyStepSummary[];
  progress: number;
  startup: StartupSummary;
  message?: string;
}

export type MissionStatus = "locked" | "available" | "in_progress" | "completed";

export interface MissionEvidenceSummary {
  id: number;
  type: string;
  intervieweeName: string;
  intervieweeProfile: string;
  context: string;
  notes: string;
  occurredOn: string;
  createdAt: string;
}

export interface MissionLearningSummary {
  id: number;
  content: string;
  impact: string;
  nextAction: string;
  confidence: "low" | "medium" | "high";
  confidenceLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissionRequirement {
  key: string;
  label: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface MissionStepSummary {
  key: string;
  title: string;
  description: string;
  status: "locked" | "available" | "current" | "completed";
}

export interface MissionSummary {
  key: string;
  type: string;
  typeLabel: string;
  phase: string;
  title: string;
  objective: string;
  whyItMatters: string;
  instructions: string[];
  completionCriteria: string;
  contextualTip: string;
  requiredEvidenceCount: number;
  evidenceCount: number;
  xpReward: number;
  status: MissionStatus;
  statusLabel: string;
  progress: number;
  canAddLearning: boolean;
  canComplete: boolean;
  completedAt: string | null;
  requirements: MissionRequirement[];
  steps: MissionStepSummary[];
  evidences: MissionEvidenceSummary[];
  learning: MissionLearningSummary | null;
}

export interface ActivitySummary {
  id: number;
  kind: string;
  kindLabel: string;
  description: string;
  xpAwarded: number;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface TodayPayload {
  user: { firstName: string };
  startup: StartupSummary;
  journey: {
    progress: number;
    completedSteps: number;
    totalSteps: number;
    currentStepKey: string | null;
    currentStepLabel: string | null;
  };
  mission: MissionSummary | null;
  gamification: AccountProgress;
  recentActivities: ActivitySummary[];
  nextUnlock: {
    key: string;
    title: string;
    description: string;
    available: boolean;
  };
  message?: string;
  celebration?: {
    title: string;
    xpAwarded: number;
    unlocked: string;
  };
}
