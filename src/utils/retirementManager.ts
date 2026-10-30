import { Player } from "@/types/player";
import { Coach } from "@/types/coach";

/**
 * ID 문자열을 결정론적 정수 시드로 변환
 */
function hashStringSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 선수 은퇴의사 (0 ~ 100) 계산 공식
 * - 17 ~ 19세 (루키, 1~2년차): 0 ~ 10 (현역 의지 최고조)
 * - 20 ~ 22세 (성장기, 2~4년차): 15 ~ 35
 * - 23 ~ 24세 (전성기, 4~6년차): 40 ~ 65
 * - 25 ~ 26세 (베테랑, 6~8년차): 70 ~ 85
 * - 27세 이상 (노장, 8년차 이상): 85 ~ 100 (커리어 황혼기)
 */
export function calculatePlayerRetirementDesire(
  age: number,
  careerYears: number,
  seed: number = 0
): number {
  let min: number;
  let max: number;

  if (age <= 19) {
    min = 0;
    max = 10;
  } else if (age <= 22) {
    min = 15;
    max = 35;
  } else if (age <= 24) {
    min = 40;
    max = 65;
  } else if (age <= 26) {
    min = 70;
    max = 85;
  } else {
    // 27세 이상: 85 ~ 100
    if (age === 27) {
      min = 85;
      max = 91;
    } else if (age === 28) {
      min = 90;
      max = 96;
    } else {
      min = 95;
      max = 100;
    }
  }

  const span = max - min;
  const careerFactor = Math.min(1, Math.max(0, (careerYears - 1) / 8));
  const seedFactor = ((seed * 9301 + 49297) % 233280) / 233280;

  const value = min + span * (careerFactor * 0.6 + seedFactor * 0.4);
  return Math.round(Math.min(max, Math.max(min, value)));
}

/**
 * 코치 은퇴의사 (0 ~ 100) 계산 공식
 * - 25 ~ 29세: 5 ~ 25
 * - 30 ~ 34세: 25 ~ 50
 * - 35 ~ 37세: 55 ~ 75
 * - 38 ~ 39세: 75 ~ 89
 * - 40세 이상: 90 ~ 100
 */
export function calculateCoachRetirementDesire(
  age: number,
  careerYears: number,
  seed: number = 0
): number {
  let min: number;
  let max: number;

  if (age <= 29) {
    min = 5;
    max = 25;
  } else if (age <= 34) {
    min = 25;
    max = 50;
  } else if (age <= 37) {
    min = 55;
    max = 75;
  } else if (age <= 39) {
    min = 75;
    max = 89;
  } else if (age === 40) {
    min = 90;
    max = 94;
  } else if (age === 41) {
    min = 94;
    max = 97;
  } else {
    min = 97;
    max = 100;
  }

  const span = max - min;
  const careerFactor = Math.min(1, Math.max(0, (careerYears - 1) / 10));
  const seedFactor = ((seed * 9301 + 49297) % 233280) / 233280;

  const value = min + span * (careerFactor * 0.6 + seedFactor * 0.4);
  return Math.round(Math.min(max, Math.max(min, value)));
}

export interface StoveLeagueRetirementResult {
  retiredPlayers: Player[];
  retiredCoaches: Coach[];
  updatedPlayers: Player[];
  updatedCoaches: Coach[];
  newRetiringPlayerCount: number;
  newRetiringCoachCount: number;
}

/**
 * 매년 12월 스토브리그 시작 시 은퇴 처리 및 다음 시즌 은퇴 예정자 150명/40명 선발 모듈
 */
export function processStoveLeagueRetirement(
  players: Player[],
  coaches: Coach[]
): StoveLeagueRetirementResult {
  // 1. 이번 시즌 은퇴 예정자(isRetiring === true) 최종 은퇴 처리
  const retiredPlayers: Player[] = [];
  const activePlayers: Player[] = [];

  players.forEach((p) => {
    if (p.profile.isRetiring) {
      retiredPlayers.push(p);
    } else {
      activePlayers.push(p);
    }
  });

  const retiredCoaches: Coach[] = [];
  const activeCoaches: Coach[] = [];

  coaches.forEach((c) => {
    if (c.profile.isRetiring) {
      retiredCoaches.push(c);
    } else {
      activeCoaches.push(c);
    }
  });

  // 2. 남은 인원 나이/연차 증가 및 은퇴의사 갱신
  activePlayers.forEach((p) => {
    p.profile.age += 1;
    p.profile.careerYears += 1;
    p.profile.retirementDesire = calculatePlayerRetirementDesire(
      p.profile.age,
      p.profile.careerYears,
      hashStringSeed(p.profile.playerId)
    );
    p.profile.isRetiring = false;
  });

  activeCoaches.forEach((c) => {
    c.profile.age += 1;
    c.profile.careerYears += 1;
    c.profile.retirementDesire = calculateCoachRetirementDesire(
      c.profile.age,
      c.profile.careerYears,
      hashStringSeed(c.profile.coachId)
    );
    c.profile.isRetiring = false;
  });

  // 3. 다음 시즌 은퇴 예정자 선발 (선수 상위 150명, 코치 상위 40명)
  // 우선 활동 중인(Active/FA) 선수 중 은퇴의사 내림차순 정렬
  const sortedPlayers = [...activePlayers].sort(
    (a, b) => b.profile.retirementDesire - a.profile.retirementDesire
  );
  const nextRetiringPlayerIds = new Set(
    sortedPlayers.slice(0, 150).map((p) => p.profile.playerId)
  );
  activePlayers.forEach((p) => {
    if (nextRetiringPlayerIds.has(p.profile.playerId)) {
      p.profile.isRetiring = true;
    }
  });

  const sortedCoaches = [...activeCoaches].sort(
    (a, b) => b.profile.retirementDesire - a.profile.retirementDesire
  );
  const nextRetiringCoachIds = new Set(
    sortedCoaches.slice(0, 40).map((c) => c.profile.coachId)
  );
  activeCoaches.forEach((c) => {
    if (nextRetiringCoachIds.has(c.profile.coachId)) {
      c.profile.isRetiring = true;
    }
  });

  return {
    retiredPlayers,
    retiredCoaches,
    updatedPlayers: activePlayers,
    updatedCoaches: activeCoaches,
    newRetiringPlayerCount: nextRetiringPlayerIds.size,
    newRetiringCoachCount: nextRetiringCoachIds.size,
  };
}
