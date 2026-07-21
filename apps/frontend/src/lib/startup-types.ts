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

export type JourneyChapterStatus = "done" | "current" | "locked";
export type JourneyChapterKey =
  | "foundation"
  | "proposal"
  | "validation"
  | "construction";

export interface JourneyChapterSummary {
  key: JourneyChapterKey;
  title: string;
  question: string;
  status: JourneyChapterStatus;
  completedSteps: number;
  totalSteps: number;
  steps: JourneyStepSummary[];
}

export interface JourneyStrategicItem {
  key: string;
  label: string;
  value: string;
  field: "problem" | "audience" | null;
}

export interface JourneyMissionSummary {
  key: string;
  title: string;
  objective: string;
  href: string;
  estimatedMinutes: number;
  xpReward: number;
  status: MissionStatus;
  canContinue: boolean;
}

export interface JourneyMilestoneSummary {
  key: string;
  chapterKey: JourneyChapterKey;
  title: string;
  description: string;
  alreadyBuilt: JourneyStrategicItem[];
  nextUnlock: { title: string; description: string } | null;
  mission: JourneyMissionSummary | null;
  message: string | null;
}

export interface JourneyPayload {
  journey: JourneyStepSummary[];
  progress: number;
  startup: StartupSummary;
  chapters: JourneyChapterSummary[];
  currentMilestone: JourneyMilestoneSummary | null;
  strategicSummary: JourneyStrategicItem[];
  message?: string;
}

export type MissionStatus = "locked" | "available" | "in_progress" | "completed";

export type MissionOrigin = "catalog" | "dynamic";
export type MissionActionType =
  | "interviews"
  | "problem_refinement"
  | "audience_validation"
  | "value_proposition"
  | "alternatives_map";

export interface MissionCardSummary {
  key: string;
  definitionVersion: number;
  origin: MissionOrigin;
  type: string;
  typeLabel: string;
  phase: string;
  title: string;
  objective: string;
  xpReward: number;
  estimatedMinutes: number;
  status: MissionStatus;
  statusLabel: string;
  progress: number;
  actionType: MissionActionType;
  isRequired: boolean;
  order: number;
  priority: number;
  prerequisiteKeys: string[];
  lockedReasons: string[];
  recommendationReason: string | null;
  completedAt: string | null;
}

export interface MissionEvidenceSummary {
  id: number;
  type: string;
  title: string;
  summary: string;
  details: Record<string, string>;
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

export interface MissionDetailSummary extends MissionCardSummary {
  whyItMatters: string;
  instructions: string[];
  completionCriteria: string;
  contextualTip: string;
  requiredEvidenceCount: number;
  evidenceCount: number;
  canAddLearning: boolean;
  canComplete: boolean;
  requirements: MissionRequirement[];
  steps: MissionStepSummary[];
  evidences: MissionEvidenceSummary[];
  learning: MissionLearningSummary | null;
}

// Compatibilidade temporaria com os componentes atuais da Home.
export type MissionSummary = MissionDetailSummary;

export interface MissionCenterPayload {
  startup: StartupSummary;
  catalogVersion: number;
  arc: { key: string; title: string; completed: number; total: number; progress: number };
  recommendedMission: MissionCardSummary | null;
  availableMissions: MissionCardSummary[];
  lockedMissions: MissionCardSummary[];
  completedMissions: MissionCardSummary[];
  gamification: AccountProgress;
}

export interface MissionDetailPayload {
  startup: StartupSummary;
  mission: MissionDetailSummary;
  gamification: AccountProgress;
  nextRecommendedMission?: MissionCardSummary | null;
  message?: string;
  celebration?: { title: string; xpAwarded: number; unlocked: string };
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
  mission: MissionDetailSummary | null;
  missionState: "active" | "arc_complete" | "unavailable";
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
