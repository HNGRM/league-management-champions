import { AvatarDna } from "./avatar";
import { ActivePlayerCondition } from "./playerCondition";

export type Position = "TOP" | "JGL" | "MID" | "BOT" | "SUP";
export type RosterStatus = "Starter" | "Sub" | "FA";
export type EntityStatus = "Active" | "FA" | "Upcoming";
export type FormLevel = "최상" | "상승" | "보통" | "하락" | "최악";
export type LeagueLanguage = "KCL" | "CCL" | "ECL" | "ACL" | "PCL";

export interface PlayerProfile {
  playerId: string;                      // 예: "P_0001" ~ "P_1250"
  nicknameKr: string;                    // 한글 닉네임 (예: "제니스")
  nicknameEn: string;                    // 영문 닉네임 (예: "Zenith", 3~6글자 제한)
  avatarConfig: AvatarDna;               // 아바타 렌더러 파라미터 (주름 0, 유니폼 저지)
  age: number;                           // 만 나이 (17~29세)
  careerYears: number;                   // 프로 데뷔 N년차 (1년차 = 신인왕 후보 자격)
  firstLanguage: LeagueLanguage;         // 모국어 (KCL, CCL, ECL, ACL, PCL 중 1개)
  secondLanguage: LeagueLanguage | null; // 제2외국어 (KCL, CCL, ECL, ACL, PCL 중 1개 혹은 없음)
  availableYear: number;                 // 게임 등장 연차 (1: 1년차 현역/FA, 2~10: N년차 신입 루키)
  status: EntityStatus;                  // 활동 상태 ("Active": 구단소속, "FA": 자유계약, "Upcoming": 미래등장)
}

export interface PlayerContractAndRole {
  teamId: string | null;                 // 소속 팀 ID (예: "KCL-001", 무소속 FA는 null)
  rosterStatus: RosterStatus | null;     // 주전(Starter) / 후보(Sub) / 무소속(null)
  mainPos: Position;                     // 주 포지션 (전투 효율 100%)
  subPos: Position;                      // 부 포지션 (기본 효율 80%)
  salary: number;                        // 연간 연봉 (원화 기준, FA는 0)
  contractYears: number;                 // 잔여 계약 연수 (1~3년, FA는 0)
  marketValue: number;                   // 시장 추정 가치 (이적 시장 바이아웃 기준액, FA는 0)
}

export interface PlayerStats {
  mechanics: number;          // 피지컬 (1~100)
  decision: number;          // 판단력 (1~100)
  mental: number;            // 정신력 (1~100)
  execution: number;         // 결정력 (1~100)
  teamwork: number;          // 팀워크 (1~100)
}

export interface PlayerStatsExp {
  mechanics: number;         // 메카닉 경험치 (0~100)
  decision: number;          // 판단력 경험치 (0~100)
  mental: number;            // 정신력 경험치 (0~100)
  execution: number;         // 결정력 경험치 (0~100)
  teamwork: number;          // 팀워크 경험치 (0~100)
}

export interface PlayerTalentAndGrowth {
  potential: number;         // 성장기대치 (0~100: 훈련 시 스탯 상승 확률 단일 연산)
  potentialDecay: number;    // 연간 잠재력 감퇴치 (히든 스탯: 표준 7~8 [70%], 롱런 4~5 [15%], 조기쇠퇴 10~11 [15%] - 비공개)
  starQuality: number;       // 스타성 (1~100: 팬덤 유입 및 MD 판매 배율, 디비전 체급별 기준 ±25)
}

export interface PlayerTraitsAndMastery {
  traits: string[];                       // 고유 특성 ID 배열 (50종 중 1~3개 ID)
  conditions: ActivePlayerCondition[];    // 조건부 가변 상태 슬롯 (10종 중 최대 2개 슬롯 / 초기: [])
  championMastery: Record<string, number>; // 80종 챔피언 숙련도 점수 (001~080, 0~100점)
}

export interface PlayerConditionAndForm {
  form: FormLevel;           // 컨디션 (초기: "보통")
  stamina: number;           // 체력 (0~100%, 초기: 100)
  morale: number;            // 의욕/사기 (0~100%, 초기: 100)
  recentRatings: number[];   // 최근 5경기 개인 평점 큐 (초기: [])
}

export interface Player {
  profile: PlayerProfile;
  contractAndRole: PlayerContractAndRole;
  stats: PlayerStats;
  statsExp: PlayerStatsExp;
  talentAndGrowth: PlayerTalentAndGrowth;
  traitsAndMastery: PlayerTraitsAndMastery;
  conditionAndForm: PlayerConditionAndForm;
}
