import { AvatarDna } from "./avatar";
import { LeagueLanguage } from "./game";

export type CoachRole =
  | "인게임 코치"
  | "전력분석 코치"
  | "훈련 코치"
  | "팀 관리 코치"
  | "스카우터";

export interface CoachProfile {
  coachId: string;            // 코치 고유 식별자 (예: "C_0001" ~)
  nicknameKr: string;         // 한글 닉네임 (예: "페이커")
  nicknameEn: string;         // 영문 닉네임 (예: "Faker")
  avatarConfig: AvatarDna;    // 아바타 렌더러 파라미터 (피부톤, 헤어스타일/컬러, 얼굴형, 눈/표정, 악세서리 등)
  age: number;                // 만 나이 (25~39세)
  careerYears: number;        // 코치 데뷔 N년차
  firstLanguage: LeagueLanguage;         // 주 사용 언어 (KCL, CCL, ECL, ACL, PCL 중 1개)
  secondLanguage: LeagueLanguage | null; // 부 사용 언어 (KCL, CCL, ECL, ACL, PCL 중 1개 혹은 없음)
}

export interface CoachContractAndRole {
  teamId: string | null;      // 소속 구단 ID (예: "KCL-001", 무소속 FA는 null)
  role: CoachRole;            // 역할 (인게임 코치, 전력분석 코치, 훈련 코치, 팀 관리 코치, 스카우터)
  salary: number;             // 연봉 (연간 구단 지출액, 원화 기준)
  contractYears: number;      // 잔여 계약 연수 (마지막 3개월 잔여 시 'FA로이드' 발동)
  marketValue: number;        // 시장 추정 가치 (이적 시장 바이아웃 기준액)
}

export interface CoachStats {
  ingame: number;             // 인게임 (1~100: 밴픽 가이드, 전술 카드 제안)
  analysis: number;           // 전력분석 (1~100: 챔피언 티어 정리, 전력 분석 리포트)
  training: number;           // 훈련 (1~100: 스탯 증가, 챔피언 숙련도 증가)
  managing: number;           // 팀 관리 (1~100: 체력 조절, 의욕 조절)
  scouting: number;           // 스카우트 (1~100: 선수 발견, 계약 성사)
}

export interface CoachTraitsAndMastery {
  traits: string[];           // 고유 특성 ID 배열 (50종 중 1~3개 ID)
}

export interface Coach {
  profile: CoachProfile;
  contractAndRole: CoachContractAndRole;
  stats: CoachStats;
  traitsAndMastery: CoachTraitsAndMastery;
}
