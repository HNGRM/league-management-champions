export type SeasonPhase =
  | "STOVE_LEAGUE"
  | "SPRING_SEASON"
  | "MSI_INTERNATIONAL"
  | "SUMMER_SEASON"
  | "WORLDS_INTERNATIONAL";

export type MatchType =
  | "REGULAR"
  | "PLAYOFF"
  | "PROMOTION"
  | "INTERNATIONAL"
  | "EVENT"
  | "REST";

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  winnerId: string;
}

export interface MatchSchedule {
  id: string;
  week: number;                 // 1 ~ 48
  month: number;                // 1 ~ 12
  monthWeek: number;            // 1 ~ 4
  phase: SeasonPhase;
  matchType: MatchType;
  homeTeamId: string;
  awayTeamId: string;
  isPlayerMatch: boolean;       // 플레이어 팀 경기 여부
  isHome: boolean;              // 플레이어 기준 홈경기 여부
  format: "Bo3" | "Bo5";
  status: "SCHEDULED" | "COMPLETED";
  result?: MatchResult;
  eventName?: string;           // 스토브리그/국제대회 등 비경기 주간 이벤트명
  eventDescription?: string;    // 주간 이벤트/경기 상세 설명
  eventIcon?: string;           // 이모지 아이콘 (예: ❄️, 🌸, 🏆, ☀️, ⚔️, 🌍)
  cautionChampions?: string[];  // 상대 팀 핵심 경계 챔피언 TOP 3 ID ("001" ~ "080")
  divisionTier?: string;        // 소속 디비전 ("A" | "B" | "C" | "D")
}

export interface SeasonPhaseMeta {
  phase: SeasonPhase;
  nameKr: string;
  nameEn: string;
  icon: string;
  badgeClass: string;
  headerBgClass: string;
  accentText: string;
  description: string;
  weeksSpan: string;
}

export const SEASON_PHASE_METAS: Record<SeasonPhase, SeasonPhaseMeta> = {
  STOVE_LEAGUE: {
    phase: "STOVE_LEAGUE",
    nameKr: "스토브리그",
    nameEn: "STOVE LEAGUE",
    icon: "❄️",
    badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]",
    headerBgClass: "from-cyan-950/40 via-blue-950/20 to-slate-900/60",
    accentText: "text-cyan-400",
    description: "로스터 개편, 스폰서 협상 및 프리시즌 전력 정비 기간",
    weeksSpan: "1~4주차 (1월)",
  },
  SPRING_SEASON: {
    phase: "SPRING_SEASON",
    nameKr: "스프링 시즌",
    nameEn: "SPRING SPLIT",
    icon: "🌸",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    headerBgClass: "from-emerald-950/40 via-teal-950/20 to-slate-900/60",
    accentText: "text-emerald-400",
    description: "상반기 정규리그 및 스프링 플레이오프 결전",
    weeksSpan: "5~20주차 (2~5월)",
  },
  MSI_INTERNATIONAL: {
    phase: "MSI_INTERNATIONAL",
    nameKr: "MSI 국제대회",
    nameEn: "MSI INTERNATIONAL",
    icon: "🏆",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]",
    headerBgClass: "from-purple-950/40 via-indigo-950/20 to-slate-900/60",
    accentText: "text-purple-400",
    description: "세계 최강 팀들의 미드 시즌 인비테이셔널 & 하위리그 서머 부트캠프",
    weeksSpan: "21~24주차 (6월)",
  },
  SUMMER_SEASON: {
    phase: "SUMMER_SEASON",
    nameKr: "서머 시즌",
    nameEn: "SUMMER SPLIT",
    icon: "☀️",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    headerBgClass: "from-amber-950/40 via-orange-950/20 to-slate-900/60",
    accentText: "text-amber-400",
    description: "월즈 진출권과 승강전의 운명이 걸린 하반기 정규리그",
    weeksSpan: "25~40주차 (7~10월)",
  },
  WORLDS_INTERNATIONAL: {
    phase: "WORLDS_INTERNATIONAL",
    nameKr: "월드 챔피언십",
    nameEn: "WORLDS CHAMPIONSHIP",
    icon: "🌍",
    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
    headerBgClass: "from-rose-950/40 via-red-950/20 to-slate-900/60",
    accentText: "text-rose-400",
    description: "세계 최고 권위의 월드 챔피언십 토너먼트 및 연간 시즌 결산",
    weeksSpan: "41~48주차 (11~12월)",
  },
};

/**
 * 연간 주차(1~48)를 월(1~12) 및 해당 월의 주차(1~4)로 변환
 */
export function getWeekMonthInfo(week: number): { month: number; monthWeek: number } {
  const clamped = Math.max(1, Math.min(48, Math.floor(week)));
  const month = Math.floor((clamped - 1) / 4) + 1;
  const monthWeek = ((clamped - 1) % 4) + 1;
  return { month, monthWeek };
}

/**
 * 월(1~12)과 월내 주차(1~4)를 연간 주차(1~48)로 변환
 */
export function getWeekFromMonth(month: number, monthWeek: number): number {
  const clampedM = Math.max(1, Math.min(12, Math.floor(month)));
  const clampedW = Math.max(1, Math.min(4, Math.floor(monthWeek)));
  return (clampedM - 1) * 4 + clampedW;
}

/**
 * 주차(1~48)에 해당하는 시즌 페이즈 조회
 */
export function getSeasonPhase(week: number): SeasonPhase {
  if (week <= 4) return "STOVE_LEAGUE";
  if (week <= 20) return "SPRING_SEASON";
  if (week <= 24) return "MSI_INTERNATIONAL";
  if (week <= 40) return "SUMMER_SEASON";
  return "WORLDS_INTERNATIONAL";
}

/**
 * 월(1~12)에 해당하는 주 페이즈 조회
 */
export function getSeasonPhaseForMonth(month: number): SeasonPhase {
  const startWeek = (Math.max(1, Math.min(12, month)) - 1) * 4 + 1;
  return getSeasonPhase(startWeek);
}
