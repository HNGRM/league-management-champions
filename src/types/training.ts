export type TrainingType =
  | "REST"       // 휴식
  | "MECHANICS"  // 피지컬 훈련
  | "DECISION"   // 판단력 훈련
  | "MENTAL"     // 정신력 훈련
  | "EXECUTION"  // 결정력 훈련
  | "TEAMWORK";  // 팀워크 훈련

export interface PlayerTrainingAssignment {
  trainingType: TrainingType;
  targetChampionId: string | null; // 챔피언 3자리 ID ("001" ~ "080") 또는 휴식 시 null
}

export interface TrainingTypeInfo {
  id: TrainingType;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
  statKey?: "mechanics" | "decision" | "mental" | "execution" | "teamwork";
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const TRAINING_TYPES: TrainingTypeInfo[] = [
  {
    id: "REST",
    label: "휴식",
    shortLabel: "휴식",
    icon: "🟢",
    desc: "체력 회복 집중 (웰니스 센터 효과)",
    badgeBg: "bg-emerald-950/70",
    badgeBorder: "border-emerald-500/40",
    badgeText: "text-emerald-300",
  },
  {
    id: "MECHANICS",
    label: "피지컬 훈련",
    shortLabel: "피지컬",
    icon: "⚔️",
    desc: "라인전 피지컬 및 메카닉 강화",
    statKey: "mechanics",
    badgeBg: "bg-cyan-950/70",
    badgeBorder: "border-cyan-500/40",
    badgeText: "text-cyan-300",
  },
  {
    id: "DECISION",
    label: "판단력 훈련",
    shortLabel: "판단력",
    icon: "🧠",
    desc: "오브젝트 및 한타 상황 판단",
    statKey: "decision",
    badgeBg: "bg-blue-950/70",
    badgeBorder: "border-blue-500/40",
    badgeText: "text-blue-300",
  },
  {
    id: "MENTAL",
    label: "정신력 훈련",
    shortLabel: "정신력",
    icon: "🛡️",
    desc: "위기 대처 및 멘탈 흔들림 방지",
    statKey: "mental",
    badgeBg: "bg-indigo-950/70",
    badgeBorder: "border-indigo-500/40",
    badgeText: "text-indigo-300",
  },
  {
    id: "EXECUTION",
    label: "결정력 훈련",
    shortLabel: "결정력",
    icon: "🎯",
    desc: "킬 캐치 및 스킬 적중도 향상",
    statKey: "execution",
    badgeBg: "bg-purple-950/70",
    badgeBorder: "border-purple-500/40",
    badgeText: "text-purple-300",
  },
  {
    id: "TEAMWORK",
    label: "팀워크 훈련",
    shortLabel: "팀워크",
    icon: "🤝",
    desc: "연계 플레이 및 팀 커뮤니케이션",
    statKey: "teamwork",
    badgeBg: "bg-amber-950/70",
    badgeBorder: "border-amber-500/40",
    badgeText: "text-amber-300",
  },
];

export function getTrainingTypeInfo(type: TrainingType): TrainingTypeInfo {
  return TRAINING_TYPES.find((t) => t.id === type) || TRAINING_TYPES[0];
}
