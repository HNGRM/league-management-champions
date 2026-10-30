import { Player, PlayerStats } from "@/types/player";

/**
 * 5대 경기력 스탯(메카닉, 판단력, 정신력, 결정력, 팀워크)의 종합 실력(OVR) 계산
 */
export function calculatePlayerOvr(stats: PlayerStats): number {
  const sum =
    stats.mechanics +
    stats.decision +
    stats.mental +
    stats.execution +
    stats.teamwork;
  return Math.round(sum / 5);
}

// OVR 구간별 기준 연봉 (원 단위) 꺾은선 브레이크포인트
const SALARY_BREAKPOINTS: { ovr: number; salary: number }[] = [
  { ovr: 40, salary: 24_000_000 },     // 0.24억원 (최저 보장선)
  { ovr: 50, salary: 26_000_000 },     // 0.26억원
  { ovr: 55, salary: 30_000_000 },     // 0.30억원 (리그 D 시작선)
  { ovr: 60, salary: 40_000_000 },     // 0.40억원 (리그 C 시작선)
  { ovr: 65, salary: 70_000_000 },     // 0.70억원 (리그 B 시작선)
  { ovr: 70, salary: 150_000_000 },    // 1.50억원 (리그 A 주전선)
  { ovr: 75, salary: 400_000_000 },    // 4.00억원 (리그 A 올스타)
  { ovr: 80, salary: 1_000_000_000 },  // 10.00억원 (슈퍼스타)
  { ovr: 85, salary: 1_800_000_000 },  // 18.00억원
  { ovr: 90, salary: 2_500_000_000 },  // 25.00억원
  { ovr: 95, salary: 3_500_000_000 },  // 35.00억원
  { ovr: 100, salary: 5_000_000_000 }, // 50.00억원
];

/**
 * 선수의 종합 실력(OVR)에 따른 BaseSalary 선형 보간 산출
 */
export function getBaseSalaryByOvr(ovr: number): number {
  if (ovr <= SALARY_BREAKPOINTS[0].ovr) {
    return SALARY_BREAKPOINTS[0].salary;
  }
  const lastIndex = SALARY_BREAKPOINTS.length - 1;
  if (ovr >= SALARY_BREAKPOINTS[lastIndex].ovr) {
    return SALARY_BREAKPOINTS[lastIndex].salary;
  }

  // 인접 브레이크포인트 탐색 후 선형 보간
  for (let i = 0; i < lastIndex; i++) {
    const p1 = SALARY_BREAKPOINTS[i];
    const p2 = SALARY_BREAKPOINTS[i + 1];

    if (ovr >= p1.ovr && ovr <= p2.ovr) {
      const ratio = (ovr - p1.ovr) / (p2.ovr - p1.ovr);
      return Math.round(p1.salary + ratio * (p2.salary - p1.salary));
    }
  }

  return 24_000_000;
}

/**
 * 선수의 종합 실력(OVR)과 스타성(StarQuality)을 반영한 최종 연봉 계산
 * 공식: BaseSalary(OVR) × (1 + StarQuality / 200)
 * 최하 단위: 100만 원 (0.01억 원) 단위 반올림 절삭
 */
export function calculatePlayerSalary(player: Player): number {
  const ovr = calculatePlayerOvr(player.stats);
  const baseSalary = getBaseSalaryByOvr(ovr);

  const starQuality = Math.max(1, Math.min(100, player.talentAndGrowth?.starQuality || 1));
  const starMultiplier = 1 + starQuality / 200;

  const rawSalary = baseSalary * starMultiplier;

  // 100만 원 (0.01억 원) 단위 반올림
  const roundedSalary = Math.round(rawSalary / 1_000_000) * 1_000_000;

  // 최소 2,400만 원 (0.24억원) 보장
  return Math.max(24_000_000, roundedSalary);
}
