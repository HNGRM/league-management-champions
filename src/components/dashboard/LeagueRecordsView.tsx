"use client";

import React, { useState, useMemo } from "react";
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
} from "@/types/record";
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
          {/* 필터 바 (연도 - 대회 - 리그 세로길이 좁힘) */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2 sm:p-2.5 flex flex-col gap-1.5 shadow-xs">
            {/* 연도 선택 가로 칩 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                <Calendar className="w-3 h-3 text-amber-400" /> 연도
              </span>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                    selectedYear === year
                      ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/60 border border-slate-700/40"
                  }`}
                >
                  {year}년
                </button>
              ))}
            </div>

            {/* 대회 선택 가로 칩: 스프링 - MCC - 서머 - WCC */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-1 border-t border-slate-800/50">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                <Trophy className="w-3 h-3 text-cyan-400" /> 대회
              </span>
              {(["SPRING", "MCC", "SUMMER", "WCC"] as TournamentType[]).map((type) => {
                const info = TOURNAMENT_SHORT_NAMES[type];
                const isSelected = selectedTournament === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedTournament(type)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 font-black shadow-xs"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/60 border border-slate-700/40"
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </button>
                );
              })}
            </div>

            {/* 리그 선택 가로 칩: 리그 A - 리그 B - 리그 C - 리그 D */}
            {(selectedTournament === "SPRING" || selectedTournament === "SUMMER") && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-1 border-t border-slate-800/50">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> 리그
                </span>
                {(["A", "B", "C", "D"] as DivisionTier[]).map((tier) => {
                  const label = DIVISION_SHORT_NAMES[tier];
                  const meta = DIVISION_METAS[tier];
                  const isSelected = selectedDivision === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedDivision(tier)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                        isSelected
                          ? `${meta.badgeColor} border font-black`
                          : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
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

          {/* 컵 대회 (MCC/WCC) 16강 토너먼트 리스트 */}
          {currentHistory?.cupResults && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" /> 16강 본선 토너먼트 최종 성적
                </span>
                <span className="text-[11px] text-slate-500">
                  결승전 스코어: {currentHistory.cupResults[0].matchScore ?? "3 - 2"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentHistory.cupResults.map((team) => {
                  const isWinner = team.rank === 1;
                  const isRunner = team.rank === 2;
                  const isSemis = team.rank === 3 || team.rank === 4;

                  return (
                    <div
                      key={team.teamId}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isWinner
                          ? "bg-amber-950/20 border-amber-500/40"
                          : isRunner
                          ? "bg-slate-800/60 border-slate-600/40"
                          : isSemis
                          ? "bg-purple-950/20 border-purple-500/30"
                          : "bg-slate-900/60 border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                            isWinner
                              ? "bg-amber-500 text-slate-950"
                              : isRunner
                              ? "bg-slate-300 text-slate-950"
                              : isSemis
                              ? "bg-purple-600 text-purple-100"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {team.rank}
                        </span>

                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
                            alt={team.teamName}
                            className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 shrink-0 object-contain"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                            {team.shortName[0]}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isWinner ? "text-amber-300" : "text-slate-200"}`}>
                              {team.teamName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({team.shortName})
                            </span>
                          </div>
                          <span className="text-[10px] text-cyan-400 font-semibold">
                            {team.league} 대표
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isWinner
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : isRunner
                              ? "bg-slate-500/20 text-slate-300"
                              : isSemis
                              ? "bg-purple-500/20 text-purple-300"
                              : "text-slate-500"
                          }`}
                        >
                          {team.rankLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
