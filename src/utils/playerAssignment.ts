import { Player, Position } from "@/types/player";

export const POSITIONS: Position[] = ["TOP", "JGL", "MID", "BOT", "SUP"];

export const POSITION_ORDER: Record<Position, number> = {
  TOP: 0,
  JGL: 1,
  MID: 2,
  BOT: 3,
  SUP: 4,
};

/**
 * 선수의 5대 핵심 스탯 합계 계산
 */
export function calculatePlayerStatSum(player: Player): number {
  return (
    player.stats.mechanics +
    player.stats.decision +
    player.stats.mental +
    player.stats.execution +
    player.stats.teamwork
  );
}

/**
 * 선수의 OVR (5대 스탯 평균, 반올림) 계산
 */
export function calculatePlayerOvr(player: Player): number {
  return Math.round(calculatePlayerStatSum(player) / 5);
}

/**
 * 선수단 자동 배정 (Auto-Assign) 알고리즘
 * 1. 5개 라인별 최고 OVR 선발:
 *    - 5개 포지션(TOP, JGL, MID, BOT, SUP)에 대해, 해당 포지션이 주 포지션(contractAndRole.mainPos)인 선수들 중
 *      OVR(5대 스탯 평균)이 가장 높은 선수를 주전(Starter)으로 자동 배정합니다.
 * 2. 동률 처리 (Tie-Breaker):
 *    - 만약 OVR이 같다면 profile.nicknameEn 알파벳 오름차순(A -> Z)으로 우선권을 부여합니다.
 * 3. 후보 배정:
 *    - 선발되지 않은 나머지 선수들은 후보(rosterStatus = "Sub")로 배정합니다.
 */
export function autoAssignPlayerRoles(players: Player[]): Player[] {
  if (!players || players.length === 0) return [];

  // 깊은 복사로 원본 객체 오염 방지
  const cloned: Player[] = JSON.parse(JSON.stringify(players));

  // 1. 각 라인별 후보군 수집 및 최고 OVR 1순위 주전 선정
  const selectedStarterIds = new Set<string>();

  for (const pos of POSITIONS) {
    const candidates = cloned.filter(
      (p) => p.contractAndRole?.mainPos === pos
    );

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const sumA = calculatePlayerStatSum(a);
        const sumB = calculatePlayerStatSum(b);
        if (sumB !== sumA) {
          return sumB - sumA;
        }
        return a.profile.nicknameEn.localeCompare(b.profile.nicknameEn);
      });

      selectedStarterIds.add(candidates[0].profile.playerId);
    }
  }

  // 예외 상황 방어: 만약 어떤 포지션에 mainPos 후보가 없는 경우 (극단적 스왑 상태 등)
  // 아직 Starter로 뽑히지 않은 선수 중 OVR이 가장 높은 선수를 해당 라인으로 배정
  for (const pos of POSITIONS) {
    const hasStarterForPos = cloned.some(
      (p) =>
        selectedStarterIds.has(p.profile.playerId) &&
        p.contractAndRole?.mainPos === pos
    );

    if (!hasStarterForPos) {
      const unassigned = cloned.filter(
        (p) => !selectedStarterIds.has(p.profile.playerId)
      );
      if (unassigned.length > 0) {
        unassigned.sort((a, b) => {
          const sumA = calculatePlayerStatSum(a);
          const sumB = calculatePlayerStatSum(b);
          if (sumB !== sumA) return sumB - sumA;
          return a.profile.nicknameEn.localeCompare(b.profile.nicknameEn);
        });
        const chosen = unassigned[0];
        chosen.contractAndRole.mainPos = pos;
        selectedStarterIds.add(chosen.profile.playerId);
      }
    }
  }

  // 2. 주전(Starter) 및 후보(Sub) 상태 반영
  return cloned.map((player) => {
    const isStarter = selectedStarterIds.has(player.profile.playerId);
    return {
      ...player,
      contractAndRole: {
        ...player.contractAndRole,
        rosterStatus: isStarter ? "Starter" : "Sub",
      },
    };
  });
}

/**
 * 고정 렌더링 순서에 따른 선수 목록 정렬:
 * 1. 위에서부터 주전 5명 (TOP -> JGL -> MID -> BOT -> SUP) 고정 순서
 * 2. 그 아래에 후보(Sub) 선수들 (TOP -> JGL -> MID -> BOT -> SUP 순, 동일 포지션 시 OVR 내림차순 -> 닉네임 A->Z)
 */
export function sortPlayersByRoleOrder(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const isStarterA = a.contractAndRole?.rosterStatus === "Starter";
    const isStarterB = b.contractAndRole?.rosterStatus === "Starter";

    // 1. 주전(Starter) 우선 배치
    if (isStarterA !== isStarterB) {
      return isStarterA ? -1 : 1;
    }

    // 2. 포지션 순서 (TOP -> JGL -> MID -> BOT -> SUP)
    const posA = POSITION_ORDER[a.contractAndRole?.mainPos] ?? 99;
    const posB = POSITION_ORDER[b.contractAndRole?.mainPos] ?? 99;
    if (posA !== posB) {
      return posA - posB;
    }

    // 3. 동일 포지션 내에서는 OVR(스탯 총합) 내림차순
    const sumA = calculatePlayerStatSum(a);
    const sumB = calculatePlayerStatSum(b);
    if (sumB !== sumA) {
      return sumB - sumA;
    }

    // 4. 닉네임 알파벳 오름차순 (A -> Z)
    return a.profile.nicknameEn.localeCompare(b.profile.nicknameEn);
  });
}
