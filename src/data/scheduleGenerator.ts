import {
  MatchSchedule,
  SeasonPhase,
  getSeasonPhase,
  getWeekMonthInfo,
} from "@/types/schedule";
import { TeamStanding, DivisionTier } from "@/types/game";
import { champions } from "./champions";

/**
 * 상대 팀의 고유 ID를 기반으로 경계해야 할 핵심 챔피언 TOP 3를 결정론적으로 선출
 */
export function getCautionChampionsForTeam(teamId: string): string[] {
  if (!teamId || champions.length === 0) return ["001", "002", "003"];

  // 문자열 해시 생성
  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    hash = (hash << 5) - hash + teamId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const selectedIds: string[] = [];
  const usedPositions = new Set<string>();

  // 챔피언 목록 순회하며 서로 다른 포지션의 챔피언 3개 선출
  for (let step = 0; step < champions.length && selectedIds.length < 3; step++) {
    const idx = (hash + step * 7) % champions.length;
    const champ = champions[idx];
    const pos = champ.positions[0] || "MID";

    if (!usedPositions.has(pos) || selectedIds.length >= 2) {
      if (!selectedIds.includes(champ.id)) {
        selectedIds.push(champ.id);
        usedPositions.add(pos);
      }
    }
  }

  // 부족할 경우 채우기
  let fallbackIdx = 1;
  while (selectedIds.length < 3) {
    const id = String(fallbackIdx).padStart(3, "0");
    if (!selectedIds.includes(id)) {
      selectedIds.push(id);
    }
    fallbackIdx++;
  }

  return selectedIds;
}

/**
 * 라운드 로빈(Circle Method)을 이용하여 N개 팀 간의 주간 매치업 페어링 생성
 * @param teamIds 팀 ID 배열
 * @returns 각 라운드(주차)별 매치 배열: [ [ [home, away], [home, away] ], ... ]
 */
function generateRoundRobinPairs(teamIds: string[]): Array<Array<[string, string]>> {
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) {
    teams.push("__BYE__");
  }

  const n = teams.length;
  const totalRounds = n - 1;
  const matchesPerRound = n / 2;
  const schedule: Array<Array<[string, string]>> = [];

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches: Array<[string, string]> = [];
    for (let match = 0; match < matchesPerRound; match++) {
      const homeIdx = (round + match) % (n - 1);
      let awayIdx = (n - 1 - match + round) % (n - 1);

      if (match === 0) {
        awayIdx = n - 1;
      }

      const home = teams[homeIdx];
      const away = teams[awayIdx];

      if (home !== "__BYE__" && away !== "__BYE__") {
        // 홈/어웨이 교차
        if (round % 2 === 1) {
          roundMatches.push([away, home]);
        } else {
          roundMatches.push([home, away]);
        }
      }
    }
    schedule.push(roundMatches);
  }

  return schedule;
}

/**
 * 48주 연간 전체 리그 캘린더 및 대진표를 생성
 */
