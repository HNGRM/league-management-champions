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
  | "REST"
  | "SCRIM";

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
  matchIndexInWeek?: number;    // 0: 1차전, 1: 2차전
  homeTeamId: string;
  awayTeamId: string;
  isPlayerMatch: boolean;       // 플레이어 팀 경기 여부
  isHome: boolean;              // 플레이어 기준 홈경기 여부
  format: "Bo3" | "Bo5";
  status: "SCHEDULED" | "COMPLETED";
  result?: MatchResult;
  eventName?: string;           // 비경기 주간 이벤트명 / 스크림명
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
    nameKr: "상반기 국제대회",
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
    nameKr: "하반기 국제대회",
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
 * 캘린더 메인 주차 행(Row)에 표시되는 핵심 이벤트 뱃지 (시즌 개막/폐막, 이적 시장 오픈/마감)
 */
export interface WeekSpecialBadge {
  type: "TRANSFER_OPEN" | "TRANSFER_CLOSE" | "SEASON_START" | "SEASON_END";
  text: string;
  icon: string;
  badgeClass: string;
}

/**
 * 주차별 핵심 특별 뱃지 조회 (주당 최대 1개 배정되어 경기 1~2개와 함께 항상 최대 3개 이내 유지)
 */
export function getWeekSpecialBadge(week: number): WeekSpecialBadge | undefined {
  switch (week) {
    case 1:
      return {
        type: "TRANSFER_OPEN",
        text: "이적 시장 오픈",
        icon: "🔥",
        badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-xs",
      };
    case 4:
      return {
        type: "TRANSFER_CLOSE",
        text: "이적 시장 마감",
        icon: "🔒",
        badgeClass: "bg-red-500/20 text-red-300 border-red-500/40 shadow-xs",
      };
    case 5:
      return {
        type: "SEASON_START",
        text: "스프링 개막",
        icon: "🚩",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs",
      };
    case 20:
      return {
        type: "SEASON_END",
        text: "스프링 폐막",
        icon: "🏁",
        badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/40 shadow-xs",
      };
    case 21:
      return {
        type: "SEASON_START",
        text: "MSI 개막",
        icon: "🚩",
        badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-xs",
      };
    case 24:
      return {
        type: "SEASON_END",
        text: "MSI 폐막",
        icon: "🏁",
        badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/40 shadow-xs",
      };
    case 25:
      return {
        type: "SEASON_START",
        text: "서머 개막",
        icon: "🚩",
        badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs",
      };
    case 40:
      return {
        type: "SEASON_END",
        text: "서머 폐막",
        icon: "🏁",
        badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/40 shadow-xs",
      };
    case 41:
      return {
        type: "SEASON_START",
        text: "월즈 개막",
        icon: "🚩",
        badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs",
      };
    case 48:
      return {
        type: "SEASON_END",
        text: "월즈 폐막",
        icon: "🏁",
        badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/40 shadow-xs",
      };
    default:
      return undefined;
  }
}

/**
 * 주차 행 클릭 시 상세 패널에서 보여줄 세부 이벤트
 */
export interface DetailedEventInfo {
  type: "PAYDAY" | "MEDIA_DAY" | "PATCH" | "AWARDS";
  title: string;
  description: string;
  icon: string;
  badgeClass: string;
}

/**
 * 주차별 상세 이벤트 목록 조회 (월말 결산일, 미디어 데이, 메타 밸런스 패치, 시상식)
 */
