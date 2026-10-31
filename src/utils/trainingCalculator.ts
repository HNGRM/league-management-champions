import { Player, Position } from "@/types/player";
import { Coach } from "@/types/coach";
import { PlayerTrainingAssignment, TrainingType } from "@/types/training";
import { getChampionsByPosition, champions } from "@/data/champions";
import { isTier1Champion } from "./metaTiers";

/**
 * 1. 현재 스탯 감쇠 계수 (Diminishing Factor)
 * - 50점: 1.00 (기준) -> 주당 30.0 EXP (급성장)
 * - 70점: 0.51 -> 주당 15.4 EXP
 * - 80점: 0.30 -> 주당 9.1 EXP
 * - 85점: 0.21 -> 주당 6.2 EXP
 * - 90점: 0.12 -> 주당 3.7 EXP (장기 집중 투자 필요)
 */
export function calculateDiminishingFactor(currentStat: number): number {
  return Math.max(0.1, Math.pow((100 - currentStat) / 50, 1.3));
}

/**
 * 2. 잠재력(성장 기대치) 계수 (Potential Factor, 비공개)
 * - margin = potential - currentStat
 * - margin > 15: 1.2 (성장 가속 +20%)
 * - 0 < margin <= 15: 0.3 + 0.9 * (margin / 15) (잠재력 근접 시 감속)
 * - margin <= 0: 0.05 (잠재력 한계벽)
 */
export function calculatePotentialFactor(
  potential: number,
  currentStat: number
): number {
  const margin = potential - currentStat;
  if (margin > 15) {
    return 1.2;
  } else if (margin > 0) {
    return 0.3 + 0.9 * (margin / 15);
  } else {
    return 0.05;
  }
}

/**
 * 3. 나이 계수 (Age Factor)
 * - 17~20세 (유망주): 1.2
 * - 21~23세: 1.0
 * - 24~26세: 0.85
 * - 27세 이상: 0.60
 */
export function calculateAgeFactor(age: number): number {
  if (age <= 20) return 1.2;
  if (age <= 23) return 1.0;
  if (age <= 26) return 0.85;
  return 0.6;
}

/**
 * 4. 훈련 코치 버프
 * - 공석 시: multiplier = 1.0, buffPercent = 0
 * - 임명된 경우 역량(training 스탯 1~100)에 따라 1.10 ~ 1.25 곱적용 (+10% ~ +25%)
 */
export function getTrainingCoachBuff(coaches: Coach[] = []): {
  coach: Coach | null;
  buffPercent: number;
  multiplier: number;
} {
  const trainingCoach = coaches.find(
    (c) => c.contractAndRole?.role === "훈련 코치"
  );
  if (!trainingCoach) {
    return { coach: null, buffPercent: 0, multiplier: 1.0 };
  }

  const trainingStat = trainingCoach.stats?.training ?? 60;
  const buffPercent = Math.max(
    10,
    Math.min(25, Math.round(10 + (trainingStat / 100) * 15))
  );
  const multiplier = 1 + buffPercent / 100;
  return { coach: trainingCoach, buffPercent, multiplier };
}

/**
 * 5. 웰니스 센터 시설 레벨 및 회복량 정보
 * - Lv 1: +15% | Lv 2: +20% | Lv 3: +25% | Lv 4: +30% | Lv 5: +35%
 */
export function getWellnessCenterInfo(level: number = 1): {
  level: number;
  recoveryPercent: number;
} {
  const clampedLevel = Math.max(1, Math.min(5, level));
  const recoveryPercent = 10 + clampedLevel * 5;
  return { level: clampedLevel, recoveryPercent };
}

/**
 * 6. 주간 훈련 획득 EXP 단일 계산 함수
 * 주간 획득 EXP = 기본 EXP(30) * 감쇠 계수 * 잠재력 계수 * 나이 계수 * 코치 버프
 */
export function calculateWeeklyTrainingExp(
  currentStat: number,
  potential: number,
  age: number,
  coachMultiplier: number = 1.0
): {
  gainedExp: number;
  diminishingFactor: number;
  potentialFactor: number;
  ageFactor: number;
  coachMultiplier: number;
} {
  const baseExp = 30;
  const diminishingFactor = calculateDiminishingFactor(currentStat);
  const potentialFactor = calculatePotentialFactor(potential, currentStat);
  const ageFactor = calculateAgeFactor(age);

  const rawExp =
    baseExp *
    diminishingFactor *
    potentialFactor *
    ageFactor *
    coachMultiplier;
  const gainedExp = Math.round(rawExp * 10) / 10;

  return {
    gainedExp,
    diminishingFactor,
    potentialFactor,
    ageFactor,
    coachMultiplier,
  };
}

/**
 * 7. 챔피언 숙련도 주간 성장 계산 함수
 * - 지정된 챔피언 연습 시 동일한 감쇠 곡선으로 숙련도 증가
 */
