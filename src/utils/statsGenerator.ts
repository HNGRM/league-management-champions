import { ChampionStatsSummary, ChampionTierGrade, PlayerStatsSummary, TeamStatsSummary } from "@/types/stats";
import { DivisionTier, LeagueLanguage, Team, TeamStanding } from "@/types/game";
import { Position } from "@/types/player";
import { PREDEFINED_TEAMS } from "@/data/teams";
import { getPlayersByTeamId } from "@/data/players";
import { getTeamLogo } from "@/data/teamLogos";
import { champions, getChampionsByPosition } from "@/data/champions";
import { DIVISION_METAS, getAiLeagueDivisions } from "@/data/divisions";
import { calculatePlayerOvr } from "@/utils/playerAssignment";
import { isTier1Champion } from "@/utils/metaTiers";

/**
 * 결정론적 시드 기반 해시 난수 생성기 (0 ~ 1)
 * 컴포넌트 리렌더링이나 정렬 시 숫자가 요동치지 않도록 안정적인 고정 난수를 생성합니다.
 */
function hashToRandom(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) + hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 100000) / 100000;
}

/**
 * 지정된 범위 내의 시드 기반 실수 난수 생성
 */
function seededRange(seed: string, min: number, max: number): number {
  const r = hashToRandom(seed);
  return min + r * (max - min);
}

/**
 * 1. 리그 선수 통계 생성 엔진 (Player Stats Summary)
 *
 * @param leagueId 리그 코드 (기본값: "KCL")
 * @param division 디비전 코드 (기본값: "D")
 * @param customTeamId 플레이어 팀 ID
 * @param customTeamName 플레이어 팀 이름 (옵션)
 * @param customPlayers 플레이어 팀 선수단 로스터 (플레이어 조작 정보 반영)
 * @param customStandings 해당 디비전 순위표 (leagueDivisions[division])
 */