export function generateAnnualSeasonSchedule(
  divisionTeams: TeamStanding[],
  playerTeamId: string,
  divisionTier: DivisionTier = "D",
  currentWeek: number = 1
): MatchSchedule[] {
  const schedule: MatchSchedule[] = [];
  const teamIds = divisionTeams.map((t) => t.teamId);

  // 라운드 로빈 기본 1회전 (예: 6팀 기준 5라운드 매치업)
  const roundRobinRounds = generateRoundRobinPairs(teamIds);
  const numRounds = roundRobinRounds.length; // 6팀이면 5

  // 스프링 정규시즌 매치 주차: 5, 6, 7, 8, 9주차 (1차전 5경기) / 10주차 휴식 / 11, 12, 13, 14, 15주차 (2차전 5경기)
  // 서머 정규시즌 매치 주차: 25, 26, 27, 28, 29주차 (1차전 5경기) / 30주차 휴식 / 31, 32, 33, 34, 35주차 (2차전 5경기)

  // 1~48주 순회하며 매치 및 이벤트 생성
  for (let week = 1; week <= 48; week++) {
    const { month, monthWeek } = getWeekMonthInfo(week);
    const phase = getSeasonPhase(week);

    // ==============================================================
    // 1. 1월 (1~4주차) : 스토브리그 (STOVE_LEAGUE)
    // ==============================================================
    if (week === 1) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "EVENT",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "연간 시상식 & 은퇴 발표",
        eventDescription:
          "지난 시즌 최고의 활약을 펼친 리그 MVP 시상식이 열리며, 은퇴 선수의 공식 발표와 함께 대형 FA 선수들이 이적 시장에 풀립니다.",
        eventIcon: "❄️",
        divisionTier,
      });
      continue;
    }

    if (week === 2) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "EVENT",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "스폰서 계약 협상 & 선수 재계약",
        eventDescription:
          "새 시즌 팀 운영 예산을 책임질 메인/서브 스폰서 계약 협상을 진행하고, 계약 만료 예정인 핵심 선수들과의 재계약을 체결합니다.",
        eventIcon: "🤝",
        divisionTier,
      });
      continue;
    }

    if (week === 3) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "EVENT",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "이적 시장 개장 & 1차 연습 스크림",
        eventDescription:
          "FA 자유계약 선수 영입 및 타 구단과의 트레이드가 가열되며, 스프링 개막을 겨냥한 1차 팀 조직력 점검 스크림을 시작합니다.",
        eventIcon: "⚡",
        divisionTier,
      });
      continue;
    }

    if (week === 4) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "EVENT",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "로스터 최종 제출 & 개막 미디어 데이",
        eventDescription:
          "스프링 정규시즌에 출전할 5인 주전 및 식스맨 최종 로스터를 리그 사무국에 제출하고, 공식 개막 미디어 인터뷰를 진행합니다.",
        eventIcon: "🎙️",
        divisionTier,
      });
      continue;
    }

    // ==============================================================
    // 2. 2~5월 (5~20주차) : 스프링 시즌 (SPRING_SEASON)
    // ==============================================================
    // (1) 스프링 정규시즌 1라운드 (5~9주차)
    if (week >= 5 && week <= 9) {
      const roundIndex = (week - 5) % numRounds;
      const roundMatches = roundRobinRounds[roundIndex] || [];
      addMatchesForRound(
        schedule,
        roundMatches,
        week,
        month,
        monthWeek,
        phase,
        "REGULAR",
        "Bo3",
        playerTeamId,
        divisionTier,
        currentWeek,
        false // normal home/away
      );
      continue;
    }

    // (2) 스프링 전반 결산 및 휴식 (10주차)
    if (week === 10) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "REST",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "스프링 전반 결산 & 전술 정비",
        eventDescription:
          "스프링 1라운드가 마무리되었습니다. 2라운드 반격을 위해 전 선수단 체력을 회복하고 메타 챔피언 티어 리스트를 재정비합니다.",
        eventIcon: "🛠️",
        divisionTier,
      });
      continue;
    }

    // (3) 스프링 정규시즌 2라운드 (11~15주차, 홈/원정 반전)
    if (week >= 11 && week <= 15) {
      const roundIndex = (week - 11) % numRounds;
      const roundMatches = roundRobinRounds[roundIndex] || [];
      addMatchesForRound(
        schedule,
        roundMatches,
        week,
        month,
        monthWeek,
        phase,
        "REGULAR",
        "Bo3",
        playerTeamId,
        divisionTier,
        currentWeek,
        true // invert home/away
      );
      continue;
    }

    // (4) 스프링 플레이오프 및 결승전 (16~20주차)
    if (week === 16) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PLAYOFF",
        homeTeamId: playerTeamId,
        awayTeamId: divisionTeams[1]?.teamId || "OPP_01",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "스프링 플레이오프 1라운드",
        eventDescription:
          "디비전 상위권 진출팀들이 격돌하는 스프링 플레이오프 1차전! Bo5 다전제 승부로 준결승 진출팀을 가립니다.",
        eventIcon: "⚔️",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[1]?.teamId || "OPP_01"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 3, awayScore: 1, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    if (week === 17) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PLAYOFF",
        homeTeamId: divisionTeams[2]?.teamId || "OPP_02",
        awayTeamId: playerTeamId,
        isPlayerMatch: true,
        isHome: false,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "스프링 플레이오프 준결승전",
        eventDescription:
          "스프링 결승 진출권을 향한 Bo5 진검승부! 상대의 핵심 챔피언 조합을 파쇄해야 결승에 오를 수 있습니다.",
        eventIcon: "🔥",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[2]?.teamId || "OPP_02"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 2, awayScore: 3, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    if (week === 18) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PLAYOFF",
        homeTeamId: playerTeamId,
        awayTeamId: divisionTeams[3]?.teamId || "OPP_03",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "스프링 최종 결승 진출전",
        eventDescription:
          "패자조를 뚫고 올라온 강호와의 단두대 매치. 승자는 대망의 스프링 그랜드 파이널로 직행합니다.",
        eventIcon: "⚔️",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[3]?.teamId || "OPP_03"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 3, awayScore: 0, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    if (week === 19) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PLAYOFF",
        homeTeamId: playerTeamId,
        awayTeamId: divisionTeams[0]?.teamId || "OPP_00",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "🌸 스프링 대망의 결승전 (Grand Finals)",
        eventDescription:
          "2027 스프링 스플릿 챔피언 트로피를 두고 펼치는 최후의 혈전! 팬들의 열광 속에 영광의 우승팀이 탄생합니다.",
        eventIcon: "🏆",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[0]?.teamId || "OPP_00"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 3, awayScore: 2, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    if (week === 20) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "REST",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "스프링 시즌 정비 & 공식 휴가",
        eventDescription:
          "치열했던 16주간의 스프링 대장정을 마치고 선수단 특별 휴식과 웰니스 센터 피로 회복 케어가 진행됩니다.",
        eventIcon: "🏖️",
        divisionTier,
      });
      continue;
    }

    // ==============================================================
    // 3. 6월 (21~24주차) : MSI 국제대회 (MSI_INTERNATIONAL)
    // ==============================================================
    if (week === 21) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "MSI 조별 풀리그 & 체력 재정비",
        eventDescription:
          "1부 최상위 팀들의 미드 시즌 인비테이셔널 개막! 우리 팀은 체력 회복과 함께 글로벌 메타 트렌드를 분석합니다.",
        eventIcon: "🏆",
        divisionTier,
      });
      continue;
    }

    if (week === 22) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "MSI 브래킷 & 서머 대비 부트캠프",
        eventDescription:
          "해외 정상급 팀들의 토너먼트 격돌을 벤치마킹하며, 서머 시즌 1부 승격을 목표로 한 여름 특훈 캠프를 실시합니다.",
        eventIcon: "🏕️",
        divisionTier,
      });
      continue;
    }

    if (week === 23) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "MSI 4강 준결승 & 신규 메타 전술 연구",
        eventDescription:
          "세계 최고의 전술을 가진 4강 진출팀들의 밴픽을 연구하고, 선수들의 챔피언 폭 확장 집중 훈련을 진행합니다.",
        eventIcon: "⚡",
        divisionTier,
      });
      continue;
    }

    if (week === 24) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "MSI 대망의 결승전 & 서머 로스터 확정",
        eventDescription:
          "상반기 세계 최강 클럽이 결정되는 MSI 결승전 주간입니다. 서머 시즌에 나설 최정예 라인업을 최종 점검합니다.",
        eventIcon: "🎖️",
        divisionTier,
      });
      continue;
    }

    // ==============================================================
    // 4. 7~10월 (25~40주차) : 서머 시즌 (SUMMER_SEASON)
    // ==============================================================
    // (1) 서머 정규시즌 1라운드 (25~29주차, 스프링 1라운드와 반대 홈/어웨이)
    if (week >= 25 && week <= 29) {
      const roundIndex = (week - 25) % numRounds;
      const roundMatches = roundRobinRounds[roundIndex] || [];
      addMatchesForRound(
        schedule,
        roundMatches,
        week,
        month,
        monthWeek,
        phase,
        "REGULAR",
        "Bo3",
        playerTeamId,
        divisionTier,
        currentWeek,
        true // invert home/away relative to spring round 1
      );
      continue;
    }

    // (2) 서머 전반 결산 및 휴식 (30주차)
    if (week === 30) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "REST",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "서머 전반 결산 & 하반기 총력전 준비",
        eventDescription:
          "서머 1라운드 종료. 승강전과 플레이오프 진출을 앞둔 마지막 고비를 넘기기 위해 체력과 멘탈을 가다듬습니다.",
        eventIcon: "🛠️",
        divisionTier,
      });
      continue;
    }

    // (3) 서머 정규시즌 2라운드 (31~35주차, 홈/어웨이 정상)
    if (week >= 31 && week <= 35) {
      const roundIndex = (week - 31) % numRounds;
      const roundMatches = roundRobinRounds[roundIndex] || [];
      addMatchesForRound(
        schedule,
        roundMatches,
        week,
        month,
        monthWeek,
        phase,
        "REGULAR",
        "Bo3",
        playerTeamId,
        divisionTier,
        currentWeek,
        false
      );
      continue;
    }

    // (4) 서머 플레이오프 (36~38주차)
    if (week === 36) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PLAYOFF",
        homeTeamId: playerTeamId,
        awayTeamId: divisionTeams[2]?.teamId || "OPP_02",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "서머 플레이오프 1라운드",
        eventDescription:
          "월즈 직행과 승강전 시드가 걸린 서머 플레이오프 첫 관문! Bo5의 진검승부가 시작됩니다.",
        eventIcon: "⚔️",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[2]?.teamId || "OPP_02"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 3, awayScore: 1, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    if (week === 37) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PLAYOFF",
        homeTeamId: divisionTeams[1]?.teamId || "OPP_01",
        awayTeamId: playerTeamId,
        isPlayerMatch: true,
        isHome: false,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "서머 플레이오프 준결승전",
        eventDescription:
          "서머 결승 무대를 밟을 주인공을 가리는 4강전! 단 한 번의 승부로 모든 희비가 엇갈립니다.",
        eventIcon: "🔥",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[1]?.teamId || "OPP_01"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 1, awayScore: 3, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    if (week === 38) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PLAYOFF",
        homeTeamId: playerTeamId,
        awayTeamId: divisionTeams[0]?.teamId || "OPP_00",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "☀️ 서머 대망의 결승전 (Grand Finals)",
        eventDescription:
          "한 해의 최강자를 가리는 서머 그랜드 파이널! 소환사의 자존심을 걸고 왕좌에 도전합니다.",
        eventIcon: "🏆",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[0]?.teamId || "OPP_00"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 3, awayScore: 2, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    // (5) 승강전 (39~40주차)
    if (week === 39) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PROMOTION",
        homeTeamId: playerTeamId,
        awayTeamId: divisionTeams[3]?.teamId || "OPP_03",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "⚔️ 승강 플레이오프 1차전 (승격 도전전)",
        eventDescription:
          "차기 시즌 상위 디비전 진출을 위한 단두대 매치! 패배하면 1년을 더 기다려야 합니다.",
        eventIcon: "🚀",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[3]?.teamId || "OPP_03"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 3, awayScore: 0, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    if (week === 40) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "PROMOTION",
        homeTeamId: divisionTeams[4]?.teamId || "OPP_04",
        awayTeamId: playerTeamId,
        isPlayerMatch: true,
        isHome: false,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "⚔️ 승강 결정전 최종전 (차기 시즌 승격 확정)",
        eventDescription:
          "모든 것이 걸린 마지막 승강 결정전! 승리 시 상위 리그로의 위대한 승격을 달성합니다.",
        eventIcon: "👑",
        cautionChampions: getCautionChampionsForTeam(divisionTeams[4]?.teamId || "OPP_04"),
        divisionTier,
        result:
          week < currentWeek
            ? { homeScore: 1, awayScore: 3, winnerId: playerTeamId }
            : undefined,
      });
      continue;
    }

    // ==============================================================
    // 5. 11~12월 (41~48주차) : 월드 챔피언십 (WORLDS_INTERNATIONAL)
    // ==============================================================
    if (week === 41) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "월드 챔피언십 플레이-인 스테이지",
        eventDescription:
          "전 세계 마이너 리그 및 와일드카드 대표팀들의 본선 16강 진출 토너먼트가 개막합니다.",
        eventIcon: "🌍",
        divisionTier,
      });
      continue;
    }

    if (week === 42) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "월드 챔피언십 스위스 스테이지 (16강)",
        eventDescription:
          "세계 최정상 16개 명문 구단이 격돌하는 스위스 스테이지 1차 풀리그가 펼쳐집니다.",
        eventIcon: "🌐",
        divisionTier,
      });
      continue;
    }

    if (week === 43) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "월드 챔피언십 8강 진출 결정전",
        eventDescription:
          "녹아웃 토너먼트에 합류할 최종 8강 진출팀들이 피 튀기는 단판 승부로 결정됩니다.",
        eventIcon: "⚡",
        divisionTier,
      });
      continue;
    }

    if (week === 44) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "월드 챔피언십 8강 쿼터파이널",
        eventDescription:
          "단 하나의 실수도 용납되지 않는 8강 Bo5 토너먼트! 세계 4강에 들기 위한 격전입니다.",
        eventIcon: "⚔️",
        divisionTier,
      });
      continue;
    }

    if (week === 45) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "월드 챔피언십 4강 세미파이널",
        eventDescription:
          "전 세계 팬들의 이목이 집중된 월즈 준결승전! 결승에 오를 두 팀이 가려집니다.",
        eventIcon: "🔥",
        divisionTier,
      });
      continue;
    }

    if (week === 46) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "INTERNATIONAL",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo5",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "🌍 월드 챔피언십 대망의 결승전 (Grand Finals)",
        eventDescription:
          "소환사의 컵을 들어 올릴 2027 시즌 세계 최강의 팀이 탄생하는 영광의 무대입니다.",
        eventIcon: "👑",
        divisionTier,
      });
      continue;
    }

    if (week === 47) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "REST",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "시즌 공식 종료 & 선수단 장기 휴가",
        eventDescription:
          "1년 48주의 모든 대회가 공식적으로 마무리되고 선수단과 코칭스태프 전원 장기 휴가에 들어갑니다.",
        eventIcon: "🏖️",
        divisionTier,
      });
      continue;
    }

    if (week === 48) {
      schedule.push({
        id: `week_${week}_event`,
        week,
        month,
        monthWeek,
        phase,
        matchType: "EVENT",
        homeTeamId: playerTeamId,
        awayTeamId: "",
        isPlayerMatch: true,
        isHome: true,
        format: "Bo3",
        status: week < currentWeek ? "COMPLETED" : "SCHEDULED",
        eventName: "연간 구단 총결산 & 차기 시즌 로드맵",
        eventDescription:
          "한 해의 재정 수입과 경기 성적을 총결산하고, 차기 시즌 상위 리그 승격을 위한 스토브리그 전략을 수립합니다.",
        eventIcon: "📊",
        divisionTier,
      });
      continue;
    }
  }

  return schedule;
}

