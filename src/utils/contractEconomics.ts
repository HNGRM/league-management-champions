import { Player, PlayerStats } from "@/types/player";
import { Coach, CoachStats } from "@/types/coach";
import { calculatePlayerOvr, calculatePlayerSalary } from "./salaryCalculator";
import { generatePlayerStarQuality } from "./playerGenerator";
import { autoAssignCoachRoles } from "./coachAssignment";

export interface ContractEconomicsResult {
  salary: number;        // 연봉 (원화 기준, 100만 원 단위 반올림)
  contractYears: number; // 계약 기간 (0 ~ 3년)
  marketValue: number;   // 시장 가치 / 바이아웃 (원화 기준, 100만 원 단위 반올림)
}

/**
 * 5대 코치 핵심 스탯의 종합 실력(OVR) 계산
 */
export function calculateCoachOvr(stats: CoachStats): number {
  const sum =
    stats.ingame +
    stats.analysis +
    stats.training +
    stats.managing +
    stats.scouting;
  return Math.round(sum / 5);
}

// 코치 OVR 구간별 기준 연봉 (원 단위) 꺾은선 브레이크포인트
const COACH_SALARY_BREAKPOINTS: { ovr: number; salary: number }[] = [
  { ovr: 40, salary: 24_000_000 },  // 0.24억원 (최저선)
  { ovr: 50, salary: 30_000_000 },  // 0.30억원
  { ovr: 55, salary: 45_000_000 },  // 0.45억원
  { ovr: 60, salary: 65_000_000 },  // 0.65억원
  { ovr: 65, salary: 95_000_000 },  // 0.95억원
  { ovr: 70, salary: 140_000_000 }, // 1.40억원
  { ovr: 75, salary: 200_000_000 }, // 2.00억원
];

/**
 * 코치 종합 실력(OVR)에 따른 연봉 산출
 */
export function calculateCoachSalary(coach: Coach): number {
  if (!coach.contractAndRole?.teamId) {
    return 0; // 무소속 FA는 연봉 0
  }

  const ovr = calculateCoachOvr(coach.stats);
  const first = COACH_SALARY_BREAKPOINTS[0];
  const last = COACH_SALARY_BREAKPOINTS[COACH_SALARY_BREAKPOINTS.length - 1];

  let rawSalary = 24_000_000;
  if (ovr <= first.ovr) {
    rawSalary = first.salary;
  } else if (ovr >= last.ovr) {
    rawSalary = last.salary;
  } else {
    for (let i = 0; i < COACH_SALARY_BREAKPOINTS.length - 1; i++) {
      const p1 = COACH_SALARY_BREAKPOINTS[i];
      const p2 = COACH_SALARY_BREAKPOINTS[i + 1];
      if (ovr >= p1.ovr && ovr <= p2.ovr) {
        const ratio = (ovr - p1.ovr) / (p2.ovr - p1.ovr);
        rawSalary = Math.round(p1.salary + ratio * (p2.salary - p1.salary));
        break;
      }
    }
  }

  // 100만 원 (0.01억 원) 단위 반올림 및 최저 2,400만 원 보장
  return Math.max(24_000_000, Math.round(rawSalary / 1_000_000) * 1_000_000);
}

/**
 * 선수의 계약 기간 (contractYears: 0 ~ 3년) 산정
 * - 무소속 FA: 0년
 * - 3년 계약 (약 20%): 17~20세 신인/루키 주전 or OVR 74 이상 핵심 에이스
 * - 1년 계약 (약 40%): 25세 이상 베테랑 or 서브 선수
 * - 2년 계약 (약 40%): 21~24세 일반 주전 선수
 */
export function calculatePlayerContractYears(player: Player): number {
  if (!player.contractAndRole?.teamId) {
    return 0; // FA
  }

  const ovr = calculatePlayerOvr(player.stats);
  const age = player.profile.age;
  const isStarter = player.contractAndRole.rosterStatus === "Starter";

  // 1) 3년 계약: 17~20세 신인/루키 주전 or OVR 74 이상 핵심 에이스
  if ((age <= 20 && isStarter) || ovr >= 74) {
    return 3;
  }

  // 2) 1년 계약: 25세 이상 베테랑 or 서브
  if (age >= 25) {
    return 1;
  }
  if (!isStarter) {
    return age <= 21 ? 2 : 1; // 21세 이하 유망주 서브는 2년
  }

  // 3) 2년 계약: 21~24세 일반 주전
  return 2;
}

/**
 * 코치의 계약 기간 (contractYears: 0 ~ 3년) 산정
 * - 무소속 FA: 0년
 * - 3년 계약 (약 20%): 고스탯 핵심 코치 (OVR 70 이상)
 * - 1년 계약 (약 40%): 36세 이상 베테랑 코치 or 저스탯 코치 (OVR < 54)
 * - 2년 계약 (약 40%): 일반 코치
 */
export function calculateCoachContractYears(coach: Coach): number {
  if (!coach.contractAndRole?.teamId) {
    return 0; // FA
  }

  const ovr = calculateCoachOvr(coach.stats);
  const age = coach.profile.age;

  // 1) 3년 계약: 고스탯 핵심 코치
  if (ovr >= 70) {
    return 3;
  }

  // 2) 1년 계약: 36세 이상 베테랑 코치 or 저스탯 코치
  if (age >= 36 || ovr < 54) {
    return 1;
  }

  // 3) 2년 계약: 일반 코치
  return 2;
}

/**
 * 잔여 계약기간 배율
 * - 3년 잔여: × 2.0
 * - 2년 잔여: × 1.4
 * - 1년 잔여: × 0.7
 * - 0년 (FA) 또는 은퇴 예정자 (isRetiring === true): 0
 */
