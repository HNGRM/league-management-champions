import { Position } from "./player";

// 1. 선수 통계 모델
export interface PlayerStatsSummary {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  position: Position;
  matchesPlayed: number; // 경기 수
  avgKills: number; // 평균 킬 (소수점 1자리)
  avgDeaths: number; // 평균 데스 (소수점 1자리)
  avgAssists: number; // 평균 어시스트 (소수점 1자리)
  kda: number; // 평균 KDA ((K+A)/D, 소수점 2자리)
  avgRating: number; // 평균 평점 (1.0 ~ 10.0, 소수점 2자리)
  mvpCount: number; // MVP 횟수
  mostPicks: {
    championId: string; // 3자리 ID ("001"~"080")
    games: number;
    winRate: number; // 승률 (%)
  }[]; // 모스트픽 상위 3개
}

// 2. 팀 통계 모델
export interface TeamStatsSummary {
  teamId: string;
  teamName: string;
  teamLogo?: string | null;
  matchesPlayed: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kda: number;
  avgRating: number;
  firstBloodRate: number; // 선취점 획득률 (0~100%)
  objectiveControlRate: number; // 오브젝트 제어율 (0~100%)
}

// 3. 챔피언 통계 모델
export type ChampionTierGrade = "OP" | "1티어" | "2티어" | "3티어" | "함정픽";

export const CHAMPION_TIER_GRADES: ChampionTierGrade[] = [
  "OP",
  "1티어",
  "2티어",
  "3티어",
  "함정픽",
];

export interface ChampionStatsSummary {
  championId: string;
  nameKr: string;
  nameEn: string;
  primaryRole: string;
  portrait: string; // 1:1 초상화 경로
  wins: number;
  losses: number;
  winRate: number; // 승률 (%)
  pickCount: number; // 픽 횟수
  banCount: number; // 밴 횟수
  pickBanRate: number; // 밴픽률 (%)
  customTier: ChampionTierGrade; // 구단/코치 선정 티어 (수정 가능)
}
