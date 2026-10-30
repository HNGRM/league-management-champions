import { AvatarDna } from "./avatar";
import { LeagueLanguage } from "./game";
import { EntityStatus } from "./player";

export type { EntityStatus };

export type CoachRole =
  | "인게임 코치"
  | "분석 코치"
  | "훈련 코치"
  | "관리 코치"
  | "영입 코치"
  | "스카우트 코치"
  | "전력분석 코치"
  | "팀 관리 코치"
  | "스카우터";

export interface CoachProfile {
  coachId: string;                       // 코치 고유 식별자 (예: "C_0001" ~)
  nicknameKr: string;                    // 한글 닉네임 (예: "블레소")
  nicknameEn: string;                    // 영문 닉네임 (예: "Bleso")
  avatarConfig: AvatarDna;               // 아바타 렌더러 파라미터 (주름 0, 유니폼 자켓)
  age: number;                           // 만 나이 (25~39세)
  careerYears: number;                   // 코치 데뷔 N년차 (1~9년차)
  firstLanguage: LeagueLanguage;         // 주 사용 언어 (모국어: KCL, CCL, ECL, ACL, PCL)
  secondLanguage: LeagueLanguage | null; // 부 사용 언어 (제2외국어 혹은 null)
  availableYear: number;                 // 게임 등장 연차 (1: 1년차 현역/FA, 2~10: N년차 신규 코치)
  status: EntityStatus;                  // 활동 상태 ("Active": 구단소속, "FA": 자유계약, "Upcoming": 미래등장)
  retirementDesire: number;              // 은퇴의사 (0 ~ 100, 나이와 연차가 높을수록 상승)
  isRetiring: boolean;                   // 은퇴 예정 플래그 (true인 경우 이번 시즌이 마지막)
}

export interface CoachContractAndRole {
  teamId: string | null;                 // 소속 구단 ID (예: "KCL-001", 무소속 FA는 null)
  role: CoachRole | null;                // 5대 보직 (인게임 코치, 분석 코치, 훈련 코치, 관리 코치, 영입 코치, 미배정 시 null)
  salary: number;                        // 연봉 (원화 기준, 초기 0)
  contractYears: number;                 // 잔여 계약 연수 (초기 0)
  marketValue: number;                   // 시장 추정 가치 (초기 0)
}

export interface CoachStats {
  ingame: number;                        // 인게임 (밴픽 가이드, 전술 카드 제안)
  analysis: number;                      // 전력분석 (챔피언 티어 정리, 전력 분석 리포트)
  training: number;                      // 훈련 (스탯 증가, 챔피언 숙련도 증가)
  managing: number;                      // 팀 관리 (체력 조절, 의욕 조절)
  scouting: number;                      // 영입 (선수 발견, 계약 성사)
}

export interface Coach {
  profile: CoachProfile;
  contractAndRole: CoachContractAndRole;
  stats: CoachStats;
  traits?: string[];                     // (추후 확장용 특성 ID 배열)
}
