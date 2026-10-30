import { Player, PlayerTalentAndGrowth } from "@/types/player";
import { calculatePlayerSalary } from "./salaryCalculator";
import { calculateMarketValue } from "./contractEconomics";

/**
 * [min, max] 범위의 랜덤 정수를 반환 (양 끝 포함)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * ① Potential (성장기대치: 0 ~ 100)
 * 선수의 나이(profile.age)에 따라 기준값에서 ±15 난수를 적용 (최소 1, 최대 100 클램프)
 * - 17 ~ 19세 (루키): 기준값 80 ± 15 (분포: 65 ~ 95)
 * - 20 ~ 22세 (성장기): 기준값 65 ± 15 (분포: 50 ~ 80)
 * - 23 ~ 25세 (전성기): 기준값 50 ± 15 (분포: 35 ~ 65)
 * - 26세 이상 (베테랑): 기준값 30 ± 15 (분포: 15 ~ 45)
 */
export function generatePlayerPotential(age: number): number {
  let base: number;
  if (age <= 19) {
    base = 80;
  } else if (age <= 22) {
    base = 65;
  } else if (age <= 25) {
    base = 50;
  } else {
    base = 30;
  }

  const offset = getRandomInt(-15, 15);
  return Math.max(1, Math.min(100, base + offset));
}

/**
 * 팀 ID(예: "KCL-001", "CCL-015")로부터 디비전 등급 판별
 * - 리그 A: 001 ~ 010번
 * - 리그 B: 011 ~ 018번
 * - 리그 C: 019 ~ 024번
 * - 리그 D: 025 ~ 030번 및 무소속 FA
 */
export function getTeamDivisionTier(teamId?: string | null): "A" | "B" | "C" | "D" {
  if (!teamId) return "D";
  const match = teamId.match(/\d+$/);
  if (!match) return "D";
  const num = parseInt(match[0], 10);
  if (num >= 1 && num <= 10) return "A";
  if (num >= 11 && num <= 18) return "B";
  if (num >= 19 && num <= 24) return "C";
  return "D";
}

/**
 * ② StarQuality (스타성: 1 ~ 100)
 * 선수의 소속팀(contractAndRole.teamId)의 디비전 체급에 따라 기준값에서 ±25 난수를 적용 (최소 1, 최대 100 클램프)
 * - 리그 A (001~010번 팀): 기준값 70 ± 25 (분포: 45 ~ 95)
 * - 리그 B (011~018번 팀): 기준값 50 ± 25 (분포: 25 ~ 75)
 * - 리그 C (019~024번 팀): 기준값 35 ± 25 (분포: 10 ~ 60)
 * - 리그 D (025~030번 팀 및 무소속 FA): 기준값 25 ± 25 (분포: 1 ~ 50)
 */
export function generatePlayerStarQuality(teamId?: string | null): number {
  const tier = getTeamDivisionTier(teamId);
  let base: number;
  switch (tier) {
    case "A":
      base = 70;
      break;
    case "B":
      base = 50;
      break;
    case "C":
      base = 35;
      break;
    case "D":
    default:
      base = 25;
      break;
  }

  const offset = getRandomInt(-25, 25);
  return Math.max(1, Math.min(100, base + offset));
}

/**
 * ③ PotentialDecay (연간 잠재력 감퇴치: 4 ~ 11, 히든 스탯)
 * - 70% 확률 (표준 에이징): 7 또는 8 중 랜덤 정수
 * - 15% 확률 (롱런/철인): 4 또는 5 중 랜덤 정수
 * - 15% 확률 (조기 쇠퇴): 10 또는 11 중 랜덤 정수
 */
export function generatePlayerPotentialDecay(): number {
  const rand = Math.random();
  if (rand < 0.7) {
    // 70% 확률: 7 또는 8
    return Math.random() < 0.5 ? 7 : 8;
  } else if (rand < 0.85) {
    // 15% 확률: 4 또는 5
    return Math.random() < 0.5 ? 4 : 5;
  } else {
    // 15% 확률: 10 또는 11
    return Math.random() < 0.5 ? 10 : 11;
  }
}

/**
 * 단일 선수의 3대 성장 스탯 (Potential, PotentialDecay, StarQuality) 생성
 */
export function generatePlayerTalent(player: Player): PlayerTalentAndGrowth {
  return {
    potential: generatePlayerPotential(player.profile.age),
    potentialDecay: generatePlayerPotentialDecay(),
    starQuality: generatePlayerStarQuality(player.contractAndRole?.teamId),
  };
}

/**
 * 선수 객체를 딥카피하고 3대 성장 스탯을 주입하여 반환
 */
export function initializePlayer(player: Player): Player {
  const cloned: Player = JSON.parse(JSON.stringify(player));
  cloned.talentAndGrowth = generatePlayerTalent(cloned);
  if (cloned.contractAndRole) {
    cloned.contractAndRole.salary = calculatePlayerSalary(cloned);
    cloned.contractAndRole.marketValue = calculateMarketValue(
      cloned.contractAndRole.salary,
      cloned.contractAndRole.contractYears,
      cloned.profile.age,
      cloned.profile.isRetiring,
      false
    );
  }
  return cloned;
}

/**
 * 선수 목록 전체에 대해 딥카피 후 3대 성장 스탯을 주입하여 반환
 */
export function initializePlayers(players: Player[]): Player[] {
  return players.map((p) => initializePlayer(p));
}
