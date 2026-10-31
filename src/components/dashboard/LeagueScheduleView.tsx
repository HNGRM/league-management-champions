"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGameStore } from "@/store/useGameStore";
import {
  MatchSchedule,
  SeasonPhase,
  SEASON_PHASE_METAS,
  getSeasonPhaseForMonth,
  getWeekMonthInfo,
} from "@/types/schedule";
import { generateAnnualSeasonSchedule } from "@/data/scheduleGenerator";
import { FACILITIES } from "@/types/facility";
import { getTeamLogo } from "@/data/teamLogos";
import ScheduleMatchDetailPanel from "./ScheduleMatchDetailPanel";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Navigation,
  Shield,
  Clock,
  CheckCircle2,
  Trophy,
  Users,
  Eye,
  Filter,
} from "lucide-react";

export default function LeagueScheduleView() {
  const currentYear = useGameStore((state) => state.currentYear);
  const currentWeek = useGameStore((state) => state.currentWeek);
  const currentTeam = useGameStore((state) => state.currentTeam);
  const selectedTeam = useGameStore((state) => state.selectedTeam);
  const customTeamInfo = useGameStore((state) => state.customTeamInfo);
  const leagueDivisions = useGameStore((state) => state.leagueDivisions);
  const currentDivision = useGameStore((state) => state.currentDivision || "D");
  const facilities = useGameStore((state) => state.facilities);
  const myPlayers = useGameStore((state) => state.myPlayers);
  const seasonSchedule = useGameStore((state) => state.seasonSchedule);
  const setSeasonSchedule = useGameStore((state) => state.setSeasonSchedule);

  // 연도 표시 (생성 연도 2026의 다음 해 2027 정립)
  const displayYear =
    currentYear < 100
      ? (currentTeam?.foundedYear || 2026) + currentYear
      : currentYear === 2026
      ? 2027
      : currentYear;

  // 현재 진행 중인 주차의 월 (1~12)
  const currentMonthInfo = useMemo(() => getWeekMonthInfo(currentWeek), [currentWeek]);

  // 선택된 열람 월 (1~12, 기본값: 현재 주차의 월)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthInfo.month);

  // 선택된 상세 주차 (1~48, 기본값: 현재 주차)
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);

  // 필터 모드: "MY_TEAM" (우리 팀 경기만) vs "ALL" (리그 전체 경기)
  const [filterMode, setFilterMode] = useState<"MY_TEAM" | "ALL">("MY_TEAM");

  // 플레이어 팀 식별 정보
  const playerTeamId = currentTeam?.id || selectedTeam?.id || "my_team";
  const playerTeamName =
    customTeamInfo.nameKo || currentTeam?.name || selectedTeam?.nameKo || "우리 팀";
  const playerTeamShort =
    customTeamInfo.shortName || currentTeam?.shortName || selectedTeam?.shortName || "MY";
  const playerTeamLogo =
    customTeamInfo.customLogoUrl ||
    (currentTeam
      ? getTeamLogo(currentTeam.id)
      : selectedTeam
      ? getTeamLogo(selectedTeam.id)
      : null);

  // 현재 디비전 팀 목록
  const divisionTeams = useMemo(() => {
    return leagueDivisions?.[currentDivision] || [];
  }, [leagueDivisions, currentDivision]);

  // 스케줄 생성 및 동기화 (기존 스케줄이 없으면 즉시 생성)
  useEffect(() => {
    if (!seasonSchedule || seasonSchedule.length === 0) {
      const generated = generateAnnualSeasonSchedule(
        divisionTeams,
        playerTeamId,
        currentDivision,
        currentWeek
      );
      setSeasonSchedule(generated);
    }
  }, [
    seasonSchedule,
    divisionTeams,
    playerTeamId,
    currentDivision,
    currentWeek,
    setSeasonSchedule,
  ]);

  const activeSchedule = seasonSchedule || [];

  // 현재 선택된 월의 시즌 페이즈 메타
  const currentMonthPhase = getSeasonPhaseForMonth(selectedMonth);
  const phaseMeta = SEASON_PHASE_METAS[currentMonthPhase];

  // 월 이동 핸들러 (1~12월 원형 순환)
  const handlePrevMonth = () => {
    const prev = selectedMonth === 1 ? 12 : selectedMonth - 1;
    setSelectedMonth(prev);
    setSelectedWeek((prev - 1) * 4 + 1);
  };

  const handleNextMonth = () => {
    const next = selectedMonth === 12 ? 1 : selectedMonth + 1;
    setSelectedMonth(next);
    setSelectedWeek((next - 1) * 4 + 1);
  };

  // [오늘(현재 진행 주차)로 이동] 핸들러
  const handleJumpToToday = () => {
    const curMonth = getWeekMonthInfo(currentWeek).month;
    setSelectedMonth(curMonth);
    setSelectedWeek(currentWeek);
  };

  // 선택된 월의 4개 주차 (startWeek ~ endWeek)
  const monthWeeks = useMemo(() => {
    const startWeek = (selectedMonth - 1) * 4 + 1;
    return [startWeek, startWeek + 1, startWeek + 2, startWeek + 3];
  }, [selectedMonth]);

  // 선택된 주차의 모든 매치 및 플레이어 매치
  const selectedWeekMatches = useMemo(() => {
    return activeSchedule.filter((m) => m.week === selectedWeek);
  }, [activeSchedule, selectedWeek]);

  const selectedPlayerMatch = useMemo(() => {
    return selectedWeekMatches.find((m) => m.isPlayerMatch);
  }, [selectedWeekMatches]);

  // 홈 경기장 시설 스펙
  const arenaLevel = facilities?.arena ?? 1;
  const arenaDef = FACILITIES.find((f) => f.id === "arena");
  const arenaName = arenaDef?.levels[arenaLevel]?.name || "소형 아레나";

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto pb-8">
      {/* ================= 1. 상단 월 네비게이터 & 필터 바 ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* 좌측: 월 컨트롤 ([ < ] 2027년 X월 [ > ] & [📍 오늘로 이동]) */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="이전달 이동"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 flex items-center gap-1.5 min-w-[120px] justify-center text-center">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-sm font-black text-white tracking-tight">
                {displayYear}년 {selectedMonth}월
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="다음달 이동"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleJumpToToday}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>오늘로 이동</span>
          </button>
        </div>

        {/* 중앙: 시즌 페이즈 뱃지 */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-md ${phaseMeta.badgeClass}`}
          >
            <span className="text-sm">{phaseMeta.icon}</span>
            <span className="font-mono tracking-tight font-black">{phaseMeta.nameKr}</span>
            <span className="text-[10px] opacity-75 font-mono hidden sm:inline">
              ({phaseMeta.weeksSpan})
            </span>
          </div>
        </div>

        {/* 우측: 필터 토글 ([ 우리 팀 경기만 ] / [ 리그 전체 경기 ]) */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 w-full md:w-auto justify-center">
          <button
            type="button"
            onClick={() => setFilterMode("MY_TEAM")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filterMode === "MY_TEAM"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>우리 팀 경기만</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              filterMode === "ALL"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>리그 전체 경기</span>
          </button>
        </div>
      </div>

      {/* ================= 2. 월간 4주 캘린더 그리드 (4 Cards) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {monthWeeks.map((week) => {
          const { monthWeek } = getWeekMonthInfo(week);
          const isCurrentPlayWeek = week === currentWeek;
          const isSelected = week === selectedWeek;

          // 해당 주차의 매치들
          const weekAllMatches = activeSchedule.filter((m) => m.week === week);
          const pMatch = weekAllMatches.find((m) => m.isPlayerMatch);

          // 매치 유형 확인
          const isMatchWeek =
            pMatch &&
            (pMatch.matchType === "REGULAR" ||
              pMatch.matchType === "PLAYOFF" ||
              pMatch.matchType === "PROMOTION");

          // 상대 팀 정보
          let opponentTeam: { name: string; logoUrl: string | null } | null = null;
          if (isMatchWeek) {
            const oppId = pMatch.isHome ? pMatch.awayTeamId : pMatch.homeTeamId;
            const oppStanding = divisionTeams.find((t) => t.teamId === oppId);
            opponentTeam = {
              name: oppStanding?.teamName || "상대팀",
              logoUrl: oppStanding?.logoUrl || null,
            };
          }

          // 경기 결과 산출
          const isCompleted = pMatch?.status === "COMPLETED" && pMatch.result;
          let isPlayerWin = false;
          if (isCompleted && pMatch.result) {
            const res = pMatch.result;
            isPlayerWin = pMatch.isHome
              ? res.homeScore > res.awayScore
              : res.awayScore > res.homeScore;
          }

          return (
            <button
              key={week}
              type="button"
              onClick={() => setSelectedWeek(week)}
              className={`rounded-2xl p-4 flex flex-col justify-between text-left transition-all duration-200 cursor-pointer relative overflow-hidden group min-h-[160px] border ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  : isCurrentPlayWeek
                  ? "bg-slate-900/90 border-cyan-500/60 ring-1 ring-cyan-500/30 hover:border-cyan-400 shadow-md"
                  : "bg-slate-900/60 border-slate-800/90 hover:bg-slate-800/60 hover:border-slate-700 shadow-sm"
              }`}
            >
              {/* 상단 헤더: 주차 명칭 및 NOW 배지 */}
              <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">
                    {selectedMonth}월 {monthWeek}주차
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (W{week})
                  </span>
                </div>

                {isCurrentPlayWeek && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] flex items-center gap-1 shadow-sm animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    NOW 현재
                  </span>
                )}
              </div>

              {/* 본문 블록: 정규 경기 vs 이벤트 주간 */}
              <div className="py-2.5 flex-1 flex flex-col justify-center">
                {isMatchWeek && opponentTeam ? (
                  <div className="flex flex-col gap-2">
                    {/* 상대 팀 로고 + 팀명 */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-700/80 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                        {opponentTeam.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={opponentTeam.logoUrl}
                            alt={opponentTeam.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-400 font-mono block leading-none">
                          VS
                        </span>
                        <span className="text-xs font-bold text-slate-100 truncate block">
                          {opponentTeam.name}
                        </span>
                      </div>
                    </div>

                    {/* 배지 행: 장소(홈/원정) & 포맷 */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                          pMatch.isHome
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                        }`}
                      >
                        {pMatch.isHome ? "홈경기" : "원정"}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {pMatch.format}
                      </span>
                      {filterMode === "ALL" && weekAllMatches.length > 1 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30">
                          리그 {weekAllMatches.length}경기
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 비경기 / 공식 이벤트 주간 */
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950/70 border border-slate-800 shrink-0">
                      {pMatch?.eventIcon || "❄️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug">
                        {pMatch?.eventName || "공식 이벤트 주간"}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        비경기 주간
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 상태 바: 스코어(승패) or 예정/D-Day */}
              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
                {isCompleted && pMatch.result ? (
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${
                        isPlayerWin
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      }`}
                    >
                      {pMatch.result.homeScore} : {pMatch.result.awayScore}{" "}
                      {isPlayerWin ? "승" : "패"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">경기 종료</span>
                  </div>
                ) : isCurrentPlayWeek ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono">
                      오늘 (D-Day)
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">진행 중</span>
                  </div>
                ) : week > currentWeek ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px] font-mono">
                      예정 (D-{(week - currentWeek) * 7})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">예정됨</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] text-slate-400 font-mono">완료</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ================= 3. 선택 주차 상세 프리뷰 패널 ================= */}
      <ScheduleMatchDetailPanel
        selectedWeek={selectedWeek}
        weekMatches={selectedWeekMatches}
        playerMatch={selectedPlayerMatch}
        playerTeam={{
          id: playerTeamId,
          name: playerTeamName,
          shortName: playerTeamShort,
          logoUrl: playerTeamLogo,
        }}
        divisionTeams={divisionTeams}
        divisionTier={currentDivision}
        facilityArenaLevel={arenaLevel}
        facilityArenaName={arenaName}
        players={myPlayers}
        filterMode={filterMode}
      />
    </div>
  );
}