/**
 * 정규 시즌 라운드에 속한 매치들을 일정에 추가
 */
function addMatchesForRound(
  schedule: MatchSchedule[],
  roundMatches: Array<[string, string]>,
  week: number,
  month: number,
  monthWeek: number,
  phase: SeasonPhase,
  matchType: "REGULAR",
  format: "Bo3",
  playerTeamId: string,
  divisionTier: DivisionTier,
  currentWeek: number,
  invertHomeAway: boolean
) {
  let matchIndex = 0;
  for (const [teamA, teamB] of roundMatches) {
    matchIndex++;
    const home = invertHomeAway ? teamB : teamA;
    const away = invertHomeAway ? teamA : teamB;

    const isPlayerMatch = home === playerTeamId || away === playerTeamId;
    const isHome = home === playerTeamId;
    const opponentTeamId = isHome ? away : home;

    const isPast = week < currentWeek;

    // 경기 결과 생성 (과거 경기일 경우 실감나는 스코어 부여)
    let result = undefined;
    if (isPast) {
      // 주차와 매치 인덱스를 기반으로 재현 가능한 승패 산출
      const seed = week * 17 + matchIndex * 31;
      const playerWon = (seed % 10) >= 3; // 플레이어 승률 약 70%
      const isClose = (seed % 3) === 0;

      if (isPlayerMatch) {
        if (playerWon) {
          result = isHome
            ? { homeScore: 2, awayScore: isClose ? 1 : 0, winnerId: home }
            : { homeScore: isClose ? 1 : 0, awayScore: 2, winnerId: away };
        } else {
          result = isHome
            ? { homeScore: isClose ? 1 : 0, awayScore: 2, winnerId: away }
            : { homeScore: 2, awayScore: isClose ? 1 : 0, winnerId: home };
        }
      } else {
        const homeWon = (seed % 2) === 0;
        result = homeWon
          ? { homeScore: 2, awayScore: isClose ? 1 : 0, winnerId: home }
          : { homeScore: isClose ? 1 : 0, awayScore: 2, winnerId: away };
      }
    }

    schedule.push({
      id: `week_${week}_match_${matchIndex}`,
      week,
      month,
      monthWeek,
      phase,
      matchType,
      homeTeamId: home,
      awayTeamId: away,
      isPlayerMatch,
      isHome,
      format,
      status: isPast ? "COMPLETED" : "SCHEDULED",
      result,
      cautionChampions: isPlayerMatch ? getCautionChampionsForTeam(opponentTeamId) : undefined,
      divisionTier,
    });
  }
}
