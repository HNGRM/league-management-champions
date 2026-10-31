import { Position } from "./player";

export type ChampionRole =
  | "물리딜러"
  | "마법딜러"
  | "탱커"
  | "버퍼"
  | "디버퍼";

export type AttackRangeType = "근거리" | "원거리" | "유동적사거리";
export type AreaType = "소규모" | "대규모" | "유동적범위";
export type CombatStyle = "정석방식" | "견제방식" | "돌진방식" | "유동적방식";
export type PowerCurve = "초반강력" | "중반강력" | "후반강력" | "안전지속" | "중반정체";

export interface ChampionImages {
  illustration: string; // 16:9 와이드 일러스트 경로 (예: "/img/champions/Aspect_16_9/aspect_16_9_001_BowMaster.png")
  portrait: string;     // 1:1 정사각형 초상화 경로 (예: "/img/champions/Aspect_1_1/aspect_1_1_001_BowMaster.jpg")
}

export interface Champion {
  id: string;                         // 챔피언 3자리 고유 ID ("001" ~ "080")
  nameKr: string;                     // 한글명 (예: "보우마스터")
  nameEn: string;                     // 영문 ID (예: "BowMaster")
  primaryRole: ChampionRole;          // 주 역할군
  secondaryRole: ChampionRole | null; // 부 역할군 (없으면 null)
  attackRange: AttackRangeType;       // 사거리
  area: AreaType;                     // 범위
  combatStyle: CombatStyle;           // 전투방식
  powerCurve: PowerCurve;             // 파워커브
  positions: Position[];              // 가능 포지션 코드 (["TOP", "JGL", "MID", "BOT", "SUP"])
  positionNamesKr: string[];          // 가능 포지션 한글명 (["바텀레이너", "탑레이너"])
  images: ChampionImages;             // 일러스트 및 초상화 이미지 경로
}
