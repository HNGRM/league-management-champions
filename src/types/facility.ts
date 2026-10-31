export type FacilityId = "arena" | "training" | "wellness" | "media";

export type FacilityCategory =
  | "재정/수익"
  | "선수 육성"
  | "체력/컨디션"
  | "스타성/팬덤";

export interface FacilityLevelSpec {
  level: number;
  name: string;
  currentEffectText: string;
  nextEffectPreviewText?: string;
  upgradeCost: number;       // 일회성 공사비 (원 단위, Lv 1은 0원)
  maintenanceCost: number;   // 시즌당 유지비 (원 단위)
  statMultiplier?: number;   // 고유 수치 (수입 배율, 경험치 보너스 등)
}

export interface FacilityDefinition {
  id: FacilityId;
  nameKr: string;
  nameEn: string;
  category: FacilityCategory;
  categoryBadgeClass: string;
  keyEffect: string;
  imageUrl: string;
  levels: Record<number, FacilityLevelSpec>;
}

export interface FacilityLevels {
  arena: number;    // 1 ~ 5
  training: number; // 1 ~ 5
  wellness: number; // 1 ~ 5
  media: number;    // 1 ~ 5
}

export const DEFAULT_FACILITY_LEVELS: FacilityLevels = {
  arena: 1,
  training: 1,
  wellness: 1,
  media: 1,
};