export function calculateChampionMasteryGain(
  currentMastery: number,
  coachMultiplier: number = 1.0
): number {
  const champDiminishing = calculateDiminishingFactor(currentMastery);
  // 기본 주당 4점에 감쇠 곡선 및 코치 배율 곱적용 (최소 1점 보장)
  const gained = Math.max(1, Math.round(4 * champDiminishing * coachMultiplier));
  return gained;
}

/**
 * 8. 단일 선수 스마트 자동 배정 알고리즘
 * - 1단계 (체력 체크): stamina <= 30인 선수는 탈진 방지를 위해 무조건 '휴식(REST)' 배정 (연습 챔피언: null)
 * - 2단계 (약점 보완 훈련): 5대 스탯 중 가장 수치가 낮은 최저 스탯 자동 탐색 (가성비 극대화)
 * - 3단계 (챔피언 자동 배정): 기용 가능 포지션 챔피언 중 메타 1티어이면서 숙련도 80점 미만 우선, 모두 80점 이상 시 시그니처 픽 배정
 */
export function getSmartTrainingAssignment(
  player: Player
): PlayerTrainingAssignment {
  const stamina = player.conditionAndForm?.stamina ?? 100;

  // 1. 체력 30% 이하인 선수는 무조건 휴식
  if (stamina <= 30) {
    return {
      trainingType: "REST",
      targetChampionId: null,
    };
  }

  // 2. 5대 스탯 중 가장 낮은 약점 스탯 판별
  const stats = player.stats;
  const statList: {
    key: "mechanics" | "decision" | "mental" | "execution" | "teamwork";
    type: TrainingType;
    value: number;
    priority: number;
  }[] = [
    { key: "mechanics", type: "MECHANICS", value: stats.mechanics, priority: 1 },
    { key: "decision", type: "DECISION", value: stats.decision, priority: 2 },
    { key: "execution", type: "EXECUTION", value: stats.execution, priority: 3 },
    { key: "mental", type: "MENTAL", value: stats.mental, priority: 4 },
    { key: "teamwork", type: "TEAMWORK", value: stats.teamwork, priority: 5 },
  ];

  statList.sort((a, b) => {
    if (a.value !== b.value) return a.value - b.value;
    return a.priority - b.priority;
  });

  const chosenTrainingType = statList[0].type;

  // 3. 연습할 챔피언 결정
  const pos: Position = player.contractAndRole?.mainPos || "MID";
  const posChampions = getChampionsByPosition(pos);
  const masteryMap = player.traitsAndMastery?.championMastery || {};

  // 해당 포지션 메타 1티어 챔피언군
  const tier1Champions = posChampions.filter((c) => isTier1Champion(c.id));

  // 1티어 중 숙련도 80점 미만인 챔피언
  const tier1Under80 = tier1Champions.filter(
    (c) => (masteryMap[c.id] ?? 0) < 80
  );

  let chosenChampionId: string | null = null;

  if (tier1Under80.length > 0) {
    // 80점 미만 1티어 챔피언 중 숙련도가 가장 낮은 챔피언 우선 배정
    tier1Under80.sort(
      (a, b) => (masteryMap[a.id] ?? 0) - (masteryMap[b.id] ?? 0)
    );
    chosenChampionId = tier1Under80[0].id;
  } else if (tier1Champions.length > 0) {
    // 1티어 챔피언 중 최고 숙련도 챔피언
    tier1Champions.sort(
      (a, b) => (masteryMap[b.id] ?? 0) - (masteryMap[a.id] ?? 0)
    );
    chosenChampionId = tier1Champions[0].id;
  } else if (posChampions.length > 0) {
    // 포지션 챔피언 중 최고 숙련도 챔피언
    posChampions.sort(
      (a, b) => (masteryMap[b.id] ?? 0) - (masteryMap[a.id] ?? 0)
    );
    chosenChampionId = posChampions[0].id;
  } else {
    chosenChampionId = champions[0]?.id || "001";
  }

  return {
    trainingType: chosenTrainingType,
    targetChampionId: chosenChampionId,
  };
}

/**
 * 9. 선수단 전체 스마트 자동 배정
 */
export function smartAutoAssignTraining(players: Player[]): Player[] {
  return players.map((player) => ({
    ...player,
    trainingAssignment: getSmartTrainingAssignment(player),
  }));
}

/**
 * 10. 주간 턴 종료 시 훈련 및 체력 정산 처리 엔진
 * - 훈련 배정 선수:
 *   - 훈련 소모 -10%
 *   - 주전 선수 경기 출전 소모 추가 -10% (주간 총 -20% 소모)
 *   - 후보 선수: 경기 출전 소모 0%, 미출전 자연 회복 없음, 훈련 소모 -10%만 반영
 *   - 한계 효용 체감 공식 기반 스탯 경험치 획득 (100 도달 시 스탯 +1, 최대 99 제한)
 *   - 챔피언 숙련도 감쇠 곡선 기반 상승 (최대 100 제한)
 * - 휴식 배정 선수:
 *   - 훈련 체력 소모 0%
 *   - 웰니스 센터 레벨에 따라 체력 회복 (+15% ~ +35%)
 *   - 주전 선수인 경우 경기 출전 소모 -10% 차감
 * - 체력 범위: 0 ~ 100% 클램프
 */
