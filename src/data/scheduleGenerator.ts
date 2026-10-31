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

  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    hash = (hash << 5) - hash + teamId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const selectedIds: string[] = [];
  const usedPositions = new Set<string>();

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
 * 48주 연간 전체 리그 캘린더 및 대진표를 생성 (주당 0~2경기)
 */
export function generateAnnualSeasonSchedule(
  divisionTeams: TeamStanding[],
  playerTeamId: string,
  divisionTier: DivisionTier = "D",
  currentWeek: number = 1
): MatchSchedule[] {
  const schedule: MatchSchedule[] = [];
  const opponents = divisionTeams.filter((t) => t.teamId !== playerTeamId);

  // 상대팀 안전 참조 유틸 (최소 1팀 이상 보장)
  const getOpp = (idx: number) => {
    if (opponents.length === 0) {
      return { teamId: `OPP_${idx}`, teamName: `상대팀 ${idx + 1}` };
    }
    return opponents[idx % opponents.length];
  };

  for (let week = 1; week <= 48; week++) {
    const { month, monthWeek } = getWeekMonthInfo(week);
    const phase = getSeasonPhase(week);

    // ==============================================================
    // 1. 1월 (1~4주차) : 스토브리그 (STOVE_LEAGUE)
    // ==============================================================
    if (week === 1) {
      // 0경기: 이적 시장 오픈 & 연간 시상식
      continue;
    }
    if (week === 2) {
      // 0경기: 스폰서 협상 & 재계약
      continue;
    }
    if (week === 3) {
      // 1경기: 프리시즌 1차 연습 스크림
      addPlayerMatch(
        schedule,
        week,
        month,
        monthWeek,
        phase,
        0,
        "SCRIM",
        "Bo3",
        playerTeamId,
        getOpp(0).teamId,
        true, // 홈
        currentWeek,
        divisionTier,
        "프리시즌 1차 스크림"
      );
      continue;
    }
    if (week === 4) {
      // 1경기: 프리시즌 2차 연습 스크림
      addPlayerMatch(
        schedule,
        week,
        month,
        monthWeek,
        phase,
        0,
        "SCRIM",
        "Bo3",
        playerTeamId,
        getOpp(1).teamId,
        false, // 원정
        currentWeek,
        divisionTier,
        "프리시즌 2차 스크림"
      );
      continue;
    }

    // ==============================================================
    // 2. 2~5월 (5~20주차) : 스프링 시즌 (SPRING_SEASON)
    // ==============================================================
    // 정규시즌 (5~15주차)
    if (week === 5) {
      // 2경기: 스프링 개막 슈퍼위크 (1차전, 2차전)
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(0).teamId, true, currentWeek, divisionTier);
      addPlayerMatch(schedule, week, month, monthWeek, phase, 1, "REGULAR", "Bo3", playerTeamId, getOpp(1).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 6) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(2).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 7) {
      // 2경기 (1차전, 2차전)
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(3).teamId, false, currentWeek, divisionTier);
      addPlayerMatch(schedule, week, month, monthWeek, phase, 1, "REGULAR", "Bo3", playerTeamId, getOpp(4).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 8) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(0).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 9) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(1).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 10) {
      // 0경기: 스프링 전반 결산 및 휴식
      continue;
    }
    if (week === 11) {
      // 2경기: 후반기 개막 (1차전, 2차전)
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(2).teamId, false, currentWeek, divisionTier);
      addPlayerMatch(schedule, week, month, monthWeek, phase, 1, "REGULAR", "Bo3", playerTeamId, getOpp(3).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 12) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(4).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 13) {
      // 2경기: 승점 쟁탈전 (1차전, 2차전)
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(0).teamId, true, currentWeek, divisionTier);
      addPlayerMatch(schedule, week, month, monthWeek, phase, 1, "REGULAR", "Bo3", playerTeamId, getOpp(1).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 14) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(2).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 15) {
      // 1경기: 정규시즌 최종전
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(3).teamId, false, currentWeek, divisionTier);
      continue;
    }

    // 스프링 플레이오프 및 결승전 (16~20주차)
    if (week === 16) {
      // 1경기: 스프링 플레이오프 1라운드
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PLAYOFF", "Bo5", playerTeamId, getOpp(1).teamId, true, currentWeek, divisionTier, "스프링 PO 1라운드");
      continue;
    }
    if (week === 17) {
      // 1경기: 스프링 플레이오프 준결승
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PLAYOFF", "Bo5", playerTeamId, getOpp(2).teamId, false, currentWeek, divisionTier, "스프링 PO 준결승");
      continue;
    }
    if (week === 18) {
      // 1경기: 스프링 결승 진출전
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PLAYOFF", "Bo5", playerTeamId, getOpp(3).teamId, true, currentWeek, divisionTier, "스프링 결승 진출전");
      continue;
    }
    if (week === 19) {
      // 1경기: 스프링 결승전
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PLAYOFF", "Bo5", playerTeamId, getOpp(0).teamId, true, currentWeek, divisionTier, "스프링 그랜드 파이널");
      continue;
    }
    if (week === 20) {
      // 0경기: 스프링 폐막 & 공식 휴가
      continue;
    }

    // ==============================================================
    // 3. 6월 (21~24주차) : 상반기 국제대회 (MSI_INTERNATIONAL)
    // ==============================================================
    if (week === 21) {
      // 1경기: MSI 개막 기념 교류전 스크림
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "SCRIM", "Bo3", playerTeamId, getOpp(1).teamId, true, currentWeek, divisionTier, "서머 대비 교류 스크림");
      continue;
    }
    if (week === 22) {
      // 0경기: 부트캠프 집중 훈련
      continue;
    }
    if (week === 23) {
      // 1경기: 전술 점검 2차 스크림
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "SCRIM", "Bo3", playerTeamId, getOpp(2).teamId, false, currentWeek, divisionTier, "메타 전술 점검 스크림");
      continue;
    }
    if (week === 24) {
      // 0경기: MSI 폐막 & 서머 준비
      continue;
    }

    // ==============================================================
    // 4. 7~10월 (25~40주차) : 서머 시즌 (SUMMER_SEASON)
    // ==============================================================
    // 정규시즌 (25~35주차)
    if (week === 25) {
      // 2경기: 서머 개막 슈퍼위크 (1차전, 2차전)
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(4).teamId, false, currentWeek, divisionTier);
      addPlayerMatch(schedule, week, month, monthWeek, phase, 1, "REGULAR", "Bo3", playerTeamId, getOpp(3).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 26) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(2).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 27) {
      // 2경기 (1차전, 2차전)
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(1).teamId, true, currentWeek, divisionTier);
      addPlayerMatch(schedule, week, month, monthWeek, phase, 1, "REGULAR", "Bo3", playerTeamId, getOpp(0).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 28) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(4).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 29) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(3).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 30) {
      // 0경기: 서머 전반 결산 및 휴식
      continue;
    }
    if (week === 31) {
      // 2경기: 후반기 스퍼트 (1차전, 2차전)
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(2).teamId, true, currentWeek, divisionTier);
      addPlayerMatch(schedule, week, month, monthWeek, phase, 1, "REGULAR", "Bo3", playerTeamId, getOpp(1).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 32) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(0).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 33) {
      // 2경기 (1차전, 2차전)
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(4).teamId, false, currentWeek, divisionTier);
      addPlayerMatch(schedule, week, month, monthWeek, phase, 1, "REGULAR", "Bo3", playerTeamId, getOpp(3).teamId, true, currentWeek, divisionTier);
      continue;
    }
    if (week === 34) {
      // 1경기
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(2).teamId, false, currentWeek, divisionTier);
      continue;
    }
    if (week === 35) {
      // 1경기: 서머 정규 최종전
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "REGULAR", "Bo3", playerTeamId, getOpp(1).teamId, true, currentWeek, divisionTier);
      continue;
    }

    // 서머 플레이오프 & 결승 & 승강전 (36~40주차)
    if (week === 36) {
      // 1경기: 서머 플레이오프 1라운드
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PLAYOFF", "Bo5", playerTeamId, getOpp(2).teamId, true, currentWeek, divisionTier, "서머 PO 1라운드");
      continue;
    }
    if (week === 37) {
      // 1경기: 서머 플레이오프 준결승
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PLAYOFF", "Bo5", playerTeamId, getOpp(1).teamId, false, currentWeek, divisionTier, "서머 PO 준결승");
      continue;
    }
    if (week === 38) {
      // 1경기: 서머 결승전
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PLAYOFF", "Bo5", playerTeamId, getOpp(0).teamId, true, currentWeek, divisionTier, "서머 그랜드 파이널");
      continue;
    }
    if (week === 39) {
      // 1경기: 승강전 1차전
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PROMOTION", "Bo5", playerTeamId, getOpp(3).teamId, true, currentWeek, divisionTier, "승격 플레이오프 1차전");
      continue;
    }
    if (week === 40) {
      // 1경기: 승강 결정전 최종전
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "PROMOTION", "Bo5", playerTeamId, getOpp(4).teamId, false, currentWeek, divisionTier, "승강 결정 최종전");
      continue;
    }

    // ==============================================================
    // 5. 11~12월 (41~48주차) : 하반기 국제대회 (WORLDS_INTERNATIONAL)
    // ==============================================================
    if (week === 41) {
      // 0경기: 월즈 개막
      continue;
    }
    if (week === 42) {
      // 0경기: 스위스 스테이지
      continue;
    }
    if (week === 43) {
      // 1경기: 차기 시즌 대비 특별 평가전
      addPlayerMatch(schedule, week, month, monthWeek, phase, 0, "SCRIM", "Bo3", playerTeamId, getOpp(0).teamId, true, currentWeek, divisionTier, "차기 시즌 대비 평가전");
      continue;
    }
    if (week === 44 || week === 45 || week === 46) {
      // 0경기: 월즈 토너먼트 관전 및 전력 분석
      continue;
    }
    if (week === 47) {
      // 0경기: 시즌 공식 휴가
      continue;
    }
    if (week === 48) {
      // 0경기: 연간 구단 총결산 & 월즈 폐막
      continue;
    }
  }

  return schedule;
}

