// Core Types for League Management: Champions

import { AvatarDna } from "./avatar";
import { Player as RosterPlayer } from "./player";

export type Position = "TOP" | "JUG" | "MID" | "ADC" | "SUP";

export interface PlayerStats {
  mechanics: number; // 메카닉 (라인전, 피지컬)
  macro: number;     // 오더, 맵 리딩, 운영
  mental: number;    // 멘탈, 위기 대처 능력
  teamwork: number;  // 팀워크, 한타 기여도
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  position: Position;
  age: number;
  overall: number; // 종합 레이팅 (OVR)
  potential: number; // 잠재력 (POT)
  stats: PlayerStats;
  condition: number; // 컨디션 (0 ~ 100)
  morale: number;    // 사기 (0 ~ 100)
  salary: number;    // 연봉 (원 단위 or 골드)
  contractYears: number; // 잔여 계약 기간
  championPool: string[]; // 주력 챔피언 목록
}

export interface Manager {
  id: string;
  name: string;
  role: "HEAD_COACH" | "COACH";
  tactics: number;    // 밴픽/전술 능력
  leadership: number; // 선수단 관리/사기 진작
  training: number;   // 선수 육성
  salary: number;
}

// 플레이어 감독 생성 프로필
export type TacticalPhilosophy = "매우 공격적" | "공격적" | "수비적" | "매우 수비적";
export type FinancialPhilosophy = "매우 과감함" | "과감함" | "신중함" | "매우 신중함";
export type PlayerManagementPhilosophy = "매우 엄격함" | "엄격함" | "유연함" | "매우 유연함";

export type LeagueLanguage = "KCL" | "CCL" | "ECL" | "ACL" | "PCL";

// 4대 디비전 체계 (A: 1부(10팀), B: 2부(8팀), C: 3부(6팀), D: 4부(6팀/플레이어 시작))
export type DivisionTier = "A" | "B" | "C" | "D";

export interface TeamStanding {
  rank: number;
  teamId: string;
  teamName: string;
  teamNameEn: string;
  shortName: string;
  logoUrl: string | null;
  isPlayer: boolean;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number; // 득실차
  winRate: number; // 승률 (%)
}

export interface LeagueDivisions {
  A: TeamStanding[];
  B: TeamStanding[];
  C: TeamStanding[];
  D: TeamStanding[];
}

// 5개 리그 사전 정의 팀 데이터
export interface PredefinedTeam {
  id: string;
  league: LeagueLanguage;
  city: string;
  country: string;
  region: string;
  nameKo: string;
  nameEn: string;
  shortName: string;
  category: string;
  background: string;
}

// 사용자 커스텀 팀 정보 (한글 팀명 최대 12자, 영문 팀명 최대 20자, 영문 약칭 3자, 커스텀 로고)
export interface CustomTeamInfo {
  nameKo: string;    // 한글 팀명 (최대 12자)
  nameEn: string;    // 영문 팀명 (최대 20자)
  shortName: string; // 영문 약칭 (정확히 3자)
  customLogoUrl?: string | null; // 커스텀 업로드 로고 (Data URL 또는 이미지 URL)
}

export interface ManagerProfile {
  name: string; // 하위 호환
  nameKo: string; // 감독 닉네임 (한글, 최대 8자)
  nameEn: string; // 감독 닉네임 (영문, 최대 14자)
  portrait: string; // 빈 문자열("")이면 미선택 상태
  faceDna?: AvatarDna | null; // 커스텀 아바타 DNA
  tactics: TacticalPhilosophy | null;
  finance: FinancialPhilosophy | null;
  playerManagement: PlayerManagementPhilosophy | null;
  languages: LeagueLanguage[]; // 초기 빈 배열 []
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  foundedYear: number;
  balance: number;       // 팀 잔고 (자금)
  fans: number;          // 팬덤 수
  reputation: number;    // 팀 명성 (0 ~ 100)
  roster: RosterPlayer[]; // 1군 로스터 (최신 Player 스키마)
  subRoster?: RosterPlayer[]; // 2군/후보 로스터
  staff: Manager[];      // 코칭스태프
}

export interface Contract {
  id: string;
  playerId: string;
  teamId: string;
  annualSalary: number;
  yearsRemaining: number;
  signedDate: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: "MAIN" | "SUB";
  annualFunding: number; // 연간 지원금
  goalText: string;      // 스폰서 목표
  isCompleted: boolean;
  yearsRemaining: number;
}

export type NegotiationStatus = "IDLE" | "OFFERED" | "ACCEPTED" | "REJECTED" | "FINAL_OFFER";

export interface NegotiationState {
  playerId: string;
  offeredSalary: number;
  offeredYears: number;
  playerInterest: number; // 선수의 계약 관심도 (0 ~ 100)
  status: NegotiationStatus;
  patience: number;       // 협상 인내도 (턴마다 감소)
}

// 팀 세이브/슬롯 타입
export interface SaveSlot {
  id: number;
  isCreated: boolean;
  isLocked: boolean;
  team?: Team;
  myPlayers?: RosterPlayer[];
  managerProfile?: ManagerProfile;
  customTeamInfo?: CustomTeamInfo;
  selectedLeague?: LeagueLanguage | null;
  selectedTeam?: PredefinedTeam | null;
  leagueDivisions?: LeagueDivisions;
  currentDivision?: DivisionTier;
  lastPlayedAt?: string;
}
