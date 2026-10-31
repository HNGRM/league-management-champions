import { Champion } from "@/types/champion";
import { Position } from "@/types/player";
import championsData from "./champions.json";

export const champions: Champion[] = championsData as Champion[];

/**
 * 3자리 챔피언 ID("001" ~ "080")로 챔피언 검색
 */
export function getChampionById(id: string): Champion | undefined {
  return champions.find((c) => c.id === id);
}

/**
 * 영문 ID("BowMaster")로 챔피언 검색
 */
export function getChampionByNameEn(nameEn: string): Champion | undefined {
  return champions.find(
    (c) => c.nameEn.toLowerCase() === nameEn.toLowerCase()
  );
}

/**
 * 한글명("보우마스터")으로 챔피언 검색
 */
export function getChampionByNameKr(nameKr: string): Champion | undefined {
  return champions.find((c) => c.nameKr === nameKr);
}

/**
 * 특정 포지션(TOP, JGL, MID, BOT, SUP)에서 기용 가능한 챔피언 목록 필터링
 */
export function getChampionsByPosition(position: Position): Champion[] {
  return champions.filter((c) => c.positions.includes(position));
}