export function generateLeaguePlayerStats(
  leagueId: string = "KCL",
  division: string = "D",
  customTeamId?: string,
  customTeamName?: string,
  customPlayers?: any[],
  customStandings?: TeamStanding[]
): PlayerStatsSummary[] {
  const currentTier = (division as DivisionTier) || "D";

  // customStandings가 존재하면 순위표의 실제 팀들(플레이어 팀 포함)을 100% 동일하게 사용
  // 없을 경우 AI 리그 순위표에서 해당 디비전 팀 목록을 가져옴
  const targetStandings: TeamStanding[] =
    customStandings && customStandings.length > 0
      ? customStandings
      : (getAiLeagueDivisions(leagueId as LeagueLanguage)[currentTier] || []);

  const playerStatsList: PlayerStatsSummary[] = [];

  // 각 팀의 선발(Starter) 선수단 추출
  targetStandings.forEach((standing) => {
    const tId = standing.teamId;
    const isPlayerTeam =
      standing.isPlayer || (customTeamId ? tId === customTeamId : false);
    const teamName = isPlayerTeam && customTeamName ? customTeamName : (standing.teamName || tId);

    // 팀 로스터 추출: 플레이어 팀인 경우 무조건 customPlayers(myPlayers) 우선
    let teamRoster = isPlayerTeam && customPlayers && customPlayers.length > 0
      ? customPlayers
      : getPlayersByTeamId(tId);

    if (teamRoster.length === 0 && isPlayerTeam && customPlayers && customPlayers.length > 0) {
      teamRoster = customPlayers;
    }

    // 주전 우선, 없으면 앞선 5명 추출
    const starters = teamRoster.filter(
      (p) => p.contractAndRole?.rosterStatus === "Starter"
    );
    const activePlayers = starters.length >= 5 ? starters.slice(0, 5) : teamRoster.slice(0, 5);

    activePlayers.forEach((player) => {
      const pId = player.profile?.playerId || `P_${tId}_${Math.random()}`;
      const pos: Position = player.contractAndRole?.mainPos || "MID";
      const ovr = calculatePlayerOvr(player);

      // 팀 전력 및 선수 OVR 보정치 (0.8 ~ 1.25)
      const performanceFactor = Math.max(0.8, Math.min(1.25, ovr / 70));

      // 경기 수 (12 ~ 16경기)
      const matchesPlayed = Math.round(seededRange(`${pId}_games_${leagueId}`, 12, 16));

      // 포지션별 현실적 K/D/A 기본값 분기
      let baseKills = 3.5;
      let baseDeaths = 2.4;
      let baseAssists = 5.5;

      switch (pos) {
        case "TOP":
          baseKills = seededRange(`${pId}_k`, 2.4, 4.6);
          baseDeaths = seededRange(`${pId}_d`, 1.8, 3.4);
          baseAssists = seededRange(`${pId}_a`, 3.8, 6.2);
          break;
        case "JGL":
          baseKills = seededRange(`${pId}_k`, 2.2, 4.4);
          baseDeaths = seededRange(`${pId}_d`, 1.6, 3.1);
          baseAssists = seededRange(`${pId}_a`, 5.6, 8.8);
          break;
        case "MID":
          baseKills = seededRange(`${pId}_k`, 3.8, 6.5);
          baseDeaths = seededRange(`${pId}_d`, 1.4, 2.9);
          baseAssists = seededRange(`${pId}_a`, 4.5, 7.2);
          break;
        case "BOT":
          baseKills = seededRange(`${pId}_k`, 4.2, 6.6);
          baseDeaths = seededRange(`${pId}_d`, 1.3, 2.7);
          baseAssists = seededRange(`${pId}_a`, 4.2, 6.8);
          break;
        case "SUP":
          baseKills = seededRange(`${pId}_k`, 0.8, 1.8);
          baseDeaths = seededRange(`${pId}_d`, 1.8, 3.6);
          baseAssists = seededRange(`${pId}_a`, 7.2, 9.6);
          break;
      }

      // 개인 스탯 보정치 적용
      const avgKills = parseFloat(
        Math.max(0.5, Math.min(8.0, baseKills * performanceFactor)).toFixed(1)
      );
      const avgDeaths = parseFloat(
        Math.max(1.0, Math.min(5.0, baseDeaths / (performanceFactor * 0.95 + 0.05))).toFixed(1)
      );
      const avgAssists = parseFloat(
        Math.max(1.5, Math.min(11.5, baseAssists * performanceFactor)).toFixed(1)
      );

      // KDA 계산 ((K+A)/D)
      const kda = parseFloat(
        ((avgKills + avgAssists) / Math.max(1.0, avgDeaths)).toFixed(2)
      );

      // 평균 평점 (6.20 ~ 9.20)
      const ratingBase = 6.8 + (kda / 7.5) * 1.8 + (ovr - 65) * 0.04;
      const avgRating = parseFloat(
        Math.max(6.0, Math.min(9.4, ratingBase)).toFixed(2)
      );

      // MVP 횟수 (0 ~ 5회, 고평점자 가중치)
      const mvpChance = hashToRandom(`${pId}_mvp`);
      let mvpCount = 0;
      if (avgRating >= 8.5 || kda >= 5.5) {
        mvpCount = mvpChance > 0.4 ? (mvpChance > 0.75 ? 4 : 3) : 2;
      } else if (avgRating >= 7.8 || kda >= 4.2) {
        mvpCount = mvpChance > 0.5 ? 2 : 1;
      } else if (avgRating >= 7.2) {
        mvpCount = mvpChance > 0.7 ? 1 : 0;
      }

      // 모스트픽 상위 3개 챔피언 선정
      const posChampions = getChampionsByPosition(pos);
      const sortedByMastery = [...posChampions].sort((a, b) => {
        const masteryA = player.traitsAndMastery?.championMastery?.[a.id] ?? 50;
        const masteryB = player.traitsAndMastery?.championMastery?.[b.id] ?? 50;
        return masteryB - masteryA;
      });

      const top3Champs = sortedByMastery.slice(0, 3);
      const g1 = Math.round(matchesPlayed * 0.45);
      const g2 = Math.round(matchesPlayed * 0.35);
      const g3 = Math.max(1, matchesPlayed - g1 - g2);
      const gamesArr = [g1, g2, g3];

      const mostPicks = top3Champs.map((champ, idx) => {
        const champGames = gamesArr[idx] || 2;
        const winRateBase = Math.round(
          seededRange(`${pId}_${champ.id}_wr`, 45, 80) + (performanceFactor - 1) * 20
        );
        const winRate = Math.max(30, Math.min(90, winRateBase));
        return {
          championId: champ.id,
          games: champGames,
          winRate,
        };
      });

      playerStatsList.push({
        playerId: pId,
        playerName: player.profile
          ? `${player.profile.nicknameEn} (${player.profile.nicknameKr})`
          : `선수 (${pos})`,
        teamId: tId,
        teamName,
        position: pos,
        matchesPlayed,
        avgKills,
        avgDeaths,
        avgAssists,
        kda,
        avgRating,
        mvpCount,
        mostPicks,
        isPlayerTeam,
      });
    });
  });

  return playerStatsList;
}