/**
 * 플레이어 매치 및 결과 생성 헬퍼
 */
function addPlayerMatch(
  schedule: MatchSchedule[],
  week: number,
  month: number,
  monthWeek: number,
  phase: SeasonPhase,
  matchIndexInWeek: number,
  matchType: "REGULAR" | "PLAYOFF" | "PROMOTION" | "INTERNATIONAL" | "SCRIM",
  format: "Bo3" | "Bo5",
  playerTeamId: string,
  opponentTeamId: string,
  isHome: boolean,
  currentWeek: number,
  divisionTier: DivisionTier,
  eventName?: string
) {
  const homeTeamId = isHome ? playerTeamId : opponentTeamId;
  const awayTeamId = isHome ? opponentTeamId : playerTeamId;
  const isPast = week < currentWeek;

  let result = undefined;
  if (isPast) {
    const seed = week * 23 + matchIndexInWeek * 37;
    const playerWon = (seed % 10) >= 3;
    const isClose = (seed % 3) === 0;

    if (format === "Bo5") {
      if (playerWon) {
        result = isHome
          ? { homeScore: 3, awayScore: isClose ? 2 : 1, winnerId: homeTeamId }
          : { homeScore: isClose ? 2 : 1, awayScore: 3, winnerId: awayTeamId };
      } else {
        result = isHome
          ? { homeScore: isClose ? 2 : 1, awayScore: 3, winnerId: awayTeamId }
          : { homeScore: 3, awayScore: isClose ? 2 : 1, winnerId: homeTeamId };
      }
    } else {
      if (playerWon) {
        result = isHome
          ? { homeScore: 2, awayScore: isClose ? 1 : 0, winnerId: homeTeamId }
          : { homeScore: isClose ? 1 : 0, awayScore: 2, winnerId: awayTeamId };
      } else {
        result = isHome
          ? { homeScore: isClose ? 1 : 0, awayScore: 2, winnerId: awayTeamId }
          : { homeScore: 2, awayScore: isClose ? 1 : 0, winnerId: homeTeamId };
      }
    }
  }

  schedule.push({
    id: `week_${week}_match_${matchIndexInWeek + 1}`,
    week,
    month,
    monthWeek,
    phase,
    matchType,
    matchIndexInWeek,
    homeTeamId,
    awayTeamId,
    isPlayerMatch: true,
    isHome,
    format,
    status: isPast ? "COMPLETED" : "SCHEDULED",
    result,
    eventName,
    cautionChampions: getCautionChampionsForTeam(opponentTeamId),
    divisionTier,
  });
}