export function getWeekDetailedEvents(week: number): DetailedEventInfo[] {
  const events: DetailedEventInfo[] = [];

  // 1. 연간 시상식 (1월 1주차)
  if (week === 1) {
    events.push({
      type: "AWARDS",
      title: "연간 시상식",
      description: "지난 시즌 리그 MVP, 신인왕, 올프로 퍼스트 팀 시상 및 은퇴 발표가 진행됩니다.",
      icon: "🏆",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    });
  }

  // 2. 월말 결산일 (매달 4주차: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48)
  if (week % 4 === 0) {
    events.push({
      type: "PAYDAY",
      title: "월말 결산일",
      description: "이번 주 선수단 월 급여 및 4대 구단 시설 유지비 정산 지출이 진행됩니다.",
      icon: "💰",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    });
  }

  // 3. 미디어 데이 (개막 직전 주차 또는 결승/승강전 주간)
  const mediaDayWeeks = [4, 19, 24, 38, 40, 46];
  if (mediaDayWeeks.includes(week)) {
    let desc = "공식 개막 미디어 인터뷰 기자회견이 예정되어 있습니다.";
    if (week === 19 || week === 38) desc = "결승전을 앞두고 결승 미디어 데이 인터뷰가 진행됩니다.";
    if (week === 40) desc = "운명의 승강 결정전 최종 미디어 인터뷰가 진행됩니다.";
    if (week === 46) desc = "월드 챔피언십 결승전 미디어 데이가 진행됩니다.";

    events.push({
      type: "MEDIA_DAY",
      title: "미디어 데이",
      description: desc,
      icon: "🎤",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    });
  }

  // 4. 메타 밸런스 패치 노트 (3~4주 간격)
  const patchInfo: Record<number, string> = {
    3: "1.0 프리시즌 패치 (신규 시즌 시스템 및 아이템 대격변 적용)",
    5: "1.1 스프링 개막 패치 (주요 1티어 챔피언 밸런스 조정)",
    9: "1.2 정기 패치 (암살자 계열 너프, 원거리 딜러 사거리 버프)",
    13: "1.3 정기 패치 (탱커 아이템 상향, 정글 오브젝트 체력 조정)",
    17: "1.4 스프링 PO 패치 (다전제 밴픽 메타 최적화 패치)",
    21: "1.5 MSI 국제대회 패치 (글로벌 통합 토너먼트 메타 버전)",
    25: "1.6 서머 개막 패치 (서머 스플릿 대규모 시스템 패치)",
    29: "1.7 정기 패치 (미드 메이지 상향, 용 버프 수치 조정)",
    33: "1.8 정기 패치 (탑 브루저 조정, 시야 시스템 개선)",
    37: "1.9 서머 PO 패치 (선발전 및 플레이오프 밸런스 패치)",
    41: "2.0 월즈 패치 (월드 챔피언십 공식 대회 메타 적용)",
  };

  if (patchInfo[week]) {
    events.push({
      type: "PATCH",
      title: "메타 밸런스 패치",
      description: patchInfo[week],
      icon: "⚡",
      badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    });
  }

  return events;
}

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

/**
 * 주차별 3개 고정 슬롯 아이템 인터페이스 (시즌 개막/이적/경기/공식일정/훈련 등)
 */
export interface WeekSlotItem {
  id: string;
  type: "MATCH" | "EVENT" | "TRAINING" | "TACTICS" | "REST";
  tag: string; // "경기" | "이벤트" | "훈련" | "전술" | "휴식"
  tagClass: string;
  icon?: string;
  logoUrl?: string | null;
  title: string;
  badge?: string; // "홈" | "원정" | "공식 일정" | "스탯 육성" 등
  badgeClass?: string;
  subText?: string; // "Bo3" | "Bo5"
  statusText: string;
  statusClass: string;
  isCompleted?: boolean;
}

/**
 * 각 주차별로 정확히 3개의 통일된 칸(슬롯)을 구성하여 반환하는 생성 함수
 */
