import { Sponsor, SponsorTier, SponsorType } from "@/types/sponsor";
import sponsorsData from "./sponsors.json";

export const sponsors: Sponsor[] = sponsorsData as Sponsor[];

/**
 * 고유 ID("SP_01" ~ "SP_21")로 스폰서 검색
 */
export function getSponsorById(id: string): Sponsor | undefined {
  return sponsors.find((s) => s.id === id);
}

/**
 * 티어(1 ~ 7)별 스폰서 목록 필터링 (각 티어별 3개 기업 반환)
 */
export function getSponsorsByTier(tier: SponsorTier): Sponsor[] {
  return sponsors.filter((s) => s.tier === tier);
}

/**
 * 특정 티어의 스폰서 제안 3종(안전형, 밸런스형, 도전형) 세트 반환
 */
export function getSponsorOffersByTier(tier: SponsorTier): {
  safe: Sponsor;
  balanced: Sponsor;
  aggressive: Sponsor;
} {
  const tierSponsors = getSponsorsByTier(tier);
  const safe = tierSponsors.find((s) => s.type === "SAFE");
  const balanced = tierSponsors.find((s) => s.type === "BALANCED");
  const aggressive = tierSponsors.find((s) => s.type === "AGGRESSIVE");

  if (!safe || !balanced || !aggressive) {
    throw new Error(`Tier ${tier} sponsors data is incomplete`);
  }

  return { safe, balanced, aggressive };
}

/**
 * 구단의 소속 리그 및 순위에 따른 3지선다 스폰서 오퍼 묶음 반환
 */
export function getSponsorOffersForTeam(
  division: "D" | "C" | "B" | "A",
  rankInLeague: number = 5
): {
  tier: SponsorTier;
  offers: {
    safe: Sponsor;
    balanced: Sponsor;
    aggressive: Sponsor;
  };
} {
  const tier = calculateSponsorTier(division, rankInLeague);
  return {
    tier,
    offers: getSponsorOffersByTier(tier),
  };
}

/**
 * 리그 디비전(D/C/B/A)과 팀 순위/순위권에 따른 스폰서 티어 계산
 * - 리그 D: Tier 1
 * - 리그 C: Tier 2
 * - 리그 B 하위권 (5~8위): Tier 3
 * - 리그 B 상위권 (1~4위): Tier 4
 * - 리그 A 하위권 (7~10위): Tier 5
 * - 리그 A 중위권 (4~6위): Tier 6
 * - 리그 A 상위권 (1~3위): Tier 7
 */
export function calculateSponsorTier(
  division: "D" | "C" | "B" | "A",
  rankInLeague: number = 5
): SponsorTier {
  switch (division) {
    case "D":
      return 1;
    case "C":
      return 2;
    case "B":
      return rankInLeague <= 4 ? 4 : 3;
    case "A":
      if (rankInLeague <= 3) return 7;
      if (rankInLeague <= 6) return 6;
      return 5;
    default:
      return 1;
  }
}

/**
 * 원 단위 금액을 한글 표기 형식("1.3억", "2,500만")으로 포맷팅
 */
export function formatMoneyKr(amount: number): string {
  if (amount >= 100000000) {
    const eok = amount / 100000000;
    // 소수점이 있으면 1자리까지 표시
    return `${Number.isInteger(eok) ? eok : eok.toFixed(1)}억`;
  }
  const man = Math.floor(amount / 10000);
  return `${man.toLocaleString()}만`;
}
