export interface PlayerCondition {
  id: string;                // 예: "COND_001" ~ "COND_010"
  num: number;               // 1 ~ 10
  nameKo: string;            // 한글명 (예: "부상")
  nameEn: string;            // 영문명 (예: "Injury")
  category: string;          // 분류 (예: "악재 / 신체")
  maxSlots: number;          // 최대 슬롯 수 (선수당 최대 2개)
  triggerCondition: string;  // 발동 조건
  duration: string;          // 지속 및 소멸 조건
  effect: string;            // 효과 설명
}

// 선수에게 실제로 부여된 활성 상태 (인스턴스)
export interface ActivePlayerCondition {
  conditionId: string;       // 예: "COND_001"
  remainingWeeks: number;    // 잔여 주차 (최대 12주 = 3개월)
  acquiredWeek?: number;     // 획득 시점 주차
}

// 하위 호환성을 위한 별칭
export type Condition = PlayerCondition;
export type ActiveCondition = ActivePlayerCondition;