/**
 * 2. 리그 팀 통계 생성 엔진 (Team Stats Summary)
 *
 * @param leagueId 리그 코드 (기본값: "KCL")
 * @param division 디비전 코드 (기본값: "D")
 * @param customTeamId 플레이어 팀 ID
 * @param customTeamName 플레이어 팀 이름 (옵션)
 * @param customStandings 기존 순위표 데이터 (leagueDivisions[division])
 * @param customTeamLogo 플레이어 팀 커스텀 로고 (옵션)
 */
export function generateLeagueTeamStats(
  leagueId: string = "KCL",
  division: string = "D",
  customTeamId?: string,
  customTeamName?: string,
  customStandings?: TeamStanding[],
  customTeamLogo?: string | null
): TeamStatsSummary[] {
  const currentTier = (division as DivisionTier) || "D";

  // customStandings가 존재하면 순위표의 실제 팀들(플레이어 팀 포함)을 100% 동일하게 사용
  // 없을 경우 AI 리그 순위표에서 해당 디비전 팀 목록을 가져옴
  const targetStandings: TeamStanding[] =
    customStandings && customStandings.length > 0
      ? customStandings
      : (getAiLeagueDivisions(leagueId as LeagueLanguage)[currentTier] || []);

  return targetStandings.map((standing) => {
    const tId = standing.teamId;
    const isPlayerTeam =
      standing.isPlayer || (customTeamId ? tId === customTeamId : false);
    const teamName = isPlayerTeam && customTeamName ? customTeamName : (standing.teamName || tId);
    const teamLogo =
      (isPlayerTeam && customTeamLogo ? customTeamLogo : standing.logoUrl) ||
      getTeamLogo(tId) ||
      null;

    // 순위표 연동 경기 수 또는 기본 12~16경기 (시즌 개막 전 모의 통계)
    const matchesPlayed = standing.matchesPlayed > 0
      ? standing.matchesPlayed
      : Math.round(seededRange(`${tId}_t_games`, 12, 16));

    const winRate = standing.matchesPlayed > 0
      ? (standing.wins / standing.matchesPlayed)
      : seededRange(`${tId}_t_wr`, 0.35, 0.7);

    // 현실적인 팀 합산 스탯
    const avgKills = parseFloat(seededRange(`${tId}_tk`, 10.5, 16.5).toFixed(1));
    const avgDeaths = parseFloat(seededRange(`${tId}_td`, 8.5, 15.0).toFixed(1));
    const avgAssists = parseFloat(seededRange(`${tId}_ta`, 24.0, 39.0).toFixed(1));
    const kda = parseFloat(((avgKills + avgAssists) / Math.max(1, avgDeaths)).toFixed(2));

    const avgRating = parseFloat(
      (6.7 + winRate * 1.8 + seededRange(`${tId}_trating`, -0.2, 0.3)).toFixed(2)
    );

    // 선취점 획득률 (35% ~ 65%)
    const firstBloodRate = Math.round(
      Math.max(30, Math.min(75, 45 + (winRate - 0.5) * 40 + seededRange(`${tId}_fb`, -8, 8)))
    );

    // 오브젝트 제어율 (35% ~ 65%)
    const objectiveControlRate = Math.round(
      Math.max(30, Math.min(75, 46 + (winRate - 0.5) * 45 + seededRange(`${tId}_obj`, -6, 6)))
    );

    return {
      teamId: tId,
      teamName,
      teamLogo,
      matchesPlayed,
      avgKills,
      avgDeaths,
      avgAssists,
      kda,
      avgRating,
      firstBloodRate,
      objectiveControlRate,
      isPlayer: isPlayerTeam,
    };
  });
}

