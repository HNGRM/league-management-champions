import { DivisionTier, LeagueDivisions, LeagueLanguage, TeamStanding } from "@/types/game";
import { PREDEFINED_TEAMS } from "./teams";
import { getTeamLogo } from "./teamLogos";

export interface DivisionMeta {
  tier: DivisionTier;
  name: string;
  subName: string;
  teamCount: number;
  idRange: [number, number];
  description: string;
  badgeColor: string;
}

export const DIVISION_METAS: Record<DivisionTier, DivisionMeta> = {
  A: {
    tier: "A",
    name: "리그 A",
    subName: "1부 리그",
    teamCount: 10,
    idRange: [1, 10],
    description: "전통의 메이저 명문 팀들이 격돌하는 최상위 무대",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  B: {
    tier: "B",
    name: "리그 B",
    subName: "2부 리그",
    teamCount: 8,
    idRange: [11, 18],
    description: "1부 승격을 노리는 중견 팀들의 치열한 각축전",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  C: {
    tier: "C",
    name: "리그 C",
    subName: "3부 리그",
    teamCount: 6,
    idRange: [19, 24],
    description: "지역 연고 기반의 패기 넘치는 언더독 팀들의 격돌",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  D: {
    tier: "D",
    name: "리그 D",
    subName: "4부 리그 (신인/아카데미)",
    teamCount: 6,
    idRange: [25, 30],
    description: "기적의 승격을 꿈꾸는 신생 및 아카데미 팀의 출발점",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/50",
  },
};

interface PlayerTeamInitParams {
  id: string;
  nameKo: string;
  nameEn: string;
  shortName: string;
  customLogoUrl?: string | null;
}

/**
 * 선택한 지역 리그(KCL, CCL 등)의 30개 팀을 4개 디비전(A, B, C, D)으로 분할하고,
 * 플레이어의 팀을 무조건 리그 D(4부)에 배치하여 초기 순위표를 생성합니다.
 */
export function createInitialLeagueDivisions(
  leagueCode: LeagueLanguage,
  playerTeam: PlayerTeamInitParams
): LeagueDivisions {
  const allTeams = PREDEFINED_TEAMS.filter((t) => t.league === leagueCode);

  // 번호 추출 (예: "KCL-001" -> 1)
  const getTeamNum = (id: string): number => {
    const parts = id.split("-");
    return parts.length > 1 ? parseInt(parts[1], 10) || 999 : 999;
  };

  const sortedTeams = [...allTeams].sort((a, b) => getTeamNum(a.id) - getTeamNum(b.id));

  const teamsA = sortedTeams.slice(0, 10);  // 001 ~ 010 (10팀)
  const teamsB = sortedTeams.slice(10, 18); // 011 ~ 018 (8팀)
  const teamsC = sortedTeams.slice(18, 24); // 019 ~ 024 (6팀)
  const teamsD = sortedTeams.slice(24, 30); // 025 ~ 030 (6팀)

  const toStanding = (
    team: typeof sortedTeams[0],
    idx: number,
    isPlayer: boolean,
    customOverride?: PlayerTeamInitParams
  ): TeamStanding => {
    const teamId = isPlayer && customOverride ? customOverride.id : team.id;
    const teamName = isPlayer && customOverride ? customOverride.nameKo : team.nameKo;
    const teamNameEn = isPlayer && customOverride ? customOverride.nameEn : team.nameEn;
    const shortName = isPlayer && customOverride ? customOverride.shortName : team.shortName;
    const logoUrl =
      isPlayer && customOverride?.customLogoUrl
        ? customOverride.customLogoUrl
        : getTeamLogo(team.id);

    return {
      rank: idx + 1,
      teamId,
      teamName,
      teamNameEn,
      shortName,
      logoUrl,
      isPlayer,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      points: 0,
      winRate: 0,
    };
  };

  const standingsA: TeamStanding[] = teamsA.map((t, idx) => toStanding(t, idx, false));
  const standingsB: TeamStanding[] = teamsB.map((t, idx) => toStanding(t, idx, false));
  const standingsC: TeamStanding[] = teamsC.map((t, idx) => toStanding(t, idx, false));

  // 플레이어 팀을 리그 D에 배치
  // 플레이어가 고른 팀이 025~030번 중 하나인지 확인
  const playerNum = getTeamNum(playerTeam.id);
  const matchedDIndex = teamsD.findIndex((t) => getTeamNum(t.id) === playerNum);

  let standingsD: TeamStanding[];
  if (matchedDIndex !== -1) {
    // 025~030번 팀 중 하나를 선택한 경우: 해당 위치를 플레이어 팀으로 교체
    standingsD = teamsD.map((t, idx) => {
      const isPlayer = idx === matchedDIndex;
      return toStanding(t, idx, isPlayer, isPlayer ? playerTeam : undefined);
    });
  } else {
    // 001~024번 팀을 선택했거나 커스텀 팀인 경우:
    // 기획 원칙에 따라 리그 D의 마지막 6번째 슬롯(30번 팀)을 플레이어 팀으로 대체하여 합류!
    standingsD = teamsD.map((t, idx) => {
      const isPlayer = idx === teamsD.length - 1; // 마지막 슬롯(30번 슬롯)
      return toStanding(t, idx, isPlayer, isPlayer ? playerTeam : undefined);
    });
  }

  return {
    A: standingsA,
    B: standingsB,
    C: standingsC,
    D: standingsD,
  };
}

export interface RegionalLeagueInfo {
  code: LeagueLanguage;
  name: string;
  fullName: string;
  koreanName: string;
  region: string;
  logoUrl: string;
}

export const REGIONAL_LEAGUES: RegionalLeagueInfo[] = [
  {
    code: "KCL",
    name: "한국 (KCL)",
    fullName: "Korea Champions League",
    koreanName: "한국 챔피언스 리그",
    region: "대한민국",
    logoUrl: "/img/league logo/kcl_logo.jpg",
  },
  {
    code: "CCL",
    name: "중국 (CCL)",
    fullName: "China Champions League",
    koreanName: "중국 챔피언스 리그",
    region: "중국",
    logoUrl: "/img/league logo/ccl_logo.jpg",
  },
  {
    code: "ECL",
    name: "EMEA (ECL)",
    fullName: "EMEA Champions League",
    koreanName: "유럽-중동-아프리카 챔피언스 리그",
    region: "유럽 / 중동 / 아프리카",
    logoUrl: "/img/league logo/ecl_logo.jpg",
  },
  {
    code: "ACL",
    name: "아메리카 (ACL)",
    fullName: "America Champions League",
    koreanName: "아메리카 챔피언스 리그",
    region: "북미 / 남미",
    logoUrl: "/img/league logo/acl_logo.jpg",
  },
  {
    code: "PCL",
    name: "태평양 (PCL)",
    fullName: "Pacific Champions League",
    koreanName: "태평양 챔피언스 리그",
    region: "대만·동남아·일본·오세아니아",
    logoUrl: "/img/league logo/pcl_logo.jpg",
  },
];

const aiDivisionsCache: Partial<Record<LeagueLanguage, LeagueDivisions>> = {};

/**
 * 플레이어가 속하지 않은 다른 지역 리그(AI 리그)의 4개 디비전 초기 순위표를 생성하거나 캐시에서 가져옵니다.
 */
export function getAiLeagueDivisions(leagueCode: LeagueLanguage): LeagueDivisions {
  if (aiDivisionsCache[leagueCode]) {
    return aiDivisionsCache[leagueCode]!;
  }

  const allTeams = PREDEFINED_TEAMS.filter((t) => t.league === leagueCode);

  const getTeamNum = (id: string): number => {
    const parts = id.split("-");
    return parts.length > 1 ? parseInt(parts[1], 10) || 999 : 999;
  };

  const sortedTeams = [...allTeams].sort((a, b) => getTeamNum(a.id) - getTeamNum(b.id));

  const teamsA = sortedTeams.slice(0, 10);
  const teamsB = sortedTeams.slice(10, 18);
  const teamsC = sortedTeams.slice(18, 24);
  const teamsD = sortedTeams.slice(24, 30);

  const toStanding = (team: typeof sortedTeams[0], idx: number): TeamStanding => ({
    rank: idx + 1,
    teamId: team.id,
    teamName: team.nameKo,
    teamNameEn: team.nameEn,
    shortName: team.shortName,
    logoUrl: getTeamLogo(team.id),
    isPlayer: false,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    points: 0,
    winRate: 0,
  });

  const divs: LeagueDivisions = {
    A: teamsA.map((t, idx) => toStanding(t, idx)),
    B: teamsB.map((t, idx) => toStanding(t, idx)),
    C: teamsC.map((t, idx) => toStanding(t, idx)),
    D: teamsD.map((t, idx) => toStanding(t, idx)),
  };

  aiDivisionsCache[leagueCode] = divs;
  return divs;
}