export const FACILITIES: FacilityDefinition[] = [
  {
    id: "arena",
    nameKr: "홈 경기장",
    nameEn: "Home Arena",
    category: "재정/수익",
    categoryBadgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
    keyEffect: "홈경기 티켓 & 굿즈 판매 수입 배율 증가",
    imageUrl: "/img/facilities/home_arena.jpg",
    levels: {
      1: {
        level: 1,
        name: "소형 아레나",
        currentEffectText: "수입 배율 1.0x (기본 수익)",
        nextEffectPreviewText: "수입 배율 1.2x (티켓 & 굿즈 판매 +20%)",
        upgradeCost: 0,
        maintenanceCost: 5_000_000,
        statMultiplier: 1.0,
      },
      2: {
        level: 2,
        name: "중형 e스포츠홀",
        currentEffectText: "수입 배율 1.2x (티켓 & 굿즈 판매 +20%)",
        nextEffectPreviewText: "수입 배율 1.45x (티켓 & 굿즈 판매 +45%)",
        upgradeCost: 50_000_000,
        maintenanceCost: 10_000_000,
        statMultiplier: 1.2,
      },
      3: {
        level: 3,
        name: "대형 전용 경기장",
        currentEffectText: "수입 배율 1.45x (티켓 & 굿즈 판매 +45%)",
        nextEffectPreviewText: "수입 배율 1.75x (티켓 & 굿즈 판매 +75%)",
        upgradeCost: 120_000_000,
        maintenanceCost: 18_000_000,
        statMultiplier: 1.45,
      },
      4: {
        level: 4,
        name: "돔 아레나",
        currentEffectText: "수입 배율 1.75x (티켓 & 굿즈 판매 +75%)",
        nextEffectPreviewText: "수입 배율 2.1x (티켓 & 굿즈 판매 +110%)",
        upgradeCost: 250_000_000,
        maintenanceCost: 30_000_000,
        statMultiplier: 1.75,
      },
      5: {
        level: 5,
        name: "메가 e스포츠 스타디움",
        currentEffectText: "수입 배율 2.1x (티켓 & 굿즈 판매 +110% / 최대)",
        upgradeCost: 500_000_000,
        maintenanceCost: 50_000_000,
        statMultiplier: 2.1,
      },
    },
  },
  {
    id: "training",
    nameKr: "트레이닝 센터",
    nameEn: "Training Center",
    category: "선수 육성",
    categoryBadgeClass: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40",
    keyEffect: "주간 훈련 경험치 보너스 버프 (스탯 & 숙련도)",
    imageUrl: "/img/facilities/training_center.jpg",
    levels: {
      1: {
        level: 1,
        name: "기본 연습실",
        currentEffectText: "훈련 EXP 보너스 +0% (기본)",
        nextEffectPreviewText: "훈련 EXP 보너스 +5% (성장 가속)",
        upgradeCost: 0,
        maintenanceCost: 5_000_000,
        statMultiplier: 0,
      },
      2: {
        level: 2,
        name: "프로 게이밍 룸",
        currentEffectText: "훈련 EXP 보너스 +5%",
        nextEffectPreviewText: "훈련 EXP 보너스 +10% (성장 가속)",
        upgradeCost: 40_000_000,
        maintenanceCost: 8_000_000,
        statMultiplier: 5,
      },
      3: {
        level: 3,
        name: "하이엔드 트레이닝 센터",
        currentEffectText: "훈련 EXP 보너스 +10%",
        nextEffectPreviewText: "훈련 EXP 보너스 +15% (고효율 육성)",
        upgradeCost: 100_000_000,
        maintenanceCost: 15_000_000,
        statMultiplier: 10,
      },
      4: {
        level: 4,
        name: "데이터 사이언스 센터",
        currentEffectText: "훈련 EXP 보너스 +15%",
        nextEffectPreviewText: "훈련 EXP 보너스 +25% (초고속 육성)",
        upgradeCost: 200_000_000,
        maintenanceCost: 25_000_000,
        statMultiplier: 15,
      },
      5: {
        level: 5,
        name: "최첨단 퍼포먼스 콤플렉스",
        currentEffectText: "훈련 EXP 보너스 +25% (최고 효율)",
        upgradeCost: 400_000_000,
        maintenanceCost: 40_000_000,
        statMultiplier: 25,
      },
    },
  },
  {
    id: "wellness",
    nameKr: "웰니스 센터",
    nameEn: "Wellness Center",
    category: "체력/컨디션",
    categoryBadgeClass: "bg-blue-950/80 text-blue-300 border-blue-500/40",
    keyEffect: "주간 휴식 시 체력 회복량 증가 및 의욕 케어",
    imageUrl: "/img/facilities/wellness_center.jpg",
    levels: {
      1: {
        level: 1,
        name: "기본 의무실",
        currentEffectText: "휴식 시 체력 +15% 회복, 의욕 회복 보통",
        nextEffectPreviewText: "휴식 시 체력 +20% 회복, 의욕 회복 +10%",
        upgradeCost: 0,
        maintenanceCost: 5_000_000,
        statMultiplier: 15,
      },
      2: {
        level: 2,
        name: "피지컬 테라피 룸",
        currentEffectText: "휴식 시 체력 +20% 회복, 의욕 회복 +10%",
        nextEffectPreviewText: "휴식 시 체력 +25% 회복, 의욕 회복 +20%",
        upgradeCost: 30_000_000,
        maintenanceCost: 7_000_000,
        statMultiplier: 20,
      },
      3: {
        level: 3,
        name: "전문 리커버리 센터",
        currentEffectText: "휴식 시 체력 +25% 회복, 의욕 회복 +20%",
        nextEffectPreviewText: "휴식 시 체력 +30% 회복, 의욕 회복 +35%",
        upgradeCost: 80_000_000,
        maintenanceCost: 12_000_000,
        statMultiplier: 25,
      },
      4: {
        level: 4,
        name: "첨단 멘탈·웰니스 센터",
        currentEffectText: "휴식 시 체력 +30% 회복, 의욕 회복 +35%",
        nextEffectPreviewText: "휴식 시 체력 +35% 회복, 의욕 회복 +50%",
        upgradeCost: 180_000_000,
        maintenanceCost: 20_000_000,
        statMultiplier: 30,
      },
      5: {
        level: 5,
        name: "최고급 VIP 바이오 스파",
        currentEffectText: "휴식 시 체력 +35% 회복, 의욕 회복 +50% (최고)",
        upgradeCost: 350_000_000,
        maintenanceCost: 35_000_000,
        statMultiplier: 35,
      },
    },
  },
  {
    id: "media",
    nameKr: "미디어 스튜디오",
    nameEn: "Media Studio",
    category: "스타성/팬덤",
    categoryBadgeClass: "bg-purple-950/80 text-purple-300 border-purple-500/40",
    keyEffect: "주간 선수 스타성 성장 경험치 및 팬덤 유입 증가",
    imageUrl: "/img/facilities/media_studio.jpg",
    levels: {
      1: {
        level: 1,
        name: "1인 스트리밍 룸",
        currentEffectText: "스타성 성장 기본, 팬덤 주간 증가 기본",
        nextEffectPreviewText: "스타성 EXP +10%, 팬덤 주간 증가 +3%",
        upgradeCost: 0,
        maintenanceCost: 5_000_000,
        statMultiplier: 0,
      },
      2: {
        level: 2,
        name: "전문 촬영 스튜디오",
        currentEffectText: "스타성 EXP +10%, 팬덤 주간 증가 +3%",
        nextEffectPreviewText: "스타성 EXP +25%, 팬덤 주간 증가 +7%",
        upgradeCost: 35_000_000,
        maintenanceCost: 8_000_000,
        statMultiplier: 10,
      },
      3: {
        level: 3,
        name: "팀 미디어 센터",
        currentEffectText: "스타성 EXP +25%, 팬덤 주간 증가 +7%",
        nextEffectPreviewText: "스타성 EXP +45%, 팬덤 주간 증가 +12%",
        upgradeCost: 90_000_000,
        maintenanceCost: 14_000_000,
        statMultiplier: 25,
      },
      4: {
        level: 4,
        name: "글로벌 방송 프로덕션",
        currentEffectText: "스타성 EXP +45%, 팬덤 주간 증가 +12%",
        nextEffectPreviewText: "스타성 EXP +70%, 팬덤 주간 증가 +20%",
        upgradeCost: 200_000_000,
        maintenanceCost: 22_000_000,
        statMultiplier: 45,
      },
      5: {
        level: 5,
        name: "콘텐츠 크리에이티브 콤플렉스",
        currentEffectText: "스타성 EXP +70%, 팬덤 주간 증가 +20% (최고)",
        upgradeCost: 380_000_000,
        maintenanceCost: 38_000_000,
        statMultiplier: 70,
      },
    },
  },
];

