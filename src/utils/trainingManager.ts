import { Player, Position } from "@/types/player";
import { Coach } from "@/types/coach";
import { PlayerTrainingAssignment, TrainingType } from "@/types/training";
import { getChampionsByPosition, champions } from "@/data/champions";
import { isTier1Champion } from "./metaTiers";

/**
 * 훈련 코치 버프 정보 계산
 * - 팀에 임명된 '훈련 코치'의 stats.training 수치에 기반하여 경험치 획득 배율(%)을 산출
 * - 공석인 경우 0%
 */
export function getTrainingCoachBuff(coaches: Coach[] = []): {
  coach: Coach | null;
  buffPercent: number;
} {
  const trainingCoach = coaches.find(
    (c) => c.contractAndRole?.role === "훈련 코치"
  );
  if (!trainingCoach) {
    return { coach: null, buffPercent: 0 };
  }

  // 훈련 코치 능력치(1~100)의 약 20~25%를 보너스 버프로 환산 (예: 60 -> +15%, 80 -> +20%)
  const buffPercent = Math.max(5, Math.round(trainingCoach.stats.training * 0.25));
  return { coach: trainingCoach, buffPercent };
}

/**
 * 웰니스 센터 레벨 정보
 * - Lv 1: +15% | Lv 2: +20% | Lv 3: +25% | Lv 4: +30% | Lv 5: +35%
 */
export function getWellnessCenterInfo(level: number = 1): {
  level: number;
  recoveryPercent: number;
} {
  const clampedLevel = Math.max(1, Math.min(5, level));
  const recoveryPercent = 10 + clampedLevel * 5; // Lv1 -> 15, Lv2 -> 20, Lv3 -> 25, Lv4 -> 30, Lv5 -> 35
  return { level: clampedLevel, recoveryPercent };
}

/**
 * 단일 선수 스마트 자동 배정 로직
 * 1. 체력 체크: stamina <= 30인 선수는 부상 방지를 위해 무조건 '휴식(REST)' 배정 (연습 챔피언: null)
 * 2. 훈련 종목 결정: 5대 스탯 중 가장 낮은 약점 스탯 배정
 * 3. 챔피언 결정: 해당 포지션 챔피언 중 메타 1티어이면서 숙련도 80점 미만 우선, 모두 80점 이상 시 최고 숙련도 시그니처 챔피언 배정
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

  // 가장 낮은 스탯 정렬 (값 오름차순, 동률 시 우선순위)
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
 * 선수단 전체 스마트 자동 배정
 */
export function smartAutoAssignTraining(players: Player[]): Player[] {
  return players.map((player) => ({
    ...player,
    trainingAssignment: getSmartTrainingAssignment(player),
  }));
}

/**
 * 주간 턴 종료 시 훈련 및 체력 정산 처리
 * - 훈련 배정 선수: 체력 -10%, 해당 스탯 및 챔피언 숙련도 경험치 증가 (코치 버프 반영)
 * - 휴식 배정 선수: 체력 소모 0%, 웰니스 센터 레벨에 따라 회복 (+15% ~ +35%)
 * - 경기 출전 주전 선수: 경기 시뮬레이션 종료 시 추가 체력 -10% 차감 (총 -20%)
 */
export function processWeeklyTraining(
  players: Player[],
  coaches: Coach[] = [],
  wellnessLevel: number = 1
): Player[] {
  const { buffPercent } = getTrainingCoachBuff(coaches);
  const { recoveryPercent } = getWellnessCenterInfo(wellnessLevel);
  const buffMultiplier = 1 + buffPercent / 100;

  return players.map((player) => {
    const cloned: Player = JSON.parse(JSON.stringify(player));
    if (!cloned.conditionAndForm) {
      cloned.conditionAndForm = { form: "보통", stamina: 100, morale: 100, recentRatings: [] };
    }
    if (!cloned.statsExp) {
      cloned.statsExp = { mechanics: 0, decision: 0, mental: 0, execution: 0, teamwork: 0 };
    }
    const assignment =
      cloned.trainingAssignment || getSmartTrainingAssignment(cloned);
    const isStarter = cloned.contractAndRole?.rosterStatus === "Starter";

    let stamina = cloned.conditionAndForm.stamina ?? 100;

    if (assignment.trainingType === "REST") {
      // 휴식: 훈련 소모 0%, 웰니스 센터 회복 적용
      stamina += recoveryPercent;
      // 단, 만약 주전이어서 경기를 뛰었다면 경기 출전 소모 -10% 적용
      if (isStarter) {
        stamina -= 10;
      }
    } else {
      // 훈련 소모 -10%
      stamina -= 10;
      // 주전인 경우 경기 출전 소모 추가 -10% (주간 총 -20%)
      if (isStarter) {
        stamina -= 10;
      }

      // 훈련 스탯 경험치 증가
      const expGain = Math.round(15 * buffMultiplier);
      const masteryGain = Math.round(2 * buffMultiplier);

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
        let currentExp = (cloned.statsExp[statExpKey] || 0) + expGain;
        if (currentExp >= 100) {
          // 스탯 1 상승 및 경험치 이월
          if (cloned.stats[statExpKey] < 100) {
            cloned.stats[statExpKey] += 1;
          }
          currentExp -= 100;
        }
        cloned.statsExp[statExpKey] = currentExp;
      }

      // 챔피언 숙련도 증가
      if (assignment.targetChampionId && cloned.traitsAndMastery?.championMastery) {
        const currentMastery =
          cloned.traitsAndMastery.championMastery[assignment.targetChampionId] ?? 0;
        cloned.traitsAndMastery.championMastery[assignment.targetChampionId] =
          Math.min(100, currentMastery + masteryGain);
      }
    }

    // 0 ~ 100 클램프
    cloned.conditionAndForm.stamina = Math.max(0, Math.min(100, stamina));
    cloned.trainingAssignment = assignment;

    return cloned;
  });
}
