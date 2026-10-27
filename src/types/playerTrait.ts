export type PlayerTraitType = "긍정형" | "하이브리드형" | "부정형";

export interface PlayerTrait {
  id: string;          // 예: "TRAIT_001" ~ "TRAIT_050"
  num: number;         // 1 ~ 50
  nameKo: string;      // 한글명 (예: "장인")
  nameEn: string;      // 영문명 (예: "One-Trick")
  category: string;    // 카테고리 (예: "[카테고리 1] 밴픽 & 챔피언 폭 (8종)")
  type: PlayerTraitType; // 긍정형 | 하이브리드형 | 부정형
  effect: string;      // 효과 설명
}

// 하위 호환성을 위한 별칭
export type Trait = PlayerTrait;
export type TraitType = PlayerTraitType;
