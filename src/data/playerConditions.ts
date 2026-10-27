import { PlayerCondition } from "@/types/playerCondition";
import playerConditionsData from "./playerConditions.json";

export const PLAYER_CONDITIONS: PlayerCondition[] = playerConditionsData as PlayerCondition[];

export const PLAYER_CONDITION_MAP: Record<string, PlayerCondition> = PLAYER_CONDITIONS.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {} as Record<string, PlayerCondition>);

export function getPlayerConditionById(id: string): PlayerCondition | undefined {
  return PLAYER_CONDITION_MAP[id];
}

// 하위 호환성을 위한 별칭
export const CONDITIONS = PLAYER_CONDITIONS;
export const CONDITION_MAP = PLAYER_CONDITION_MAP;
export const getConditionById = getPlayerConditionById;