/**
 * 3. 리그 챔피언 통계 생성 엔진 (Champion Stats Summary)
 *
 * 전체 80종 챔피언의 밴픽률, 승률, 출전 횟수 및 메타 티어 지능형 산정
 */
export function generateLeagueChampionStats(): ChampionStatsSummary[] {
  // 기준 리그 총 매치 세트 수 (약 60세트)
  const totalLeagueMatches = 64;

  return champions.map((champ) => {
    const cId = champ.id;
    const isT1 = isTier1Champion(cId);

    // 메타 1티어 여부 및 시드 난수 기반 밴픽률 (5% ~ 92%)
    let pickBanRate: number;
    if (isT1) {
      pickBanRate = parseFloat(seededRange(`champ_pb_${cId}`, 65.0, 92.5).toFixed(1));
    } else {
      const tierSeed = hashToRandom(`champ_tier_${cId}`);
      if (tierSeed > 0.7) {
        pickBanRate = parseFloat(seededRange(`champ_pb_${cId}`, 40.0, 68.0).toFixed(1));
      } else if (tierSeed > 0.35) {
        pickBanRate = parseFloat(seededRange(`champ_pb_${cId}`, 18.0, 42.0).toFixed(1));
      } else {
        pickBanRate = parseFloat(seededRange(`champ_pb_${cId}`, 4.5, 20.0).toFixed(1));
      }
    }

    // 픽 / 밴 횟수 분배
    const totalPicksAndBans = Math.round((totalLeagueMatches * pickBanRate) / 100);
    const banRatio = seededRange(`champ_banratio_${cId}`, 0.35, 0.65);
    const banCount = Math.round(totalPicksAndBans * banRatio);
    const pickCount = Math.max(1, totalPicksAndBans - banCount);

    // 승률 (35% ~ 68% 분포)
    let winRateBase = seededRange(`champ_wr_${cId}`, 44.0, 58.0);
    if (isT1) {
      winRateBase += seededRange(`champ_t1_bonus_${cId}`, 3.0, 8.0);
    } else if (pickBanRate > 50 && hashToRandom(`champ_trap_${cId}`) > 0.65) {
      // 픽률은 높은데 승률이 낮은 함정픽 시뮬레이션
      winRateBase -= seededRange(`champ_trap_pen_${cId}`, 8.0, 14.0);
    }
    const winRate = parseFloat(Math.max(34.0, Math.min(68.5, winRateBase)).toFixed(1));

    const wins = Math.round((pickCount * winRate) / 100);
    const losses = Math.max(0, pickCount - wins);

    // 티어 자동 산정 규칙
    let customTier: ChampionTierGrade = "3티어";
    if (pickBanRate >= 70 && winRate >= 54) {
      customTier = "OP";
    } else if (pickBanRate >= 55 && winRate >= 50) {
      customTier = "1티어";
    } else if (pickBanRate >= 45 && winRate < 42) {
      customTier = "함정픽";
    } else if (pickBanRate >= 32) {
      customTier = "2티어";
    } else {
      customTier = "3티어";
    }

    return {
      championId: cId,
      nameKr: champ.nameKr,
      nameEn: champ.nameEn,
      primaryRole: champ.primaryRole,
      portrait: champ.images.portrait,
      wins,
      losses,
      winRate,
      pickCount,
      banCount,
      pickBanRate,
      customTier,
    };
  });
}
