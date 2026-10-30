import { Player } from "@/types/player";
import { Coach } from "@/types/coach";

/**
 * 선수 역할/포지션 맞교환 (Swap) 알고리즘
 *
 * 1. 주전 ↔ 주전:
 *    - 두 주전 선수의 라인 출전 포지션(mainPos)을 서로 맞바꿉니다.
 *    - 둘 다 Starter 상태는 유지됩니다.
 *
 * 2. 주전 ↔ 후보 (또는 후보 ↔ 주전):
 *    - 주전 선수는 후보(Sub)로 내려가고, 후보 선수는 주전(Starter)으로 승격됩니다.
 *    - 후보 선수는 기존 주전 선수가 맡고 있던 출전 라인(mainPos)을 이어받습니다.
 *    - 기존 주전 선수는 후보 선수의 이전 포지션 값을 이어받습니다.
 *
 * 3. 후보 ↔ 후보:
 *    - 두 후보 선수의 포지션 정보를 서로 맞바꿉니다.
 */
export function swapPlayers(
  players: Player[],
  playerIdA: string,
  playerIdB: string
): Player[] {
  if (playerIdA === playerIdB) return players;

  const playerA = players.find((p) => p.profile.playerId === playerIdA);
  const playerB = players.find((p) => p.profile.playerId === playerIdB);
  if (!playerA || !playerB) return players;

  const isStarterA = playerA.contractAndRole.rosterStatus === "Starter";
  const isStarterB = playerB.contractAndRole.rosterStatus === "Starter";

  const newPlayerA: Player = JSON.parse(JSON.stringify(playerA));
  const newPlayerB: Player = JSON.parse(JSON.stringify(playerB));

  if (isStarterA && isStarterB) {
    // 주전 ↔ 주전: 출전 라인(mainPos) 맞교환
    const tempPos = newPlayerA.contractAndRole.mainPos;
    newPlayerA.contractAndRole.mainPos = newPlayerB.contractAndRole.mainPos;
    newPlayerB.contractAndRole.mainPos = tempPos;
  } else if (isStarterA && !isStarterB) {
    // 주전 A ↔ 후보 B: B가 A의 주전 라인을 물려받고 승격, A는 후보로 강등
    const starterPos = newPlayerA.contractAndRole.mainPos;
    const subPos = newPlayerB.contractAndRole.mainPos;

    newPlayerB.contractAndRole.rosterStatus = "Starter";
    newPlayerB.contractAndRole.mainPos = starterPos;

    newPlayerA.contractAndRole.rosterStatus = "Sub";
    newPlayerA.contractAndRole.mainPos = subPos;
  } else if (!isStarterA && isStarterB) {
    // 후보 A ↔ 주전 B: A가 B의 주전 라인을 물려받고 승격, B는 후보로 강등
    const starterPos = newPlayerB.contractAndRole.mainPos;
    const subPos = newPlayerA.contractAndRole.mainPos;

    newPlayerA.contractAndRole.rosterStatus = "Starter";
    newPlayerA.contractAndRole.mainPos = starterPos;

    newPlayerB.contractAndRole.rosterStatus = "Sub";
    newPlayerB.contractAndRole.mainPos = subPos;
  } else {
    // 후보 ↔ 후보: 두 후보의 포지션 맞교환
    const tempMainPos = newPlayerA.contractAndRole.mainPos;
    const tempSubPos = newPlayerA.contractAndRole.subPos;
    newPlayerA.contractAndRole.mainPos = newPlayerB.contractAndRole.mainPos;
    newPlayerA.contractAndRole.subPos = newPlayerB.contractAndRole.subPos;
    newPlayerB.contractAndRole.mainPos = tempMainPos;
    newPlayerB.contractAndRole.subPos = tempSubPos;
  }

  return players.map((p) => {
    if (p.profile.playerId === playerIdA) return newPlayerA;
    if (p.profile.playerId === playerIdB) return newPlayerB;
    return p;
  });
}

/**
 * 코치 보직 맞교환 (Swap) 알고리즘
 *
 * 1. 보직 ↔ 보직: 두 코치의 role을 서로 맞바꿉니다. (ING ↔ ANA 등)
 * 2. 보직 ↔ 미배정: 기존 보직 코치는 role: null(UNA)이 되고, 미배정 코치는 해당 보직으로 임명됩니다.
 * 3. 미배정 ↔ 미배정: 상태 유지
 */
export function swapCoaches(
  coaches: Coach[],
  coachIdA: string,
  coachIdB: string
): Coach[] {
  if (coachIdA === coachIdB) return coaches;

  const coachA = coaches.find((c) => c.profile.coachId === coachIdA);
  const coachB = coaches.find((c) => c.profile.coachId === coachIdB);
  if (!coachA || !coachB) return coaches;

  const roleA = coachA.contractAndRole.role;
  const roleB = coachB.contractAndRole.role;

  return coaches.map((c) => {
    if (c.profile.coachId === coachIdA) {
      return {
        ...c,
        contractAndRole: {
          ...c.contractAndRole,
          role: roleB,
        },
      };
    }
    if (c.profile.coachId === coachIdB) {
      return {
        ...c,
        contractAndRole: {
          ...c.contractAndRole,
          role: roleA,
        },
      };
    }
    return c;
  });
}
