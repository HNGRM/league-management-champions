"use client";

import React, { useState, useMemo, useRef } from "react";
import { getTeamLogo } from "@/data/teamLogos";
import {
  Trophy,
  Award,
  Crown,
  History,
  Medal,
  Swords,
  Users,
  Star,
  Flame,
  Calendar,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import {
  TournamentType,
  TOURNAMENT_METAS,
  CareerStatCategory,
  CAREER_STAT_METAS,
  TournamentHistory,
  PlayerCareerRecord,
  ClubHistoryEntry,
  BracketMatch,
  DoubleEliminationBracket,
} from "@/types/record";
import {
  generateMccTournamentBracket,
  generateWccDoubleEliminationBracket,
} from "@/data/records";
import { DivisionTier, LeagueLanguage } from "@/types/game";
import { DIVISION_METAS } from "@/data/divisions";

type RecordSubTab = "STANDINGS_ARCHIVE" | "CAREER_LEADERS" | "CLUB_TIMELINE";

const TOURNAMENT_SHORT_NAMES: Record<TournamentType, { name: string; icon: string }> = {
  SPRING: { name: "스프링", icon: "🌸" },
  MCC: { name: "MCC", icon: "🏆" },
  SUMMER: { name: "서머", icon: "☀️" },
  WCC: { name: "WCC", icon: "🌍" },
};

const DIVISION_SHORT_NAMES: Record<DivisionTier, string> = {
  A: "리그 A",
  B: "리그 B",
  C: "리그 C",
  D: "리그 D",
};

export default function LeagueRecordsView() {
  const currentYear = useGameStore((state) => state.currentYear);
  const currentTeam = useGameStore((state) => state.currentTeam);
  const selectedTeam = useGameStore((state) => state.selectedTeam);
  const customTeamInfo = useGameStore((state) => state.customTeamInfo);
  const selectedLeague = useGameStore((state) => state.selectedLeague) || "KCL";

  const tournamentHistories = useGameStore((state) => state.tournamentHistories);
  const playerCareerRecords = useGameStore((state) => state.playerCareerRecords);
  const clubHistory = useGameStore((state) => state.clubHistory);

  // 1. 최상단 서브탭
  const [activeSubTab, setActiveSubTab] = useState<RecordSubTab>("STANDINGS_ARCHIVE");

  // 2. [대회 순위표 아카이브] 필터 상태
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(tournamentHistories.map((h) => h.year)));
    return years.sort((a, b) => b - a); // 최신 연도부터
  }, [tournamentHistories]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return availableYears[0] ?? currentYear - 1;
  });
  const [selectedTournament, setSelectedTournament] = useState<TournamentType>("SPRING");
  const [selectedDivision, setSelectedDivision] = useState<DivisionTier>("A");

  // 3. [선수 통산 기록] 카테고리 필터
  const [selectedCareerCategory, setSelectedCareerCategory] = useState<CareerStatCategory>("MVP");

  // 현재 선택된 대회 기록 조회
  const currentHistory = useMemo(() => {
    return tournamentHistories.find((h) => {
      if (h.year !== selectedYear || h.type !== selectedTournament) return false;
      if (h.type === "SPRING" || h.type === "SUMMER") {
        return h.division === selectedDivision;
      }
      return true; // MCC, WCC
    });
  }, [tournamentHistories, selectedYear, selectedTournament, selectedDivision]);

  // MCC 16강 토너먼트 대진표(Bracket) 조회 및 생성
  const mccBracket = useMemo(() => {
    if (!currentHistory || currentHistory.type !== "MCC") return null;
    return currentHistory.bracket || generateMccTournamentBracket(currentHistory);
  }, [currentHistory]);

  type MccRoundTab = "R16" | "QF" | "SF" | "FINAL";
  const [activeMccRound, setActiveMccRound] = useState<MccRoundTab>("R16");

  // MCC 매치 카드 렌더러 (선택된 라운드의 경기 카드)
  const renderMccMatchCard = (match: BracketMatch, isFinal = false) => {
    return (
      <div
        key={match.matchId}
        className={`w-full rounded-xl border bg-[#070f2b] shadow-md overflow-hidden transition-all hover:border-blue-400/80 ${
          isFinal
            ? "border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            : "border-blue-600/50"
        }`}
      >
        {/* 매치 헤더 바 */}
        <div
          className={`px-3 py-1.5 text-center font-bold text-xs tracking-tight flex items-center justify-between border-b ${
            isFinal
              ? "bg-gradient-to-r from-amber-950/80 via-blue-950/90 to-amber-950/80 border-amber-500/50 text-amber-200"
              : "bg-[#0d1e4c] border-blue-600/50 text-blue-200"
          }`}
        >
          <span>{match.roundLabel}</span>
          <span className="font-mono text-[11px] opacity-80">({match.dateLabel})</span>
        </div>

        {/* 팀 1 / 팀 2 세트 박스 */}
        <div className="divide-y divide-blue-900/60 font-sans">
          {[match.team1, match.team2].map((team, idx) => {
            return (
              <div
                key={team.teamId + idx}
                className={`grid grid-cols-[1fr_40px_48px] items-center px-3 py-2 transition-colors ${
                  team.isWinner
                    ? isFinal
                      ? "bg-gradient-to-r from-amber-950/30 to-blue-950/50 border-l-4 border-l-amber-400"
                      : "bg-blue-950/40 border-l-4 border-l-blue-400"
                    : "bg-slate-950/40 border-l-4 border-l-transparent"
                }`}
              >
                {/* 1. 팀명 + 시드 */}
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-black truncate tracking-tight ${
                        team.isChampion
                          ? "text-amber-300"
                          : team.isWinner
                          ? "text-amber-400"
                          : "text-slate-300"
                      }`}
                    >
                      {team.teamName} ({team.shortName})
                    </span>
                    {team.isChampion && (
                      <span className="text-xs shrink-0" title="MCC 우승">🏆</span>
                    )}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono truncate leading-none mt-0.5">
                    {team.seedInfo}
                  </span>
                </div>

                {/* 2. 팀 로고 */}
                <div className="flex items-center justify-center border-l border-r border-blue-900/50 px-1 py-0.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                    {team.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={team.logoUrl}
                        alt={team.teamName}
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">
                        {team.shortName.slice(0, 3)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. 스코어 */}
                <div
                  className={`flex items-center justify-center font-mono text-sm font-bold ${
                    team.isWinner
                      ? isFinal
                        ? "text-amber-300 font-black"
                        : "text-white font-black"
                      : "text-slate-500 font-semibold"
                  }`}
                >
                  {team.score}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // WCC 16팀 더블 엘리미네이션 대진표 조회 및 생성
  const wccBracket = useMemo(() => {
    if (!currentHistory || currentHistory.type !== "WCC") return null;
    return currentHistory.wccBracket || generateWccDoubleEliminationBracket(currentHistory);
  }, [currentHistory]);

  // WCC 1~4위 요약 정보
  const wccTop4 = useMemo(() => {
    if (!currentHistory || currentHistory.type !== "WCC" || !currentHistory.cupResults) return null;
    const list = currentHistory.cupResults;
    const champ = list.find((t) => t.rank === 1) || list[0];
    const runner = list.find((t) => t.rank === 2) || list[1];
    const third = list.find((t) => t.rank === 3) || list[2];
    const fourth = list.find((t) => t.rank === 4) || list[3];
    return { champ, runner, third, fourth };
  }, [currentHistory]);

  type WccStage = "UPPER" | "LOWER" | "GRAND_FINAL";
  type WccUpperRound = "R16" | "QF" | "SF" | "FINAL";
  type WccLowerRound = "R1_2" | "R3_4" | "SEMI" | "FINAL";

  const [activeWccStage, setActiveWccStage] = useState<WccStage>("UPPER");
  const [activeWccUpperRound, setActiveWccUpperRound] = useState<WccUpperRound>("R16");
  const [activeWccLowerRound, setActiveWccLowerRound] = useState<WccLowerRound>("R1_2");

  // WCC 매치 카드 렌더러 (승자조 / 패자조 / 그랜드 파이널 톤 차별화)
  const renderWccMatchCard = (
    match: BracketMatch,
    type: "UPPER" | "LOWER" | "GRAND_FINAL"
  ) => {
    const isLower = type === "LOWER";
    const isFinal = type === "GRAND_FINAL";

    return (
      <div
        key={match.matchId}
        className={`w-full rounded-xl border shadow-md overflow-hidden transition-all ${
          isFinal
            ? "border-amber-500/70 bg-[#070f2b] shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:border-amber-400"
            : isLower
            ? "border-rose-500/40 bg-[#120716] hover:border-rose-400/80"
            : "border-blue-600/50 bg-[#070f2b] hover:border-blue-400/80"
        }`}
      >
        {/* 매치 헤더 바 */}
        <div
          className={`px-3 py-1.5 text-center font-bold text-xs tracking-tight flex items-center justify-between border-b ${
            isFinal
              ? "bg-gradient-to-r from-amber-950/80 via-blue-950/90 to-amber-950/80 border-amber-500/50 text-amber-200"
              : isLower
              ? "bg-[#250b1d] border-rose-500/40 text-rose-200"
              : "bg-[#0d1e4c] border-blue-600/50 text-blue-200"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span>{match.roundLabel}</span>
            {isLower ? (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-sans font-bold">
                💀 패배 시 즉시 탈락
              </span>
            ) : !isFinal ? (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-sans">
                패배 팀은 패자조로 이동 ↘
              </span>
            ) : null}
          </div>
          <span className="font-mono text-[11px] opacity-80">({match.dateLabel})</span>
        </div>

        {/* 팀 1 / 팀 2 세트 박스 */}
        <div
          className={`divide-y font-sans ${
            isLower ? "divide-rose-950/80" : "divide-blue-900/60"
          }`}
        >
          {[match.team1, match.team2].map((team, idx) => {
            return (
              <div
                key={team.teamId + idx}
                className={`grid grid-cols-[1fr_40px_48px] items-center px-3 py-2 transition-colors ${
                  team.isWinner
                    ? isFinal
                      ? "bg-gradient-to-r from-amber-950/30 to-blue-950/50 border-l-4 border-l-amber-400"
                      : isLower
                      ? "bg-rose-950/40 border-l-4 border-l-rose-500"
                      : "bg-blue-950/40 border-l-4 border-l-blue-400"
                    : "bg-slate-950/40 border-l-4 border-l-transparent opacity-80"
                }`}
              >
                {/* 1. 팀명 + 시드 */}
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-black truncate tracking-tight ${
                        team.isChampion
                          ? "text-amber-300"
                          : team.isWinner
                          ? isLower
                            ? "text-rose-300"
                            : "text-amber-400"
                          : "text-slate-300"
                      }`}
                    >
                      {team.teamName} ({team.shortName})
                    </span>
                    {team.isChampion && (
                      <span className="text-xs shrink-0" title="WCC 우승">
                        🏆
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono truncate leading-none mt-0.5 ${
                      isLower ? "text-rose-400/80" : "text-cyan-400"
                    }`}
                  >
                    {team.seedInfo}
                  </span>
                </div>

                {/* 2. 팀 로고 */}
                <div
                  className={`flex items-center justify-center border-l border-r px-1 py-0.5 ${
                    isLower ? "border-rose-900/40" : "border-blue-900/50"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900/90 border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                    {team.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={team.logoUrl}
                        alt={team.teamName}
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">
                        {team.shortName.slice(0, 3)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. 스코어 */}
                <div
                  className={`flex items-center justify-center font-mono text-sm font-bold ${
                    team.isWinner
                      ? isFinal
                        ? "text-amber-300 font-black"
                        : isLower
                        ? "text-rose-200 font-black"
                        : "text-white font-black"
                      : "text-slate-500 font-semibold"
                  }`}
                >
                  {team.score}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 통산 기록 카테고리별 정렬된 선수 목록
  const sortedCareerPlayers = useMemo(() => {
    const list = [...playerCareerRecords];
    switch (selectedCareerCategory) {
      case "MVP":
        return list.sort((a, b) => b.totalMvpCount - a.totalMvpCount);
      case "KILLS":
        return list.sort((a, b) => b.totalKills - a.totalKills);
      case "ASSISTS":
        return list.sort((a, b) => b.totalAssists - a.totalAssists);
      case "RATING":
        return list.sort((a, b) => b.avgRating - a.avgRating);
      case "SOLO_KILLS":
        return list.sort((a, b) => b.soloKills - a.soloKills);
      case "PENTAKILLS":
        return list.sort((a, b) => b.pentakills - a.pentakills);
      default:
        return list;
    }
  }, [playerCareerRecords, selectedCareerCategory]);

  const teamNameKo =
    customTeamInfo.nameKo || currentTeam?.name || selectedTeam?.nameKo || "내 구단";
  const teamLogoUrl =
    customTeamInfo.customLogoUrl ||
    (currentTeam?.id ? getTeamLogo(currentTeam.id) : null) ||
    (selectedTeam?.id ? getTeamLogo(selectedTeam.id) : null);

  return (
    <div className="flex flex-col gap-3 pb-8 text-slate-100">
      {/* ============================================================== */}
      {/* 1. 최상단 서브탭 네비게이션 (글씨 작게, 세로길이 축소)            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md shadow-md">
        <button
          onClick={() => setActiveSubTab("STANDINGS_ARCHIVE")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
            activeSubTab === "STANDINGS_ARCHIVE"
              ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/40 shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>대회 순위표</span>
        </button>

        <button
          onClick={() => setActiveSubTab("CAREER_LEADERS")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
            activeSubTab === "CAREER_LEADERS"
              ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Crown className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
          <span>선수 통산 기록</span>
        </button>

        <button
          onClick={() => setActiveSubTab("CLUB_TIMELINE")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
            activeSubTab === "CLUB_TIMELINE"
              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-purple-300 border border-purple-500/40 shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <History className="w-3.5 h-3.5 shrink-0 text-purple-400" />
          <span>구단 역사 연표</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. 서브탭 1: 대회 순위표 아카이브                                 */}
      {/* ============================================================== */}
      {activeSubTab === "STANDINGS_ARCHIVE" && (
        <div className="flex flex-col gap-2.5">
          {/* 필터 바: 연도 / 대회 (/ 리그) 한 줄 드롭다운 */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-1.5 shadow-xs flex items-center gap-1.5">
            {/* 연도 드롭다운 */}
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-lg pl-7 pr-6 py-1.5 text-xs font-bold text-amber-300 outline-none focus:border-amber-500/60 cursor-pointer shadow-inner appearance-none truncate"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year} className="bg-slate-900 text-slate-100">
                    {year}년
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-amber-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 대회 드롭다운 */}
            <div className="relative flex-[1.2] min-w-0">
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value as TournamentType)}
                className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-lg pl-7 pr-6 py-1.5 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-500/60 cursor-pointer shadow-inner appearance-none truncate"
              >
                <option value="SPRING" className="bg-slate-900 text-slate-100">🌸 스프링</option>
                <option value="MCC" className="bg-slate-900 text-slate-100">🏆 MCC</option>
                <option value="SUMMER" className="bg-slate-900 text-slate-100">☀️ 서머</option>
                <option value="WCC" className="bg-slate-900 text-slate-100">🌍 WCC</option>
              </select>
              <Trophy className="w-3.5 h-3.5 text-cyan-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 리그(디비전) 드롭다운 (스프링 / 서머 시즌일 때만 노출) */}
            {(selectedTournament === "SPRING" || selectedTournament === "SUMMER") && (
              <div className="relative flex-1 min-w-0 animate-in fade-in duration-150">
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value as DivisionTier)}
                  className="w-full bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-lg pl-7 pr-6 py-1.5 text-xs font-bold text-emerald-300 outline-none focus:border-emerald-500/60 cursor-pointer shadow-inner appearance-none truncate"
                >
                  <option value="A" className="bg-slate-900 text-slate-100">리그 A</option>
                  <option value="B" className="bg-slate-900 text-slate-100">리그 B</option>
                  <option value="C" className="bg-slate-900 text-slate-100">리그 C</option>
                  <option value="D" className="bg-slate-900 text-slate-100">리그 D</option>
                </select>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          {!currentHistory && (
            <div className="p-4 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
              해당 대회의 아카이브 기록이 아직 존재하지 않습니다.
            </div>
          )}

          {/* 최종 순위표 (리그-순위와 동일한 UI 레이아웃) */}
          {currentHistory?.standings && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {/* 테이블 헤더 */}
              <div className="grid grid-cols-12 px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono text-slate-400 font-bold items-center">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6 pl-1">팀 (TEAM)</div>
                <div className="col-span-1 text-center">경기</div>
                <div className="col-span-1 text-center text-cyan-400">승</div>
                <div className="col-span-1 text-center text-rose-400">패</div>
                <div className="col-span-1 text-center">승률</div>
                <div className="col-span-1 text-center">득실</div>
              </div>

              {/* 테이블 본문 */}
              <div className="divide-y divide-slate-800/60">
                {currentHistory.standings.map((team, idx) => {
                  const isWinner = idx === 0;
                  const isRunnerUp = idx === 1;
                  const isPO = idx < (selectedDivision === "A" ? 6 : 4);
                  const isRelegation =
                    (selectedDivision === "A" && idx >= 8) ||
                    (selectedDivision === "B" && idx >= 6) ||
                    (selectedDivision === "C" && idx >= 4);

                  return (
                    <div
                      key={team.teamId}
                      className={`grid grid-cols-12 px-3 py-2.5 items-center transition-colors relative ${
                        isWinner
                          ? "bg-amber-500/5 border-l-4 border-l-amber-400"
                          : isRunnerUp
                          ? "border-l-2 border-l-slate-400/80 hover:bg-slate-900/40"
                          : isPO
                          ? "border-l-2 border-l-emerald-500/70 hover:bg-slate-900/40"
                          : isRelegation
                          ? "border-l-2 border-l-rose-500/70 hover:bg-slate-900/40"
                          : "border-l-2 border-l-transparent hover:bg-slate-900/40"
                      }`}
                    >
                      {/* 1. 순위 */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-xs ${
                            idx === 0
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : idx === 1
                              ? "bg-slate-300/20 text-slate-200 border border-slate-400/40"
                              : idx === 2
                              ? "bg-amber-700/20 text-amber-600 border border-amber-700/40"
                              : "text-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </div>

                      {/* 2. 팀 정보 (로고 + 이름 + 배지) */}
                      <div className="col-span-6 flex items-center gap-2 min-w-0 pl-1 pr-1">
                        {team.logoUrl ? (
                          <div className="w-6 h-6 rounded-lg bg-white border border-slate-700 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={team.logoUrl}
                              alt={team.teamName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-[9px] text-cyan-300 shrink-0">
                            {team.shortName.slice(0, 3)}
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold truncate ${isWinner ? "text-amber-200" : "text-slate-200"}`}>
                              {team.teamName}
                            </span>
                            {isWinner && (
                              <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold border border-amber-500/30 shrink-0">
                                우승
                              </span>
                            )}
                            {isRunnerUp && (
                              <span className="px-1 py-0.2 rounded bg-slate-500/20 text-slate-300 text-[8px] font-bold border border-slate-500/30 shrink-0">
                                준우승
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono truncate">
                            {team.shortName}
                          </span>
                        </div>
                      </div>

                      {/* 3. 경기수 */}
                      <div className="col-span-1 text-center font-mono text-[11px] text-slate-400">
                        {team.matchesPlayed}
                      </div>

                      {/* 4. 승 */}
                      <div className="col-span-1 text-center font-mono text-[11px] text-cyan-400 font-bold">
                        {team.wins}
                      </div>

                      {/* 5. 패 */}
                      <div className="col-span-1 text-center font-mono text-[11px] text-rose-400 font-bold">
                        {team.losses}
                      </div>

                      {/* 6. 승률 */}
                      <div className="col-span-1 text-center font-mono text-[11px] text-slate-200 font-bold">
                        {team.winRate}%
                      </div>

                      {/* 7. 득실차 */}
                      <div className="col-span-1 text-center font-mono text-[11px] text-slate-300">
                        {team.points > 0 ? `+${team.points}` : team.points}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MCC 16강 싱글 엘리미네이션 토너먼트 (라운드별 세로 경기 목록)         */}
          {/* ============================================================== */}
          {selectedTournament === "MCC" && mccBracket && (
            <div className="flex flex-col gap-3">
              {/* 1. 16강 - 8강 - 4강 - 결승 라운드 선택 탭 (4분할 그리드) */}
              <div className="grid grid-cols-4 gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-xs">
                {(
                  [
                    { id: "R16", label: "16강" },
                    { id: "QF", label: "8강" },
                    { id: "SF", label: "4강" },
                    { id: "FINAL", label: "결승" },
                  ] as const
                ).map((tab) => {
                  const isActive = activeMccRound === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveMccRound(tab.id)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs font-black"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* 2. 선택된 라운드의 경기 목록 (세로 카드 리스트) */}
              <div className="flex flex-col gap-2.5">
                {activeMccRound === "R16" &&
                  mccBracket.roundOf16.map((m) => renderMccMatchCard(m))}

                {activeMccRound === "QF" &&
                  mccBracket.quarterFinals.map((m) => renderMccMatchCard(m))}

                {activeMccRound === "SF" &&
                  mccBracket.semiFinals.map((m) => renderMccMatchCard(m))}

                {activeMccRound === "FINAL" && (
                  <div className="flex flex-col gap-3">
                    {renderMccMatchCard(mccBracket.finals, true)}

                    {/* 결승전 결과 우승 배너 */}
                    <div className="rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/40 border border-amber-500/50 p-3 flex flex-col items-center text-center shadow-lg">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-300 text-xl mb-1 shadow-xs">
                        🏆
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                        {selectedYear} MCC CHAMPION
                      </span>
                      <span className="text-sm font-black text-amber-200 truncate w-full mt-0.5">
                        {mccBracket.finals.team1.isWinner
                          ? mccBracket.finals.team1.teamName
                          : mccBracket.finals.team2.teamName}
                      </span>
                      <span className="text-[11px] text-amber-400/80 font-mono mt-0.5">
                        결승전 최종 스코어 {mccBracket.finals.team1.score} : {mccBracket.finals.team2.score}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. 하단 범례 안내 바 */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[10px] text-slate-400 font-mono px-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 border border-blue-400 inline-block"></span>
                    <span className="text-slate-300">세트 승리</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 border border-amber-300 inline-block"></span>
                    <span className="text-amber-300 font-bold">MCC 우승</span>
                  </span>
                </div>
                {currentHistory?.finalsMvpName && (
                  <div className="flex items-center gap-1 text-amber-300 font-sans font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>결승 MVP: {currentHistory.finalsMvpName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* WCC 16팀 더블 엘리미네이션 UI (Option 1: 3대 영역 분할 탭 방식)  */}
          {/* ============================================================== */}
          {selectedTournament === "WCC" && wccBracket && (
            <div className="flex flex-col gap-3">
              {/* 상단 요약 배너: 1위 🏆, 2위 🥈, 3위 🥉, 4위 🎖️ 팀 한 줄 요약 */}
              {wccTop4 && (
                <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-500/30 rounded-xl p-2.5 shadow-md">
                  <div className="text-[11px] font-bold text-amber-300/90 mb-1.5 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>WCC {selectedYear} 최종 순위 TOP 4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-1.5 flex flex-col items-center">
                      <span className="text-[10px] font-black text-amber-400 flex items-center gap-0.5">
                        🏆 1위
                      </span>
                      <span className="text-xs font-bold text-slate-100 truncate w-full mt-0.5">
                        {wccTop4.champ.teamName}
                      </span>
                      <span className="text-[9px] text-cyan-400 font-mono">
                        {wccTop4.champ.league}
                      </span>
                    </div>
                    <div className="bg-slate-500/10 border border-slate-400/30 rounded-lg p-1.5 flex flex-col items-center">
                      <span className="text-[10px] font-black text-slate-300 flex items-center gap-0.5">
                        🥈 2위
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate w-full mt-0.5">
                        {wccTop4.runner.teamName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {wccTop4.runner.league}
                      </span>
                    </div>
                    <div className="bg-amber-900/10 border border-amber-700/30 rounded-lg p-1.5 flex flex-col items-center">
                      <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5">
                        🥉 3위
                      </span>
                      <span className="text-xs font-bold text-slate-300 truncate w-full mt-0.5">
                        {wccTop4.third.teamName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {wccTop4.third.league}
                      </span>
                    </div>
                    <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-1.5 flex flex-col items-center">
                      <span className="text-[10px] font-black text-purple-300 flex items-center gap-0.5">
                        🎖️ 4위
                      </span>
                      <span className="text-xs font-bold text-slate-300 truncate w-full mt-0.5">
                        {wccTop4.fourth.teamName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {wccTop4.fourth.league}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1단계 탭: 3대 영역 분할 (승자조 / 패자조 / 최종 결승) */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveWccStage("UPPER")}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    activeWccStage === "UPPER"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-900/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span>🛡️</span>
                  <span className="truncate">승자조</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWccStage("LOWER")}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    activeWccStage === "LOWER"
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-900/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span>⚔️</span>
                  <span className="truncate">패자조</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWccStage("GRAND_FINAL")}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    activeWccStage === "GRAND_FINAL"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-md shadow-amber-900/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span>🏆</span>
                  <span className="truncate">최종 결승</span>
                </button>
              </div>

              {/* 2단계 라운드 서브탭 및 매치 카드 목록 */}
              {activeWccStage === "UPPER" && (
                <div className="flex flex-col gap-2.5">
                  {/* 승자조 라운드 서브탭 */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900/70 border border-blue-900/40 rounded-xl overflow-x-auto">
                    {[
                      { key: "R16" as const, label: "16강 (8G)" },
                      { key: "QF" as const, label: "8강 (4G)" },
                      { key: "SF" as const, label: "4강 (2G)" },
                      { key: "FINAL" as const, label: "승자 결승 (1G)" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveWccUpperRound(tab.key)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                          activeWccUpperRound === tab.key
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 안내 뱃지 */}
                  <div className="flex items-center justify-between text-[11px] text-blue-300/80 bg-blue-950/30 border border-blue-800/30 px-3 py-1.5 rounded-lg">
                    <span>🛡️ 승자조 토너먼트 (패배 시 탈락하지 않고 패자조로 이동)</span>
                    <span className="text-cyan-400 font-mono text-[10px]">Bo5</span>
                  </div>

                  {/* 매치 목록 */}
                  <div className="flex flex-col gap-2">
                    {activeWccUpperRound === "R16" &&
                      wccBracket.upper.roundOf16.map((m) => renderWccMatchCard(m, "UPPER"))}
                    {activeWccUpperRound === "QF" &&
                      wccBracket.upper.quarterFinals.map((m) => renderWccMatchCard(m, "UPPER"))}
                    {activeWccUpperRound === "SF" &&
                      wccBracket.upper.semiFinals.map((m) => renderWccMatchCard(m, "UPPER"))}
                    {activeWccUpperRound === "FINAL" &&
                      renderWccMatchCard(wccBracket.upper.upperFinal, "UPPER")}
                  </div>
                </div>
              )}

              {activeWccStage === "LOWER" && (
                <div className="flex flex-col gap-2.5">
                  {/* 패자조 라운드 서브탭 */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900/70 border border-rose-900/40 rounded-xl overflow-x-auto">
                    {[
                      { key: "R1_2" as const, label: "1·2R (8G)" },
                      { key: "R3_4" as const, label: "3·4R (4G)" },
                      { key: "SEMI" as const, label: "패자 준결승 (1G)" },
                      { key: "FINAL" as const, label: "패자 결승 (1G)" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveWccLowerRound(tab.key)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                          activeWccLowerRound === tab.key
                            ? "bg-rose-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 긴장감 뱃지 */}
                  <div className="flex items-center justify-between text-[11px] text-rose-300/90 bg-rose-950/30 border border-rose-800/40 px-3 py-1.5 rounded-lg">
                    <span>💀 패자조 토너먼트 (패배 시 다음 기회 없이 대회 즉시 탈락)</span>
                    <span className="text-rose-400 font-mono text-[10px]">Bo5</span>
                  </div>

                  {/* 매치 목록 */}
                  <div className="flex flex-col gap-2">
                    {activeWccLowerRound === "R1_2" && (
                      <>
                        <div className="text-[11px] font-bold text-rose-400 px-1 pt-1">
                          패자조 1라운드 (승자 16강 패자 8팀 맞대결)
                        </div>
                        {wccBracket.lower.round1.map((m) => renderWccMatchCard(m, "LOWER"))}
                        <div className="text-[11px] font-bold text-rose-400 px-1 pt-2">
                          패자조 2라운드 (1R 승자 4팀 vs 승자 8강 패자 4팀)
                        </div>
                        {wccBracket.lower.round2.map((m) => renderWccMatchCard(m, "LOWER"))}
                      </>
                    )}
                    {activeWccLowerRound === "R3_4" && (
                      <>
                        <div className="text-[11px] font-bold text-rose-400 px-1 pt-1">
                          패자조 3라운드 (2R 승자 4팀 맞대결)
                        </div>
                        {wccBracket.lower.round3.map((m) => renderWccMatchCard(m, "LOWER"))}
                        <div className="text-[11px] font-bold text-rose-400 px-1 pt-2">
                          패자조 4라운드 (3R 승자 2팀 vs 승자 4강 패자 2팀)
                        </div>
                        {wccBracket.lower.round4.map((m) => renderWccMatchCard(m, "LOWER"))}
                      </>
                    )}
                    {activeWccLowerRound === "SEMI" && (
                      <>
                        <div className="text-[11px] font-bold text-rose-400 px-1 pt-1">
                          패자조 준결승 (패자는 최종 4위 확정)
                        </div>
                        {renderWccMatchCard(wccBracket.lower.lowerSemiFinal, "LOWER")}
                      </>
                    )}
                    {activeWccLowerRound === "FINAL" && (
                      <>
                        <div className="text-[11px] font-bold text-rose-400 px-1 pt-1">
                          패자조 결승 (패자는 최종 3위 확정 / 승자는 그랜드 파이널 진출)
                        </div>
                        {renderWccMatchCard(wccBracket.lower.lowerFinal, "LOWER")}
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeWccStage === "GRAND_FINAL" && (
                <div className="flex flex-col gap-3">
                  {/* 단독 Bo5 매치 카드 */}
                  <div>
                    <div className="text-[11px] font-bold text-amber-300 px-1 pb-1.5 flex items-center gap-1">
                      <span>🏆</span>
                      <span>그랜드 파이널 (승자조 1위 vs 패자조 1위)</span>
                    </div>
                    {renderWccMatchCard(wccBracket.grandFinal, "GRAND_FINAL")}
                  </div>

                  {/* WCC 월드 챔피언 트로피 배너 & 파이널 MVP 카드 */}
                  <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/50 rounded-2xl p-4 text-center shadow-xl">
                    <div className="text-3xl mb-1">🏆</div>
                    <span className="text-[10px] font-black tracking-widest text-amber-400/90 uppercase">
                      World Champions Cup {selectedYear} Winner
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-amber-200 mt-0.5">
                      {currentHistory?.winnerTeamName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">
                      세계 최고봉 16개 명문 구단이 격돌한 더블 엘리미네이션 토너먼트 제패
                    </p>

                    {currentHistory?.finalsMvpName && (
                      <div className="mt-3 pt-3 border-t border-amber-500/20 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">
                          파이널 MVP: {currentHistory.finalsMvpName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. 서브탭 2: 선수 역대 통산 기록                                 */}
      {/* ============================================================== */}
      {activeSubTab === "CAREER_LEADERS" && (
        <div className="flex flex-col gap-2.5">
          {/* 6대 지표 카테고리 칩 (세로길이 축소) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-wrap gap-1.5 shadow-xs">
            {(
              [
                "MVP",
                "KILLS",
                "ASSISTS",
                "RATING",
                "SOLO_KILLS",
                "PENTAKILLS",
              ] as CareerStatCategory[]
            ).map((cat) => {
              const meta = CAREER_STAT_METAS[cat];
              const isSelected = selectedCareerCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCareerCategory(cat)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-xs scale-102"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/60 border border-slate-700/40"
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.nameKr}</span>
                </button>
              );
            })}
          </div>

          {/* 선택 카테고리 설명 배너 */}
          <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{CAREER_STAT_METAS[selectedCareerCategory].description}</span>
            </div>
            <span className="text-[10px] text-cyan-400/80 font-mono shrink-0">
              단위: {CAREER_STAT_METAS[selectedCareerCategory].unit}
            </span>
          </div>

          {/* 1위 명예의 전당 하이라이트 카드 (콤팩트) */}
          {sortedCareerPlayers.length > 0 && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border border-amber-500/40 p-3.5 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-300 text-xl font-black shadow-sm">
                      {sortedCareerPlayers[0].playerName[0]}
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-xs">
                      👑
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        역대 1위
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300">
                        {sortedCareerPlayers[0].position}
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5 truncate">
                      <span className="truncate">{sortedCareerPlayers[0].playerName}</span>
                      <span className="text-xs font-normal text-slate-400 shrink-0">
                        ({sortedCareerPlayers[0].realName})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                      <span className="truncate">{sortedCareerPlayers[0].teamName}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-cyan-400 font-semibold shrink-0">
                        {sortedCareerPlayers[0].league}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono text-slate-400 shrink-0">
                        통산 {sortedCareerPlayers[0].totalGames}경기
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 font-mono">
                    {selectedCareerCategory === "MVP" && sortedCareerPlayers[0].totalMvpCount}
                    {selectedCareerCategory === "KILLS" && sortedCareerPlayers[0].totalKills.toLocaleString()}
                    {selectedCareerCategory === "ASSISTS" && sortedCareerPlayers[0].totalAssists.toLocaleString()}
                    {selectedCareerCategory === "RATING" && sortedCareerPlayers[0].avgRating.toFixed(1)}
                    {selectedCareerCategory === "SOLO_KILLS" && sortedCareerPlayers[0].soloKills}
                    {selectedCareerCategory === "PENTAKILLS" && sortedCareerPlayers[0].pentakills}
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 ml-1">
                    {CAREER_STAT_METAS[selectedCareerCategory].unit}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2위 ~ 10위 랭킹 리스트 (콤팩트) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-800/40">
              {sortedCareerPlayers.slice(1, 10).map((player, idx) => {
                const rank = idx + 2;
                return (
                  <div
                    key={player.playerId}
                    className="flex items-center justify-between p-2.5 px-3 hover:bg-slate-800/40 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 ${
                          rank === 2
                            ? "bg-slate-300 text-slate-950 font-bold"
                            : rank === 3
                            ? "bg-amber-700 text-slate-100 font-bold"
                            : "bg-slate-800 text-slate-400 font-mono"
                        }`}
                      >
                        {rank}
                      </span>

                      <span className="w-7 px-1 py-0.2 rounded text-[9px] font-bold text-center bg-slate-800 text-cyan-300 border border-slate-700 shrink-0">
                        {player.position}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {player.playerName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal shrink-0">
                            {player.realName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                          <span className="truncate">{player.teamName}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-500 font-mono shrink-0">{player.totalGames}경기</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-100 font-mono">
                        {selectedCareerCategory === "MVP" && player.totalMvpCount}
                        {selectedCareerCategory === "KILLS" && player.totalKills.toLocaleString()}
                        {selectedCareerCategory === "ASSISTS" && player.totalAssists.toLocaleString()}
                        {selectedCareerCategory === "RATING" && player.avgRating.toFixed(1)}
                        {selectedCareerCategory === "SOLO_KILLS" && player.soloKills}
                        {selectedCareerCategory === "PENTAKILLS" && player.pentakills}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        {CAREER_STAT_METAS[selectedCareerCategory].unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. 서브탭 3: 구단 역사 연표 (감독 부임 타임라인)                    */}
      {/* ============================================================== */}
      {activeSubTab === "CLUB_TIMELINE" && (
        <div className="flex flex-col gap-4">
          {/* 구단 명패 배너 */}
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/20 to-slate-900 border border-purple-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3.5">
              {teamLogoUrl ? (
                <img
                  src={teamLogoUrl}
                  alt={teamNameKo}
                  className="w-14 h-14 rounded-2xl border-2 border-purple-500/40 bg-slate-900 shadow-md shrink-0 object-contain"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center text-purple-300 text-xl font-black shrink-0">
                  {teamNameKo[0]}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-purple-400 tracking-wider">
                  CLUB TIMELINE ARCHIVE
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-100">{teamNameKo}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  창단 및 감독 부임 시점부터 기록되는 구단 전용 역사관
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                1년차 (진행 중)
              </span>
            </div>
          </div>

          {/* 연도별 연표 카드 리스트 */}
          <div className="relative pl-6 border-l-2 border-purple-500/30 space-y-6">
            {clubHistory.map((entry, idx) => (
              <div key={entry.year} className="relative group">
                {/* 타임라인 노드 점 */}
                <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-slate-900 border-2 border-purple-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                </div>

                {/* 연표 카드 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col gap-4">
                  {/* 카드 헤더 */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-black text-purple-300 font-mono">
                        {entry.year}년 시즌
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        리그 {entry.division}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {idx === 0 ? "창단 시즌" : `${idx + 1}년차 시즌`}
                    </span>
                  </div>

                  {/* 대회별 최종 성적 4분할 그리드 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        🌸 스프링
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {entry.springResult}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                        🏆 MCC
                      </span>
                      <span className="text-xs font-bold text-slate-200">{entry.mccResult}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        ☀️ 서머
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {entry.summerResult}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                        🌍 WCC
                      </span>
                      <span className="text-xs font-bold text-slate-200">{entry.wccResult}</span>
                    </div>
                  </div>

                  {/* 이적 시장 결산 (In & Out) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/20">
                      <span className="font-bold text-emerald-300 flex items-center gap-1 mb-2">
                        <ArrowDownRight className="w-4 h-4" /> 주요 영입 (In)
                      </span>
                      {entry.transfersIn.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.transfersIn.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[11px] border border-emerald-500/30"
                            >
                              {t.playerName} ({t.position})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">영입 내역 없음</span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-rose-950/10 border border-rose-500/20">
                      <span className="font-bold text-rose-300 flex items-center gap-1 mb-2">
                        <ArrowUpRight className="w-4 h-4" /> 주요 방출 (Out)
                      </span>
                      {entry.transfersOut.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {entry.transfersOut.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[11px] border border-rose-500/30"
                            >
                              {t.playerName} ({t.position})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">방출 내역 없음</span>
                      )}
                    </div>
                  </div>

                  {/* 마일스톤 리스트 */}
                  {entry.milestones.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                        🌟 구단 마일스톤
                      </span>
                      <div className="space-y-1">
                        {entry.milestones.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="flex items-center gap-2 text-xs text-slate-300"
                          >
                            <span className="text-amber-400">✓</span>
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
