// 메타 1티어 챔피언 ID 목록 (각 포지션별 대표 1티어 챔피언군)
export const META_TIER_1_CHAMPION_IDS = new Set<string>([
  "001", // 보우마스터 (BOT, TOP)
  "002", // 레이저슈터 (MID, BOT)
  "003", // 스나이퍼 (BOT, TOP)
  "004", // 에이전트 (MID, BOT, JGL, TOP)
  "012", // 캐논슈터 (BOT, TOP)
  "016", // 롱스피어 (JGL, TOP)
  "024", // 워드러머 (SUP, TOP)
  "031", // 룬블레이더 (MID, TOP)
  "035", // 엑소시스트 (MID, JGL)
  "042", // 바드 (BOT, SUP)
  "048", // 좀비워리어 (SUP, TOP)
  "055", // 헤드셰프 (SUP, TOP)
  "063", // 헤모맨서 (MID, TOP)
  "070", // 그래비톤 (SUP, JGL, TOP)
  "076", // 랜턴키퍼 (SUP, JGL, TOP)
]);

/**
 * 챔피언이 현재 메타 1티어인지 확인
 */
export function isTier1Champion(championId: string): boolean {
  return META_TIER_1_CHAMPION_IDS.has(championId);
}
