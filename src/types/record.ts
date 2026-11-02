import { DivisionTier, LeagueLanguage, TeamStanding } from "./game";
import { Position } from "./player";

// 4대 메이저 대회 종류
export type TournamentType = "SPRING" | "MCC" | "SUMMER" | "WCC";

export interface TournamentMeta {
  type: TournamentType;
  nameKr: string;
  nameEn: string;
  badgeClass: string;
  icon: string;
}

export const TOURNAMENT_METAS: Record<TournamentType, TournamentMeta> = {
  SPRING: {
    type: "SPRING",
    nameKr: "스프링 시즌",
    nameEn: "Spring Split",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: "🌸",
  },
  MCC: {
    type: "MCC",
    nameKr: "미드시즌 챔피언스 컵",
    nameEn: "Mid-Season Champions Cup",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    icon: "🏆",
  },
  SUMMER: {
    type: "SUMMER",
    nameKr: "서머 시즌",
    nameEn: "Summer Split",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: "☀️",
  },
  WCC: {
    type: "WCC",
    nameKr: "월드 챔피언스 컵",
    nameEn: "World Champions Cup",
    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    icon: "🌍",
  },
};

// 컵 대회(MCC, WCC) 16강 토너먼트 팀 성적
export interface CupTeamResult {
  rank: number;                  // 1 (우승), 2 (준우승), 3~4 (4강), 5~8 (8강), 9~16 (16강)
  rankLabel: string;             // "우승 🏆", "준우승 🥈", "4강 (Semis)", "8강", "16강"
  teamId: string;
  teamName: string;
  shortName: string;
  league: LeagueLanguage;        // 소속 리그 (KCL, CCL, ECL, ACL, PCL)
  logoUrl?: string | null;
  matchScore?: string;           // 결승전 스코어 (예: "3 - 2")
}

// 16강 토너먼트 대진표(Bracket)용 단일 팀 정보
export interface BracketMatchTeam {
  teamId: string;
  teamName: string;
  shortName: string;
  league: LeagueLanguage;
  seedInfo: string;           // 예: "KCL 1시드", "CCL 2시드" 등
  logoUrl?: string | null;
  score: number;              // 세트 득점 (예: 3, 2, 1, 0)
  isWinner: boolean;          // 승리 여부
  isChampion?: boolean;       // 최종 우승 여부 (결승전 승리팀)
}

// 토너먼트 단일 경기
export interface BracketMatch {
  matchId: string;            // "R16-1" ~ "R16-8", "QF-1" ~ "QF-4", "SF-1" ~ "SF-2", "FINAL"
  roundLabel: string;         // "16강 1경기", "8강 1경기", "4강 1경기", "결승전"
  dateLabel: string;          // "6/2", "6/9", "6/16", "6/21" 등
  team1: BracketMatchTeam;
  team2: BracketMatchTeam;
}

// 16강 전체 대진표 구조 (싱글 엘리미네이션 - MCC)
export interface TournamentBracket {
  roundOf16: BracketMatch[];     // 8경기
  quarterFinals: BracketMatch[]; // 4경기
  semiFinals: BracketMatch[];    // 2경기
  finals: BracketMatch;          // 1경기
}

// 16팀 더블 엘리미네이션 대진표 구조 (WCC 월드 챔피언스 컵)
export interface DoubleEliminationBracket {
  // 1. 승자조 (Upper Bracket - 총 15경기)
  upper: {
    roundOf16: BracketMatch[];     // 8경기 (16팀)
    quarterFinals: BracketMatch[]; // 4경기 (8팀)
    semiFinals: BracketMatch[];    // 2경기 (4팀)
    upperFinal: BracketMatch;      // 1경기 (승자조 결승 -> 승자는 그랜드 파이널 진출)
  };
  // 2. 패자조 (Lower Bracket - 총 14경기)
  lower: {
    round1: BracketMatch[];        // 4경기 (승자 16강 패자 8팀 맞대결)
    round2: BracketMatch[];        // 4경기 (R1 승자 4팀 vs 승자 8강 패자 4팀)
    round3: BracketMatch[];        // 2경기 (R2 승자 4팀 맞대결)
    round4: BracketMatch[];        // 2경기 (R3 승자 2팀 vs 승자 준결승 패자 2팀)
    lowerSemiFinal: BracketMatch;  // 1경기 (R4 승자 2팀 맞대결 -> 패자 최종 4위)
    lowerFinal: BracketMatch;      // 1경기 (lowerSemiFinal 승자 vs upperFinal 패자 -> 패자 최종 3위)
  };
  // 3. 최종 결승 (Grand Final - 1경기)
  grandFinal: BracketMatch;        // 승자조 1위 vs 패자조 1위 (Bo5 최종 결승)
}