export function getWeekSlots(
  week: number,
  weekMatches: MatchSchedule[],
  divisionTeams: { teamId: string; teamName: string; logoUrl?: string | null }[],
  currentWeek: number
): WeekSlotItem[] {
  const slots: WeekSlotItem[] = [];
  const isPast = week < currentWeek;
  const isNow = week === currentWeek;

  // 1. 해당 주차의 핵심 특별 뱃지 (스프링 개막, 이적 시장 등)
  const specialBadge = getWeekSpecialBadge(week);
  if (specialBadge) {
    let tag = "이벤트";
    let tagClass = "text-amber-400";
    let badge = "공식 일정";
    let badgeClass = "bg-amber-500/15 text-amber-300 border-amber-500/30";

    if (specialBadge.type.includes("TRANSFER")) {
      tagClass = "text-orange-400";
      badge = "이적 시장";
      badgeClass = "bg-orange-500/15 text-orange-300 border-orange-500/30";
    } else if (specialBadge.type === "SEASON_START") {
      tagClass = "text-emerald-400";
      badge = "공식 일정";
      badgeClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    } else if (specialBadge.type === "SEASON_END") {
      tagClass = "text-slate-400";
      badge = "시즌 폐막";
      badgeClass = "bg-slate-500/15 text-slate-300 border-slate-500/30";
    }

    slots.push({
      id: `special-${week}`,
      type: "EVENT",
      tag,
      tagClass,
      icon: specialBadge.icon,
      title: specialBadge.text,
      badge,
      badgeClass,
      statusText: isPast ? "종료" : isNow ? "진행 중" : "예정",
      statusClass: isPast
        ? "bg-slate-800 text-slate-400 border-slate-700"
        : isNow
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
        : "bg-slate-800/80 text-slate-400 border-slate-700/60",
    });
  }

  // 2. 해당 주차의 플레이어 경기 목록 (1차전/2차전 구분 없이 모두 '경기'로 통일)
  for (let i = 0; i < weekMatches.length; i++) {
    const m = weekMatches[i];
    const oppId = m.isHome ? m.awayTeamId : m.homeTeamId;
    const opp = divisionTeams.find((t) => t.teamId === oppId);
    const isCompleted = m.status === "COMPLETED" && m.result;
    let isWin = false;
    if (isCompleted && m.result) {
      isWin = m.isHome
        ? m.result.homeScore > m.result.awayScore
        : m.result.awayScore > m.result.homeScore;
    }

    let statusText = "예정";
    let statusClass = "bg-slate-800 text-slate-400 border-slate-700";
    if (isCompleted && m.result) {
      statusText = `${m.result.homeScore} : ${m.result.awayScore} ${isWin ? "승" : "패"}`;
      statusClass = isWin
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black"
        : "bg-rose-500/20 text-rose-300 border-rose-500/40 font-black";
    } else if (isNow) {
      statusText = "경기 대기";
      statusClass = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold";
    }

    slots.push({
      id: `match-${m.id}`,
      type: "MATCH",
      tag: "경기",
      tagClass: "text-cyan-400",
      logoUrl: opp?.logoUrl || null,
      title: opp?.teamName || m.eventName || "상대팀",
      badge: m.isHome ? "홈" : "원정",
      badgeClass: m.isHome
        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        : "bg-blue-500/15 text-blue-300 border-blue-500/30",
      subText: m.format,
      statusText,
      statusClass,
      isCompleted: !!isCompleted,
    });
  }

  // 3. 해당 주차 세부 공식 이벤트 (월말 결산일, 메타 패치, 미디어 데이, 시상식 등)
  const detailedEvents = getWeekDetailedEvents(week);
  for (const evt of detailedEvents) {
    if (slots.length >= 3) break;
    slots.push({
      id: `detail-${week}-${evt.type}`,
      type: "EVENT",
      tag: "이벤트",
      tagClass:
        evt.type === "PAYDAY"
          ? "text-emerald-400"
          : evt.type === "PATCH"
          ? "text-cyan-400"
          : "text-amber-400",
      icon: evt.icon,
      title: evt.title,
      badge:
        evt.type === "PAYDAY"
          ? "재정 정산"
          : evt.type === "PATCH"
          ? "패치노트"
          : "공식 일정",
      badgeClass:
        evt.type === "PAYDAY"
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : evt.type === "PATCH"
          ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
          : "bg-amber-500/15 text-amber-300 border-amber-500/30",
      statusText: isPast ? "종료" : isNow ? "진행 중" : "예정",
      statusClass: isPast
        ? "bg-slate-800 text-slate-400 border-slate-700"
        : isNow
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
        : "bg-slate-800/80 text-slate-400 border-slate-700/60",
    });
  }

  // 4. 슬롯이 3개 미만인 경우 루틴 일정으로 정확히 3칸 보장
  const dummyRoutinePool = [
    {
      type: "TRAINING" as const,
      tag: "훈련",
      tagClass: "text-purple-400",
      icon: "🏋️",
      title: "선수단 주간 훈련",
      badge: "스탯 육성",
      badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    },
    {
      type: "TACTICS" as const,
      tag: "전술",
      tagClass: "text-indigo-400",
      icon: "📋",
      title: "전술 분석 회의",
      badge: "밴픽 전략",
      badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    },
    {
      type: "REST" as const,
      tag: "휴식",
      tagClass: "text-teal-400",
      icon: "☕",
      title: "컨디션 회복 휴식",
      badge: "체력 관리",
      badgeClass: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    },
  ];

  let dummyIdx = 0;
  while (slots.length < 3) {
    const routine = dummyRoutinePool[dummyIdx % dummyRoutinePool.length];
    slots.push({
      id: `routine-${week}-${dummyIdx}`,
      type: routine.type,
      tag: routine.tag,
      tagClass: routine.tagClass,
      icon: routine.icon,
      title: routine.title,
      badge: routine.badge,
      badgeClass: routine.badgeClass,
      statusText: isPast ? "완료" : isNow ? "진행 중" : "예정",
      statusClass: isPast
        ? "bg-slate-800 text-slate-400 border-slate-700"
        : isNow
        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
        : "bg-slate-800/80 text-slate-400 border-slate-700/60",
    });
    dummyIdx++;
  }

  return slots.slice(0, 3);
}