export function getFacilityById(id: FacilityId): FacilityDefinition {
  const found = FACILITIES.find((f) => f.id === id);
  return found || FACILITIES[0];
}

export function getFacilityLevelSpec(
  id: FacilityId,
  level: number
): FacilityLevelSpec {
  const facility = getFacilityById(id);
  const clamped = Math.max(1, Math.min(5, level));
  return facility.levels[clamped] || facility.levels[1];
}

/**
 * 4개 시설의 총 시즌 유지비 합산 (원 단위)
 */
export function getTotalFacilityMaintenance(levels: FacilityLevels): number {
  return FACILITIES.reduce((total, f) => {
    const lvl = levels[f.id] ?? 1;
    const spec = getFacilityLevelSpec(f.id, lvl);
    return total + (spec.maintenanceCost || 0);
  }, 0);
}

/**
 * 4개 시설의 총 누적 투자액 합산 (원 단위)
 */
export function getTotalFacilityInvestment(levels: FacilityLevels): number {
  return FACILITIES.reduce((total, f) => {
    const currentLvl = levels[f.id] ?? 1;
    let sum = 0;
    for (let l = 2; l <= currentLvl; l++) {
      const spec = f.levels[l];
      if (spec) sum += spec.upgradeCost;
    }
    return total + sum;
  }, 0);
}
