import { Player, Position } from "@/types/player";
import { generatePlayerTalent } from "@/utils/playerGenerator";
import { calculatePlayerSalary } from "@/utils/salaryCalculator";
import playersData from "./players.json";

export const PLAYERS: Player[] = (playersData as unknown as Player[]).map((player) => {
  const p: Player = {
    ...player,
    traitsAndMastery: {
      ...player.traitsAndMastery,
      traits: Array.from(new Set(player.traitsAndMastery.traits)),
    },
  };
  if (!p.talentAndGrowth || p.talentAndGrowth.potential === 0 || !p.talentAndGrowth.potentialDecay) {
    p.talentAndGrowth = generatePlayerTalent(p);
  }
  if (!p.contractAndRole?.salary || p.contractAndRole.salary === 0) {
    p.contractAndRole.salary = calculatePlayerSalary(p);
  }
  return p;
});

const POSITION_ORDER: Record<Position, number> = {
  TOP: 0,
  JGL: 1,
  MID: 2,
  BOT: 3,
  SUP: 4,
};

// 팀 ID별 소속 선수 목록 (주전 우선 -> 포지션 TOP, JGL, MID, BOT, SUP 순 정렬)
export const PLAYERS_BY_TEAM: Record<string, Player[]> = PLAYERS.reduce(
  (acc, player) => {
    const teamId = player.contractAndRole.teamId;
    if (!teamId) return acc;
    if (!acc[teamId]) {
      acc[teamId] = [];
    }
    acc[teamId].push(player);
    return acc;
  },
  {} as Record<string, Player[]>
);

Object.keys(PLAYERS_BY_TEAM).forEach((teamId) => {
  PLAYERS_BY_TEAM[teamId].sort((a, b) => {
    const statusOrderA = a.contractAndRole.rosterStatus === "Starter" ? 0 : 1;
    const statusOrderB = b.contractAndRole.rosterStatus === "Starter" ? 0 : 1;
    if (statusOrderA !== statusOrderB) {
      return statusOrderA - statusOrderB;
    }
    const posA = POSITION_ORDER[a.contractAndRole.mainPos] ?? 99;
    const posB = POSITION_ORDER[b.contractAndRole.mainPos] ?? 99;
    return posA - posB;
  });
});

export function getPlayersByTeamId(teamId: string): Player[] {
  return PLAYERS_BY_TEAM[teamId] || [];
}
