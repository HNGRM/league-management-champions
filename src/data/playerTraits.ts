import { PlayerTrait } from "@/types/playerTrait";
import playerTraitsData from "./playerTraits.json";

export const PLAYER_TRAITS: PlayerTrait[] = playerTraitsData as PlayerTrait[];

export const PLAYER_TRAIT_MAP: Record<string, PlayerTrait> = PLAYER_TRAITS.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<string, PlayerTrait>);

export function getPlayerTraitById(id: string): PlayerTrait | undefined {
  return PLAYER_TRAIT_MAP[id];
}

// 하위 호환성을 위한 별칭
export const TRAITS = PLAYER_TRAITS;
export const TRAIT_MAP = PLAYER_TRAIT_MAP;
export const getTraitById = getPlayerTraitById;