export function calculateContractMultiplier(contractYears: number, isRetiring: boolean): number {
  if (isRetiring || contractYears <= 0) {
    return 0;
  }
  switch (contractYears) {
    case 3:
      return 2.0;
    case 2:
      return 1.4;
    case 1:
      return 0.7;
    default:
      return 0;
  }
}

/**
 * 나이 배율
 * - 선수:
 *   - 17 ~ 20세 (루키): × 1.5
 *   - 21 ~ 24세 (전성기): × 1.1
 *   - 25세 이상 (베테랑): × 0.7
 * - 코치: 1.0 고정
 */
export function calculateAgeMultiplier(age: number, isCoach: boolean = false): number {
  if (isCoach) {
    return 1.0;
  }
  if (age <= 20) {
    return 1.5;
  }
  if (age <= 24) {
    return 1.1;
  }
  return 0.7;
}

/**
 * 시장 가치 (MarketValue: 바이아웃 / 이적료) 계산
 * 공식: Salary(연봉) × 계약기간 배율 × 나이 배율
 * 최하 단위: 100만 원 단위 반올림
 */
export function calculateMarketValue(
  salary: number,
  contractYears: number,
  age: number,
  isRetiring: boolean,
  isCoach: boolean = false
): number {
  if (isRetiring || contractYears === 0 || salary === 0) {
    return 0;
  }

  const contractMult = calculateContractMultiplier(contractYears, isRetiring);
  const ageMult = calculateAgeMultiplier(age, isCoach);
  const rawValue = salary * contractMult * ageMult;

  // 100만 원 (0.01억 원) 단위 반올림
  return Math.round(rawValue / 1_000_000) * 1_000_000;
}

/**
 * 선수 및 코치의 연봉, 계약기간, 시장가치 통합 산정
 */
export function calculateContractAndMarketValue(
  entity: Player | Coach,
  isCoach: boolean = false
): ContractEconomicsResult {
  if (isCoach) {
    const coach = entity as Coach;
    const contractYears = calculateCoachContractYears(coach);
    const salary = calculateCoachSalary(coach);
    const marketValue = calculateMarketValue(
      salary,
      contractYears,
      coach.profile.age,
      coach.profile.isRetiring,
      true
    );
    return { salary, contractYears, marketValue };
  } else {
    const player = entity as Player;
    const contractYears = calculatePlayerContractYears(player);
    let salary = 0;

    if (player.contractAndRole?.teamId) {
      if (!player.talentAndGrowth?.starQuality) {
        const sq = generatePlayerStarQuality(player.contractAndRole.teamId);
        const tempPlayer: Player = {
          ...player,
          talentAndGrowth: {
            ...(player.talentAndGrowth || { potential: 0, potentialDecay: 7 }),
            starQuality: sq,
          },
        };
        salary = calculatePlayerSalary(tempPlayer);
      } else {
        salary = calculatePlayerSalary(player);
      }
    }

    const marketValue = calculateMarketValue(
      salary,
      contractYears,
      player.profile.age,
      player.profile.isRetiring,
      false
    );

    return { salary, contractYears, marketValue };
  }
}

/**
 * 코치 객체를 딥카피하고 게임 시작 시 계약 경제(연봉, 계약기간, 시장가치)를 동적으로 주입
 */
export function initializeCoach(coach: Coach): Coach {
  const cloned: Coach = JSON.parse(JSON.stringify(coach));
  if (cloned.contractAndRole) {
    const economics = calculateContractAndMarketValue(cloned, true);
    cloned.contractAndRole.salary = economics.salary;
    cloned.contractAndRole.contractYears = economics.contractYears;
    cloned.contractAndRole.marketValue = economics.marketValue;
  }
  return cloned;
}

/**
 * 코치 목록 전체에 대해 딥카피 후 계약 경제 주입 및 5대 전담 보직 자동 배정
 */
export function initializeCoaches(coaches: Coach[]): Coach[] {
  const initialized = coaches.map((c) => initializeCoach(c));
  return autoAssignCoachRoles(initialized);
}

export interface TeamValueBreakdown {
  rosterValue: number; // 선수단 총 시장가치
  cashBalance: number; // 보유 현금
  fandomValue: number; // 팬덤 가치 (서포터즈 팬 수 × 10,000원)
  totalValue: number;  // 총 팀 가치
}

/**
 * 팀 가치 세부 항목 및 총합 산정
 * 공식: 선수단 총 시장가치 + 보유 현금 + 팬덤 가치(서포터즈 팬 수 × 10,000원)
 */
export function calculateTeamValueBreakdown(
  team: { balance?: number; fans?: number } | null | undefined,
  players: Player[] = []
): TeamValueBreakdown {
  const rosterValue = (players || []).reduce((sum, p) => {
    const mv =
      p.contractAndRole?.marketValue ||
      calculateContractAndMarketValue(p, false).marketValue ||
      0;
    return sum + mv;
  }, 0);

  const cashBalance = team?.balance ?? 500_000_000;
  const fans = team?.fans ?? 15_000;
  const fandomValue = fans * 10_000;
  const totalValue = rosterValue + cashBalance + fandomValue;

  return {
    rosterValue,
    cashBalance,
    fandomValue,
    totalValue,
  };
}

/**
 * 팀 가치(Team Value) 산정
 * 공식: 선수단 총 시장가치 + 보유 현금 + 팬덤 가치(서포터즈 팬 수 × 10,000원)
 */
export function calculateTeamValue(
  team: { balance?: number; fans?: number } | null | undefined,
  players: Player[] = []
): number {
  return calculateTeamValueBreakdown(team, players).totalValue;
}