export function processWeeklyTraining(
  players: Player[],
  coaches: Coach[] = [],
  wellnessLevel: number = 1,
  trainingCenterLevel: number = 1
): Player[] {
  const { multiplier: coachMultiplier } = getTrainingCoachBuff(coaches);
  const { recoveryPercent } = getWellnessCenterInfo(wellnessLevel);

  // 트레이닝 센터 시설 버프 (+0% ~ +25%)
  const trainingBonusPercent =
    [0, 0, 5, 10, 15, 25][Math.max(1, Math.min(5, trainingCenterLevel))] ?? 0;
  const facilityTrainingMultiplier = 1 + trainingBonusPercent / 100;
  const combinedTrainingMultiplier = coachMultiplier * facilityTrainingMultiplier;

  return players.map((player) => {
    const cloned: Player = JSON.parse(JSON.stringify(player));
    if (!cloned.conditionAndForm) {
      cloned.conditionAndForm = {
        form: "보통",
        stamina: 100,
        morale: 100,
        recentRatings: [],
      };
    }
    if (!cloned.statsExp) {
      cloned.statsExp = {
        mechanics: 0,
        decision: 0,
        mental: 0,
        execution: 0,
        teamwork: 0,
      };
    }
    if (!cloned.traitsAndMastery) {
      cloned.traitsAndMastery = {
        traits: [],
        conditions: [],
        championMastery: {},
      };
    }

    const assignment =
      cloned.trainingAssignment || getSmartTrainingAssignment(cloned);
    const isStarter = cloned.contractAndRole?.rosterStatus === "Starter";

    let stamina = cloned.conditionAndForm.stamina ?? 100;

    if (assignment.trainingType === "REST") {
      // 1. 휴식: 훈련 소모 0%, 웰니스 센터 회복 적용
      stamina += recoveryPercent;
      // 주전인 경우 경기 출전 소모 -10% 적용
      if (isStarter) {
        stamina -= 10;
      }
    } else {
      // 2. 훈련 진행: 훈련 소모 -10%
      stamina -= 10;
      // 주전인 경우 경기 출전 소모 추가 -10% (주간 총 -20% 소모)
      // 후보 선수는 경기 소모 0%, 자연 회복 없음
      if (isStarter) {
        stamina -= 10;
      }

      // 3. 한계 효용 체감 훈련 스탯 경험치 계산
      const expKeyMap: Record<
        TrainingType,
        keyof typeof cloned.statsExp | null
      > = {
        REST: null,
        MECHANICS: "mechanics",
        DECISION: "decision",
        MENTAL: "mental",
        EXECUTION: "execution",
        TEAMWORK: "teamwork",
      };

      const statExpKey = expKeyMap[assignment.trainingType];
      if (statExpKey && cloned.statsExp) {
        const currentStat = cloned.stats[statExpKey] ?? 50;
        const potential =
          cloned.talentAndGrowth?.potential ??
          (cloned as any).talent?.potential ??
          70;
        const age = cloned.profile?.age ?? 21;

        const { gainedExp } = calculateWeeklyTrainingExp(
          currentStat,
          potential,
          age,
          combinedTrainingMultiplier
        );

        let currentExp = (cloned.statsExp[statExpKey] || 0) + gainedExp;
        if (currentExp >= 100) {
          // 스탯 1 상승 및 경험치 차감 (최대 99 제한)
          if (cloned.stats[statExpKey] < 99) {
            cloned.stats[statExpKey] += 1;
          }
          currentExp -= 100;
        }
        cloned.statsExp[statExpKey] = Math.round(currentExp * 10) / 10;
      }

      // 4. 챔피언 숙련도 증가 (감쇠 곡선 적용)
      if (
        assignment.targetChampionId &&
        cloned.traitsAndMastery?.championMastery
      ) {
        const currentMastery =
          cloned.traitsAndMastery.championMastery[
            assignment.targetChampionId
          ] ?? 0;
        const masteryGain = calculateChampionMasteryGain(
          currentMastery,
          combinedTrainingMultiplier
        );
        cloned.traitsAndMastery.championMastery[assignment.targetChampionId] =
          Math.min(100, currentMastery + masteryGain);
      }
    }

    // 5. 체력 0 ~ 100% 클램프 및 배정 상태 동기화
    cloned.conditionAndForm.stamina = Math.max(0, Math.min(100, stamina));
    cloned.trainingAssignment = assignment;

    return cloned;
  });
}
