import { DivisionTier, LeagueDivisions, LeagueLanguage, TeamStanding } from "@/types/game";
import {
  BracketMatch,
  BracketMatchTeam,
  CareerStatCategory,
  ClubHistoryEntry,
  CupTeamResult,
  PlayerCareerRecord,
  TournamentBracket,
  TournamentHistory,
} from "@/types/record";
import { PREDEFINED_TEAMS } from "./teams";
import { TEAM_LOGOS, getTeamLogo } from "./teamLogos";

/**
 * 특정 리그 및 디비전의 팀 목록 추출
 */
function getTeamsByDivision(league: LeagueLanguage, tier: DivisionTier) {
  const leagueTeams = PREDEFINED_TEAMS.filter((t) => t.league === league);
  const rangeMap: Record<DivisionTier, [number, number]> = {
    A: [0, 10],
    B: [10, 18],
    C: [18, 24],
    D: [24, 30],
  };
  const [start, end] = rangeMap[tier];
  return leagueTeams.slice(start, end);
}

/**
 * 현실감 넘치는 모의 정규리그 순위표 생성 (시드 기반 결정론적 순위)
 */
function generateMockDivisionStandings(
  league: LeagueLanguage,
  tier: DivisionTier,
  yearSeed: number
): TeamStanding[] {
  const teams = getTeamsByDivision(league, tier);
  const teamCount = teams.length;
  const matchesPerTeam = tier === "A" ? 18 : tier === "B" ? 14 : 10;

  // yearSeed와 인덱스를 이용해 고정된 현실적 승패 생성
  return teams.map((team, idx) => {
    // 상위권 팀일수록 승률이 높도록 가중치 부여
    const winRateBase = Math.max(0.2, 0.85 - (idx / teamCount) * 0.65 + ((yearSeed * (idx + 1)) % 10 - 5) * 0.02);
    const wins = Math.min(matchesPerTeam, Math.max(1, Math.round(matchesPerTeam * winRateBase)));
    const losses = matchesPerTeam - wins;
    const diff = (wins - losses) * 2 + ((yearSeed + idx) % 5 - 2);
    const winRate = Math.round((wins / matchesPerTeam) * 100);

    return {
      rank: idx + 1,
      teamId: team.id,
      teamName: team.nameKo,
      teamNameEn: team.nameEn,
      shortName: team.shortName,
      logoUrl: TEAM_LOGOS[team.id] || null,
      isPlayer: false,
      matchesPlayed: matchesPerTeam,
      wins,
      losses,
      points: diff,
      winRate,
    };
  }).sort((a, b) => b.wins - a.wins || b.points - a.points)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

/**
 * 컵 대회(MCC, WCC) 16강 본선 토너먼트 모의 결과 생성
 */
function generateMockCupResults(
  cupType: "MCC" | "WCC",
  year: number,
  championLeague: LeagueLanguage = "KCL"
): { results: CupTeamResult[]; winnerTeam: string; runnerUpTeam: string; finalsMvp: string } {
  // 5대 리그 상위권 명문팀 후보
  const topTeams = [
    { id: "KCL-001", name: "서울 엠페러스", shortName: "SME", league: "KCL" as LeagueLanguage },
    { id: "CCL-001", name: "베이징 드래곤즈", shortName: "BJD", league: "CCL" as LeagueLanguage },
    { id: "ECL-001", name: "런던 로열스", shortName: "LDR", league: "ECL" as LeagueLanguage },
    { id: "ACL-001", name: "뉴욕 타이탄스", shortName: "NYT", league: "ACL" as LeagueLanguage },
    { id: "PCL-001", name: "도쿄 사무라이", shortName: "TKS", league: "PCL" as LeagueLanguage },
    { id: "KCL-002", name: "인천 그리핀즈", shortName: "ICG", league: "KCL" as LeagueLanguage },
    { id: "CCL-002", name: "상하이 피닉스", shortName: "SHP", league: "CCL" as LeagueLanguage },
    { id: "ECL-002", name: "파리 레지옹", shortName: "PRL", league: "ECL" as LeagueLanguage },
    { id: "ACL-002", name: "LA 바이퍼스", shortName: "LAV", league: "ACL" as LeagueLanguage },
    { id: "PCL-002", name: "타이베이 어새신", shortName: "TBA", league: "PCL" as LeagueLanguage },
    { id: "KCL-003", name: "대전 노바", shortName: "DJN", league: "KCL" as LeagueLanguage },
    { id: "CCL-003", name: "광저우 타이거스", shortName: "GZT", league: "CCL" as LeagueLanguage },
    { id: "ECL-003", name: "베를린 발키리", shortName: "BLV", league: "ECL" as LeagueLanguage },
    { id: "ACL-003", name: "토론토 블리자드", shortName: "TRB", league: "ACL" as LeagueLanguage },
    { id: "KCL-004", name: "광주 라이트닝", shortName: "GJL", league: "KCL" as LeagueLanguage },
    { id: "PCL-003", name: "시드니 썬더", shortName: "SDT", league: "PCL" as LeagueLanguage },
  ];

  // 연도별 우승자 순환 (2024: KCL-001 서울, 2025: CCL-001 베이징, 2026: KCL-002 인천 등)
  const isEven = year % 2 === 0;
  const champ = isEven ? topTeams[0] : topTeams[1];
  const runner = isEven ? topTeams[1] : topTeams[0];

  const finalsMvpPool = ["Faker", "Chovy", "Ruler", "Viper", "Canyon", "Keria", "Zeus", "Knight"];
  const finalsMvp = finalsMvpPool[(year * 3 + (cupType === "WCC" ? 1 : 0)) % finalsMvpPool.length];

  const results: CupTeamResult[] = [
    {
      rank: 1,
      rankLabel: "우승 🏆",
      teamId: champ.id,
      teamName: champ.name,
      shortName: champ.shortName,
      league: champ.league,
      logoUrl: TEAM_LOGOS[champ.id] || null,
      matchScore: "3 - 2",
    },
    {
      rank: 2,
      rankLabel: "준우승 🥈",
      teamId: runner.id,
      teamName: runner.name,
      shortName: runner.shortName,
      league: runner.league,
      logoUrl: TEAM_LOGOS[runner.id] || null,
      matchScore: "2 - 3",
    },
    {
      rank: 3,
      rankLabel: "4강 (Semis)",
      teamId: topTeams[2].id,
      teamName: topTeams[2].name,
      shortName: topTeams[2].shortName,
      league: topTeams[2].league,
      logoUrl: TEAM_LOGOS[topTeams[2].id] || null,
    },
    {
      rank: 4,
      rankLabel: "4강 (Semis)",
      teamId: topTeams[3].id,
      teamName: topTeams[3].name,
      shortName: topTeams[3].shortName,
      league: topTeams[3].league,
      logoUrl: TEAM_LOGOS[topTeams[3].id] || null,
    },
    ...topTeams.slice(4, 8).map((t, idx) => ({
      rank: 5 + idx,
      rankLabel: "8강",
      teamId: t.id,
      teamName: t.name,
      shortName: t.shortName,
      league: t.league,
      logoUrl: TEAM_LOGOS[t.id] || null,
    })),
    ...topTeams.slice(8, 16).map((t, idx) => ({
      rank: 9 + idx,
      rankLabel: "16강",
      teamId: t.id,
      teamName: t.name,
      shortName: t.shortName,
      league: t.league,
      logoUrl: TEAM_LOGOS[t.id] || null,
    })),
  ];

  return { results, winnerTeam: champ.name, runnerUpTeam: runner.name, finalsMvp };
}

const SEED_MAP: Record<string, string> = {
  "KCL-001": "KCL 1시드",
  "KCL-002": "KCL 2시드",
  "KCL-003": "KCL 3시드",
  "KCL-004": "KCL 4시드",
  "CCL-001": "CCL 1시드",
  "CCL-002": "CCL 2시드",
  "CCL-003": "CCL 3시드",
  "CCL-004": "CCL 4시드",
  "ECL-001": "ECL 1시드",
  "ECL-002": "ECL 2시드",
  "ECL-003": "ECL 3시드",
  "ACL-001": "ACL 1시드",
  "ACL-002": "ACL 2시드",
  "ACL-003": "ACL 3시드",
  "PCL-001": "PCL 1시드",
  "PCL-002": "PCL 2시드",
  "PCL-003": "PCL 3시드",
};

function createBracketTeam(
  team: CupTeamResult,
  score: number,
  isWinner: boolean,
  isChampion: boolean = false
): BracketMatchTeam {
  return {
    teamId: team.teamId,
    teamName: team.teamName,
    shortName: team.shortName,
    league: team.league,
    seedInfo: SEED_MAP[team.teamId] || `${team.league} 대표`,
    logoUrl: team.logoUrl || getTeamLogo(team.teamId),
    score,
    isWinner,
    isChampion,
  };
}

/**
 * MCC 16강 싱글 엘리미네이션 토너먼트 대진표 생성
 */
export function generateMccTournamentBracket(
  history: Pick<TournamentHistory, "year" | "winnerTeamName" | "runnerUpTeamName" | "cupResults">
): TournamentBracket {
  const cupTeams = history.cupResults || [];

  // 1위(우승), 2위(준우승), 3~4위(4강), 5~8위(8강), 9~16위(16강) 매핑
  const champ = cupTeams.find((t) => t.rank === 1) || cupTeams[0];
  const runner = cupTeams.find((t) => t.rank === 2) || cupTeams[1];
  const semis = cupTeams.filter((t) => t.rank === 3 || t.rank === 4);
  const sf1Team = semis[0] || cupTeams[2];
  const sf2Team = semis[1] || cupTeams[3];

  const quarters = cupTeams.filter((t) => t.rank >= 5 && t.rank <= 8);
  const qf1Opp = quarters[0] || cupTeams[4];
  const qf2Opp = quarters[1] || cupTeams[5];
  const qf3Opp = quarters[2] || cupTeams[6];
  const qf4Opp = quarters[3] || cupTeams[7];

  const round16 = cupTeams.filter((t) => t.rank >= 9);
  const r16_1 = round16[0] || cupTeams[8];
  const r16_2 = round16[1] || cupTeams[9];
  const r16_3 = round16[2] || cupTeams[10];
  const r16_4 = round16[3] || cupTeams[11];
  const r16_5 = round16[4] || cupTeams[12];
  const r16_6 = round16[5] || cupTeams[13];
  const r16_7 = round16[6] || cupTeams[14];
  const r16_8 = round16[7] || cupTeams[15];

  // 1. 16강전 (8경기)
  const roundOf16: BracketMatch[] = [
    {
      matchId: "R16-1",
      roundLabel: "16강 1경기",
      dateLabel: "6/2",
      team1: createBracketTeam(champ, 3, true),
      team2: createBracketTeam(r16_1, 0, false),
    },
    {
      matchId: "R16-2",
      roundLabel: "16강 2경기",
      dateLabel: "6/3",
      team1: createBracketTeam(qf1Opp, 3, true),
      team2: createBracketTeam(r16_2, 1, false),
    },
    {
      matchId: "R16-3",
      roundLabel: "16강 3경기",
      dateLabel: "6/4",
      team1: createBracketTeam(sf1Team, 3, true),
      team2: createBracketTeam(r16_3, 1, false),
    },
    {
      matchId: "R16-4",
      roundLabel: "16강 4경기",
      dateLabel: "6/5",
      team1: createBracketTeam(qf2Opp, 3, true),
      team2: createBracketTeam(r16_4, 2, false),
    },
    {
      matchId: "R16-5",
      roundLabel: "16강 5경기",
      dateLabel: "6/6",
      team1: createBracketTeam(runner, 3, true),
      team2: createBracketTeam(r16_5, 0, false),
    },
    {
      matchId: "R16-6",
      roundLabel: "16강 6경기",
      dateLabel: "6/7",
      team1: createBracketTeam(qf3Opp, 3, true),
      team2: createBracketTeam(r16_6, 1, false),
    },
    {
      matchId: "R16-7",
      roundLabel: "16강 7경기",
      dateLabel: "6/8",
      team1: createBracketTeam(sf2Team, 3, true),
      team2: createBracketTeam(r16_7, 1, false),
    },
    {
      matchId: "R16-8",
      roundLabel: "16강 8경기",
      dateLabel: "6/9",
      team1: createBracketTeam(qf4Opp, 3, true),
      team2: createBracketTeam(r16_8, 2, false),
    },
  ];

  // 2. 8강전 (4경기)
  const quarterFinals: BracketMatch[] = [
    {
      matchId: "QF-1",
      roundLabel: "8강 1경기",
      dateLabel: "6/12",
      team1: createBracketTeam(champ, 3, true),
      team2: createBracketTeam(qf1Opp, 0, false),
    },
    {
      matchId: "QF-2",
      roundLabel: "8강 2경기",
      dateLabel: "6/13",
      team1: createBracketTeam(sf1Team, 3, true),
      team2: createBracketTeam(qf2Opp, 1, false),
    },
    {
      matchId: "QF-3",
      roundLabel: "8강 3경기",
      dateLabel: "6/14",
      team1: createBracketTeam(runner, 3, true),
      team2: createBracketTeam(qf3Opp, 1, false),
    },
    {
      matchId: "QF-4",
      roundLabel: "8강 4경기",
      dateLabel: "6/15",
      team1: createBracketTeam(sf2Team, 3, true),
      team2: createBracketTeam(qf4Opp, 1, false),
    },
  ];

  // 3. 4강전 (2경기)
  const semiFinals: BracketMatch[] = [
    {
      matchId: "SF-1",
      roundLabel: "4강 1경기",
      dateLabel: "6/18",
      team1: createBracketTeam(champ, 3, true),
      team2: createBracketTeam(sf1Team, 1, false),
    },
    {
      matchId: "SF-2",
      roundLabel: "4강 2경기",
      dateLabel: "6/19",
      team1: createBracketTeam(runner, 3, true),
      team2: createBracketTeam(sf2Team, 2, false),
    },
  ];

  // 4. 결승전 (1경기)
  const finals: BracketMatch = {
    matchId: "FINAL",
    roundLabel: "결승전",
    dateLabel: "6/24",
    team1: createBracketTeam(champ, 3, true, true),
    team2: createBracketTeam(runner, 2, false, false),
  };

  return {
    roundOf16,
    quarterFinals,
    semiFinals,
    finals,
  };
}

/**
 * 게임 생성 연도(Y_created)를 기준으로 직전 3개년 프리셋 대회 아카이브 생성
 */
export function generatePresetTournamentHistories(
  createdYear: number = 2026,
  playerLeague: LeagueLanguage = "KCL"
): TournamentHistory[] {
  const presetYears = [createdYear - 2, createdYear - 1, createdYear];
  const histories: TournamentHistory[] = [];

  for (const year of presetYears) {
    // 1. 스프링 시즌 (디비전 A ~ D)
    const tiers: DivisionTier[] = ["A", "B", "C", "D"];
    for (const tier of tiers) {
      const standings = generateMockDivisionStandings(playerLeague, tier, year * 11 + tier.charCodeAt(0));
      const winner = standings[0];
      const runnerUp = standings[1];
      histories.push({
        id: `${year}_SPRING_${playerLeague}_${tier}`,
        year,
        type: "SPRING",
        league: playerLeague,
        division: tier,
        winnerTeamName: winner.teamName,
        winnerShortName: winner.shortName,
        winnerLogoUrl: winner.logoUrl,
        runnerUpTeamName: runnerUp.teamName,
        finalsMvpName: tier === "A" ? (year % 2 === 0 ? "Faker" : "Chovy") : undefined,
        standings,
      });
    }

    // 2. 미드시즌 챔피언스 컵 (MCC)
    const mccData = generateMockCupResults("MCC", year, playerLeague);
    const mccHistoryBase = {
      id: `${year}_MCC`,
      year,
      type: "MCC" as const,
      winnerTeamName: mccData.winnerTeam,
      winnerShortName: mccData.results[0].shortName,
      winnerLogoUrl: mccData.results[0].logoUrl,
      runnerUpTeamName: mccData.runnerUpTeam,
      finalsMvpName: mccData.finalsMvp,
      cupResults: mccData.results,
    };
    const mccBracket = generateMccTournamentBracket(mccHistoryBase);
    histories.push({
      ...mccHistoryBase,
      bracket: mccBracket,
    });

    // 3. 서머 시즌 (디비전 A ~ D)
    for (const tier of tiers) {
      const standings = generateMockDivisionStandings(playerLeague, tier, year * 17 + tier.charCodeAt(0));
      const winner = standings[0];
      const runnerUp = standings[1];
      histories.push({
        id: `${year}_SUMMER_${playerLeague}_${tier}`,
        year,
        type: "SUMMER",
        league: playerLeague,
        division: tier,
        winnerTeamName: winner.teamName,
        winnerShortName: winner.shortName,
        winnerLogoUrl: winner.logoUrl,
        runnerUpTeamName: runnerUp.teamName,
        finalsMvpName: tier === "A" ? (year % 2 === 0 ? "Viper" : "Ruler") : undefined,
        standings,
      });
    }

    // 4. 월드 챔피언스 컵 (WCC)
    const wccData = generateMockCupResults("WCC", year, playerLeague);
    histories.push({
      id: `${year}_WCC`,
      year,
      type: "WCC",
      winnerTeamName: wccData.winnerTeam,
      winnerShortName: wccData.results[0].shortName,
      winnerLogoUrl: wccData.results[0].logoUrl,
      runnerUpTeamName: wccData.runnerUpTeam,
      finalsMvpName: wccData.finalsMvp,
      cupResults: wccData.results,
    });
  }

  return histories;
}

/**
 * 리그 내 베테랑 및 스타 선수들의 현실감 넘치는 역대 통산 기록 TOP 20 프리셋
 */
export function generatePresetPlayerCareers(): PlayerCareerRecord[] {
  return [
    {
      playerId: "P_LEGEND_01",
      playerName: "Faker",
      realName: "이상혁",
      position: "MID",
      teamName: "서울 엠페러스",
      teamLogoUrl: "/img/team logo/kcl/kcl_01_seoul_emperors.jpg",
      league: "KCL",
      totalGames: 890,
      totalMvpCount: 68,
      totalKills: 3240,
      totalAssists: 5120,
      avgRating: 8.9,
      soloKills: 142,
      pentakills: 4,
    },
    {
      playerId: "P_LEGEND_02",
      playerName: "Ruler",
      realName: "박재혁",
      position: "BOT",
      teamName: "인천 그리핀즈",
      teamLogoUrl: "/img/team logo/kcl/kcl_02_incheon_griffins.jpg",
      league: "KCL",
      totalGames: 720,
      totalMvpCount: 52,
      totalKills: 3080,
      totalAssists: 3820,
      avgRating: 8.8,
      soloKills: 78,
      pentakills: 7,
    },
    {
      playerId: "P_LEGEND_03",
      playerName: "Chovy",
      realName: "정지훈",
      position: "MID",
      teamName: "대전 노바",
      teamLogoUrl: "/img/team logo/kcl/kcl_03_daejeon_nova.jpg",
      league: "KCL",
      totalGames: 610,
      totalMvpCount: 58,
      totalKills: 2650,
      totalAssists: 3450,
      avgRating: 9.1,
      soloKills: 156,
      pentakills: 3,
    },
    {
      playerId: "P_LEGEND_04",
      playerName: "Viper",
      realName: "박도현",
      position: "BOT",
      teamName: "광주 라이트닝",
      teamLogoUrl: "/img/team logo/kcl/kcl_04_gwangju_lightning.jpg",
      league: "KCL",
      totalGames: 590,
      totalMvpCount: 46,
      totalKills: 2540,
      totalAssists: 3120,
      avgRating: 8.7,
      soloKills: 64,
      pentakills: 5,
    },
    {
      playerId: "P_LEGEND_05",
      playerName: "ShowMaker",
      realName: "허수",
      position: "MID",
      teamName: "대구 블레이즈",
      teamLogoUrl: "/img/team logo/kcl/kcl_05_daegu_blaze.jpg",
      league: "KCL",
      totalGames: 640,
      totalMvpCount: 44,
      totalKills: 2420,
      totalAssists: 3670,
      avgRating: 8.6,
      soloKills: 112,
      pentakills: 2,
    },
    {
      playerId: "P_LEGEND_06",
      playerName: "Canyon",
      realName: "김건부",
      position: "JGL",
      teamName: "대전 노바",
      teamLogoUrl: "/img/team logo/kcl/kcl_03_daejeon_nova.jpg",
      league: "KCL",
      totalGames: 580,
      totalMvpCount: 49,
      totalKills: 1980,
      totalAssists: 4320,
      avgRating: 8.8,
      soloKills: 94,
      pentakills: 2,
    },
    {
      playerId: "P_LEGEND_07",
      playerName: "Zeus",
      realName: "최우제",
      position: "TOP",
      teamName: "서울 엠페러스",
      teamLogoUrl: "/img/team logo/kcl/kcl_01_seoul_emperors.jpg",
      league: "KCL",
      totalGames: 430,
      totalMvpCount: 38,
      totalKills: 1820,
      totalAssists: 2780,
      avgRating: 8.7,
      soloKills: 138,
      pentakills: 1,
    },
    {
      playerId: "P_LEGEND_08",
      playerName: "Kiin",
      realName: "김기인",
      position: "TOP",
      teamName: "울산 레비아탄",
      teamLogoUrl: "/img/team logo/kcl/kcl_06_ulsan_leviathan.jpg",
      league: "KCL",
      totalGames: 710,
      totalMvpCount: 36,
      totalKills: 2150,
      totalAssists: 3890,
      avgRating: 8.4,
      soloKills: 128,
      pentakills: 1,
    },
    {
      playerId: "P_LEGEND_09",
      playerName: "Keria",
      realName: "류민석",
      position: "SUP",
      teamName: "서울 엠페러스",
      teamLogoUrl: "/img/team logo/kcl/kcl_01_seoul_emperors.jpg",
      league: "KCL",
      totalGames: 530,
      totalMvpCount: 34,
      totalKills: 620,
      totalAssists: 5840,
      avgRating: 8.6,
      soloKills: 18,
      pentakills: 0,
    },
    {
      playerId: "P_LEGEND_10",
      playerName: "Oner",
      realName: "문현준",
      position: "JGL",
      teamName: "서울 엠페러스",
      teamLogoUrl: "/img/team logo/kcl/kcl_01_seoul_emperors.jpg",
      league: "KCL",
      totalGames: 480,
      totalMvpCount: 31,
      totalKills: 1540,
      totalAssists: 3950,
      avgRating: 8.3,
      soloKills: 72,
      pentakills: 1,
    },
    {
      playerId: "P_LEGEND_11",
      playerName: "Knight",
      realName: "줘딩",
      position: "MID",
      teamName: "베이징 드래곤즈",
      teamLogoUrl: null,
      league: "CCL",
      totalGames: 620,
      totalMvpCount: 54,
      totalKills: 2780,
      totalAssists: 3620,
      avgRating: 8.9,
      soloKills: 134,
      pentakills: 3,
    },
    {
      playerId: "P_LEGEND_12",
      playerName: "JackeyLove",
      realName: "위원보",
      position: "BOT",
      teamName: "상하이 피닉스",
      teamLogoUrl: null,
      league: "CCL",
      totalGames: 670,
      totalMvpCount: 42,
      totalKills: 2890,
      totalAssists: 3310,
      avgRating: 8.5,
      soloKills: 82,
      pentakills: 6,
    },
  ];
}

/**
 * 플레이어 구단 초기 연표 생성 (창단 시점 1개 마일스톤)
 */
export function getInitialClubHistory(
  createdYear: number = 2026,
  teamName: string = "플레이어 구단",
  division: DivisionTier = "D"
): ClubHistoryEntry[] {
  const startYear = createdYear + 1;
  return [
    {
      year: startYear,
      division,
      springRank: 0,
      springResult: "스프링 시즌 준비 중",
      mccResult: "미출전",
      summerRank: 0,
      summerResult: "서머 시즌 예정",
      wccResult: "미출전",
      transfersIn: [],
      transfersOut: [],
      milestones: [
        `${startYear}년 1월: 구단 공식 창단 및 ${division} 디비전 리그 참가 승인`,
        "초대 감독 취임 및 신임 코칭스태프 구성 완료",
      ],
    },
  ];
}
