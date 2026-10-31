"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGameStore } from "@/store/useGameStore";
import {
  MatchSchedule,
  SeasonPhase,
  SEASON_PHASE_METAS,
  getSeasonPhaseForMonth,
  getWeekMonthInfo,
  getWeekSlots,
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
  Trophy,
} from "lucide-react";

export default function LeagueScheduleView() {
  const currentYear = useGameStore((state) => state.currentYear);
  const currentWeek = useGameStore((state) => state.currentWeek);
  const activeMatchIndex = useGameStore((state) => state.activeMatchIndex);
  const playCurrentMatch = useGameStore((state) => state.playCurrentMatch);

  const currentTeam = useGameStore((state) => state.currentTeam);
  const selectedTeam = useGameStore((state) => state.selectedTeam);
  const customTeamInfo = useGameStore((state) => state.customTeamInfo);
  const leagueDivisions = useGameStore((state) => state.leagueDivisions);
  const currentDivision = useGameStore((state) => state.currentDivision || "D");
  const facilities = useGameStore((state) => state.facilities);
  const myPlayers = useGameStore((state) => state.myPlayers);
  const seasonSchedule = useGameStore((state) => state.seasonSchedule);
  const setSeasonSchedule = useGameStore((state) => state.setSeasonSchedule);

  // 연도 표시 (창단 연도 다음 해 2027 정립)
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

  // 주차 세부정보 모달 열림 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  // 스케줄 생성 및 동기화 (기존 스케줄이 비어있거나 다른 팀 일정인 경우 자동 재생성)
  useEffect(() => {
    const isScheduleStale =
      !seasonSchedule ||
      seasonSchedule.length === 0 ||
      (seasonSchedule.length > 0 &&
        seasonSchedule.some((m) => m.isPlayerMatch) &&
        !seasonSchedule.some(
          (m) =>
            m.isPlayerMatch &&
            (m.homeTeamId === playerTeamId || m.awayTeamId === playerTeamId)
        ));

    if (isScheduleStale) {
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

  // 선택된 주차의 매치 목록
  const selectedWeekMatches = useMemo(() => {
    return activeSchedule.filter((m) => m.week === selectedWeek);
  }, [activeSchedule, selectedWeek]);

  // 홈 경기장 시설 스펙
  const arenaLevel = facilities?.arena ?? 1;
  const arenaDef = FACILITIES.find((f) => f.id === "arena");
  const arenaName = arenaDef?.levels[arenaLevel]?.name || "소형 아레나";

  return (
    <div className="flex flex-col gap-3 w-full pb-8 select-none animate-in fade-in duration-200">
      {/* ================= 1. 상단 월 네비게이터 & 필터 바 ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-md flex flex-col gap-2">
        {/* 1행: 월 이동 컨트롤 & 오늘로 이동 버튼 */}
        <div className="flex items-center justify-between gap-2">
          {/* 월 이동기 */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800/90 rounded-xl p-0.5 shadow-inner">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="이전달 이동"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-2.5 py-0.5 flex items-center gap-1.5 justify-center text-center">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs font-black text-white tracking-tight">
                {displayYear}년 {selectedMonth}월
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="다음달 이동"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 오늘로 이동 버튼 */}
          <button
            type="button"
            onClick={handleJumpToToday}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 active:scale-95 text-[11px] font-bold transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>오늘 (W{currentWeek})</span>
          </button>
        </div>

        {/* 2행: 시즌 페이즈 뱃지 & 필터 토글 */}
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/70">
          {/* 시즌 페이즈 */}
          <div
            className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 shadow-xs truncate ${phaseMeta.badgeClass}`}
          >
            <span>{phaseMeta.icon}</span>
            <span className="font-mono tracking-tight font-black">{phaseMeta.nameKr}</span>
          </div>

          {/* 필터 토글: 우리 팀 vs 전체 */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setFilterMode("MY_TEAM")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === "MY_TEAM"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>우리 팀 경기만</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === "ALL"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Trophy className="w-3 h-3" />
              <span>리그 전체</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. 가로형 와이드 주차 리스트 (4개 Row Cards) ================= */}
      <div className="flex flex-col gap-2">
        {monthWeeks.map((week) => {
          const { monthWeek } = getWeekMonthInfo(week);
          const isCurrentPlayWeek = week === currentWeek;
          const isSelected = week === selectedWeek;

          // 해당 주차의 플레이어 경기 목록 (0~2경기)
          const weekMatches = activeSchedule.filter((m) => m.week === week && m.isPlayerMatch);

          // 주차 전체 완료 여부 판정
          const allMatchesCompleted =
            weekMatches.length > 0 && weekMatches.every((m) => m.status === "COMPLETED");

          // 무조건 3개의 통일된 칸(슬롯) 생성
          const slots = getWeekSlots(week, weekMatches, divisionTeams, currentWeek);

          return (
            <button
              key={week}
              type="button"
              onClick={() => {
                setSelectedWeek(week);
                setIsModalOpen(true);
              }}
              className={`w-full rounded-2xl p-2.5 sm:p-3 border transition-all text-left flex flex-col gap-2 relative cursor-pointer ${
                isSelected
                  ? "bg-slate-800/95 border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_16px_rgba(6,182,212,0.3)]"
                  : isCurrentPlayWeek
                  ? "bg-slate-900/90 border-cyan-500/60 ring-1 ring-cyan-500/30 hover:border-cyan-400 shadow-md"
                  : "bg-slate-900/60 border-slate-800/90 hover:bg-slate-800/60 hover:border-slate-700 shadow-xs"
              }`}
            >
              {/* 상단: 주차 정보 및 현재 진행 배지 */}
              <div className="flex items-center justify-between w-full border-b border-slate-800/70 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">
                    {selectedMonth}월 {monthWeek}주차
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (연간 {week}주차)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isCurrentPlayWeek && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] flex items-center gap-1 shadow-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      NOW 이번 주
                    </span>
                  )}
                  {!isCurrentPlayWeek && allMatchesCompleted && (
                    <span className="text-[9px] font-mono font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-800">
                      경기 완료
                    </span>
                  )}
                </div>
              </div>

              {/* 중앙: 무조건 3개의 통일된 칸 (슬롯) 리스트 */}
              <div className="flex flex-col gap-1.5 w-full">
                {slots.map((item) => {
                  if (item.isEmpty) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-center rounded-xl bg-slate-950/25 border border-dashed border-slate-800/40 min-h-[34px] h-[34px] select-none"
                      >
                        <span className="text-[10px] text-slate-700/50 font-mono">-</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-1.5 px-2 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs gap-2 min-h-[34px]"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-[10px] font-mono font-bold shrink-0 ${item.tagClass}`}
                        >
                          {item.tag}
                        </span>
                        <div className="w-4 h-4 rounded-md bg-slate-900 border border-slate-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden text-[10px]">
                          {item.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.logoUrl}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          ) : item.icon ? (
                            <span>{item.icon}</span>
                          ) : (
                            <Shield className="w-3 h-3 text-slate-500" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 truncate max-w-[130px]">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-1 py-0.2 rounded text-[8px] font-bold border shrink-0 ${item.badgeClass}`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.subText && (
                          <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">
                            {item.subText}
                          </span>
                        )}
                      </div>

                      {/* 경기/이벤트 결과 또는 상태 뱃지 */}
                      <div className="shrink-0 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] border ${item.statusClass}`}
                        >
                          {item.statusText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* ================= 3. 선택 주차 상세 프리뷰 패널 (모달) ================= */}
      <ScheduleMatchDetailPanel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedWeek={selectedWeek}
        currentWeek={currentWeek}
        activeMatchIndex={activeMatchIndex}
        weekMatches={selectedWeekMatches}
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
        onPlayMatch={playCurrentMatch}
      />
    </div>
  );
}