// 연도별 대회 순위표/결과 보관 인터페이스
export interface TournamentHistory {
  id: string;                    // 예: "2025_SPRING_KCL_A", "2025_WCC"
  year: number;                  // 연도 (2024, 2025, 2026, 2027...)
  type: TournamentType;          // "SPRING" | "MCC" | "SUMMER" | "WCC"
  league?: LeagueLanguage;       // 국내 리그일 경우 (KCL, CCL, ECL, ACL, PCL)
  division?: DivisionTier;       // 국내 리그일 경우 ("A" | "B" | "C" | "D")
  winnerTeamName: string;        // 우승팀 이름
  winnerShortName: string;       // 우승팀 약칭
  winnerLogoUrl?: string | null;
  runnerUpTeamName: string;      // 준우승팀 이름
  finalsMvpName?: string;        // 결승 MVP
  standings?: TeamStanding[];    // 정규 리그(스프링/서머) 순위표
  cupResults?: CupTeamResult[];  // 국제 컵(MCC/WCC) 16강 토너먼트 결과
  bracket?: TournamentBracket;   // 컵 대회(MCC) 16강 대진표 토너먼트 구조
  wccBracket?: DoubleEliminationBracket; // 컵 대회(WCC) 16팀 더블 엘리미네이션 토너먼트 구조
}

// 6대 선수 통산 지표 카테고리
export type CareerStatCategory =
  | "MVP"
  | "KILLS"
  | "ASSISTS"
  | "RATING"
  | "SOLO_KILLS"
  | "PENTAKILLS";

export interface CareerStatMeta {
  key: CareerStatCategory;
  nameKr: string;
  unit: string;
  icon: string;
  description: string;
}

export const CAREER_STAT_METAS: Record<CareerStatCategory, CareerStatMeta> = {
  MVP: {
    key: "MVP",
    nameKr: "통산 MVP",
    unit: "회",
    icon: "🏅",
    description: "공식 경기 최우수 선수(MVP/POG) 최다 선정 랭킹",
  },
  KILLS: {
    key: "KILLS",
    nameKr: "통산 킬",
    unit: "킬",
    icon: "⚔️",
    description: "리그 공식전 누적 최다 킬 마일스톤 클럽",
  },
  ASSISTS: {
    key: "ASSISTS",
    nameKr: "통산 어시스트",
    unit: "어시",
    icon: "🤝",
    description: "팀파이트 기여도와 연계 플레이의 정점",
  },
  RATING: {
    key: "RATING",
    nameKr: "통산 평균 평점",
    unit: "점",
    icon: "🌟",
    description: "꾸준하고 폭발적인 경기력의 지표 (30경기 이상)",
  },
  SOLO_KILLS: {
    key: "SOLO_KILLS",
    nameKr: "통산 솔로킬",
    unit: "회",
    icon: "🗡️",
    description: "라이너의 순수 1:1 무력과 맞라인 킬 랭킹",
  },
  PENTAKILLS: {
    key: "PENTAKILLS",
    nameKr: "통산 펜타킬",
    unit: "회",
    icon: "🔥",
    description: "단일 세트 상대 5인을 홀로 괴멸시킨 리그 최고 영예",
  },
};

// 선수 개인 통산 기록
export interface PlayerCareerRecord {
  playerId: string;
  playerName: string;            // 선수 닉네임 (소환사명)
  realName?: string;             // 본명
  position: Position;            // TOP, JGL, MID, BOT, SUP
  teamName: string;              // 소속팀명
  teamLogoUrl?: string | null;
  league: LeagueLanguage;
  totalGames: number;            // 통산 출전 경기 수
  totalMvpCount: number;         // 통산 MVP 선정 횟수
  totalKills: number;            // 통산 킬
  totalAssists: number;          // 통산 어시스트
  avgRating: number;             // 통산 평균 평점 (예: 8.4)
  soloKills: number;             // 통산 솔로킬
  pentakills: number;            // 통산 펜타킬
}

// 구단 역사 연표 카드 (플레이어 구단 타임라인)
export interface ClubHistoryTransfer {
  playerName: string;
  position: Position;
  type: "FA" | "BUYOUT" | "RELEASE" | "SALE";
  fee?: number;                  // 이적료 (원 단위)
}

export interface ClubHistoryEntry {
  year: number;                  // 연도
  division: DivisionTier;        // 당시 소속 디비전
  springRank: number;            // 스프링 순위
  springResult: string;          // 스프링 세부 결과 (예: "리그 D 2위 (플레이오프 준우승)")
  mccResult: string;             // 상반기 국제대회 결과 (예: "진출 실패" 또는 "8강 진출")
  summerRank: number;            // 서머 순위
  summerResult: string;          // 서머 세부 결과 (예: "리그 D 1위 (🏆 우승 & C 승격)")
  wccResult: string;             // 하반기 월드 파이널 결과 (예: "진출 실패")
  transfersIn: ClubHistoryTransfer[];
  transfersOut: ClubHistoryTransfer[];
  milestones: string[];          // 구단 주요 마일스톤
}
