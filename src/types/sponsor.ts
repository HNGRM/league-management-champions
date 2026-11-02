export type SponsorTier = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type SponsorType = "SAFE" | "BALANCED" | "AGGRESSIVE";

export type BonusConditionType = "WIN_RATE_40" | "PLAYOFFS" | "FINALS";

export interface Sponsor {
  id: string;                         // 고유 식별자 ("SP_01" ~ "SP_21")
  tier: SponsorTier;                  // 스폰서 티어 (1 ~ 7)
  tierLabel: string;                  // 티어 표시명 (예: "Tier 1 (리그 D)")
  nameKo: string;                     // 한글 기업명 (예: "블루스카이 에어")
  nameEn: string;                     // 영문 기업명 (예: "BlueSky Air")
  industry: string;                   // 업종 (예: "대형항공사")
  type: SponsorType;                  // 유형 코드 ("SAFE" | "BALANCED" | "AGGRESSIVE")
  typeKo: string;                     // 유형 한글명 ("안전형" | "밸런스형" | "도전형")
  description: string;                // 30자 이내 공식 기업 소개문
  baseFunding: number;                // 연간 기본 지원금 (원 단위)
  bonusAmount: number;                // 조건 달성 시 성과금 보너스 (원 단위)
  maxFunding: number;                 // 최종 최대 수령 가능 총액 (원 단위)
  bonusConditionType: BonusConditionType; // 성과금 판정 코드
  bonusConditionKo: string;           // 성과금 조건 한글 설명
  logoUrl: string;                    // 웹 서빙 로고 이미지 경로 (예: "/img/sponsors/t1_01_bluesky_air.jpg")
}
