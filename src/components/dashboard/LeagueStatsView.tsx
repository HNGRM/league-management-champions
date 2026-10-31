"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Users,
  Shield,
  Trophy,
  Search,
  ArrowUpDown,
  Sparkles,
  ChevronDown,
  Check,
  Flame,
  Award,
  Swords,
  Target,
  BarChart2,
  Info,
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { Position, getPositionNameKo } from "@/types/player";
import { DivisionTier, LeagueDivisions, LeagueLanguage } from "@/types/game";
import {
  ChampionStatsSummary,
  ChampionTierGrade,
  CHAMPION_TIER_GRADES,
  PlayerStatsSummary,
  TeamStatsSummary,
} from "@/types/stats";
import {
  generateLeaguePlayerStats,
  generateLeagueTeamStats,
  generateLeagueChampionStats,
} from "@/utils/statsGenerator";
import { getChampionById } from "@/data/champions";
import { getTeamLogo } from "@/data/teamLogos";
import { createInitialLeagueDivisions } from "@/data/divisions";

type StatsTab = "PLAYER" | "TEAM" | "CHAMPION";

type PlayerSortKey = "kda" | "avgKills" | "avgRating" | "mvpCount" | "matchesPlayed";
type TeamSortKey = "kda" | "avgRating" | "firstBloodRate" | "objectiveControlRate" | "avgKills" | "matchesPlayed";
type ChampionSortKey = "pickBanRate" | "winRate" | "pickCount" | "banCount";

const POSITION_FILTERS: { id: "ALL" | Position; label: string }[] = [
  { id: "ALL", label: "전체" },
  { id: "TOP", label: "탑" },
  { id: "JGL", label: "정글" },
  { id: "MID", label: "미드" },
  { id: "BOT", label: "바텀" },
  { id: "SUP", label: "서폿" },
];

interface LeagueStatsViewProps {
  divisions?: LeagueDivisions | null;
  currentDivision?: DivisionTier;
  playerLeague?: LeagueLanguage;
}

export default function LeagueStatsView({
  divisions: propDivisions,
  currentDivision: propDivision,
  playerLeague: propLeague,
}: LeagueStatsViewProps = {}) {
  const storeLeague = useGameStore((state) => state.selectedLeague);
  const selectedLeague = propLeague || storeLeague || "KCL";
  const storeDivision = useGameStore((state) => state.currentDivision);
  const currentDivision = propDivision || storeDivision || "D";
  const currentTeam = useGameStore((state) => state.currentTeam);
  const selectedTeam = useGameStore((state) => state.selectedTeam);
  const customTeamInfo = useGameStore((state) => state.customTeamInfo);
  const myPlayers = useGameStore((state) => state.myPlayers);
  const leagueDivisions = useGameStore((state) => state.leagueDivisions);

  // 플레이어 팀 식별 정보 추출 (커스텀 생성 팀 및 선택 팀 완벽 지원)
  const playerTeamId = currentTeam?.id || selectedTeam?.id || "TEAM-01";
  const playerTeamName = customTeamInfo.nameKo || currentTeam?.name || selectedTeam?.nameKo || "우리 팀";
  const playerTeamLogo = customTeamInfo.customLogoUrl || (currentTeam ? getTeamLogo(currentTeam.id) : null);

  // 현재 열람 중인 디비전 (기본값: 플레이어의 소속 디비전 D)
  const [selectedDivision, setSelectedDivision] = useState<DivisionTier>(currentDivision);

  useEffect(() => {
    if (currentDivision) {
      setSelectedDivision(currentDivision);
    }
  }, [currentDivision]);

  // 상단 3개 메인 탭: "PLAYER" | "TEAM" | "CHAMPION"
  const [activeTab, setActiveTab] = useState<StatsTab>("PLAYER");

  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 선수 통계 필터 및 정렬 상태
  const [playerPosFilter, setPlayerPosFilter] = useState<"ALL" | Position>("ALL");
  const [playerSortKey, setPlayerSortKey] = useState<PlayerSortKey>("kda");

  // 팀 통계 정렬 상태
  const [teamSortKey, setTeamSortKey] = useState<TeamSortKey>("kda");

  // 챔피언 통계 필터 및 정렬 상태 (포지션 기준: 탑-정글-미드-바텀-서폿)
  const [champPosFilter, setChampPosFilter] = useState<"ALL" | Position>("ALL");
  const [champSortKey, setChampSortKey] = useState<ChampionSortKey>("pickBanRate");

  // 챔피언 커스텀 티어 수정 팝오버 상태
  const [editingChampId, setEditingChampId] = useState<string | null>(null);
  const tierDropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 티어 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tierDropdownRef.current &&
        !tierDropdownRef.current.contains(e.target as Node)
      ) {
        setEditingChampId(null);
      }
    };
    if (editingChampId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingChampId]);

  // 순위표 데이터: propDivisions -> leagueDivisions -> 없으면 즉시 createInitialLeagueDivisions 생성
  const activeDivisions = useMemo(() => {
    if (propDivisions) return propDivisions;
    if (leagueDivisions) return leagueDivisions;
    return createInitialLeagueDivisions(selectedLeague as LeagueLanguage, {
      id: playerTeamId,
      nameKo: playerTeamName,
      nameEn: customTeamInfo.nameEn || selectedTeam?.nameEn || "New Team",
      shortName: customTeamInfo.shortName || currentTeam?.shortName || selectedTeam?.shortName || "NEW",
      customLogoUrl: playerTeamLogo,
    });
  }, [propDivisions, leagueDivisions, selectedLeague, playerTeamId, playerTeamName, customTeamInfo, selectedTeam, currentTeam, playerTeamLogo]);

  // 1. 선수 통계 데이터 (선택한 디비전의 실제 순위표 팀 연동)
  const currentDivisionStandings = activeDivisions
    ? activeDivisions[selectedDivision]
    : undefined;

  const initialPlayerStats = useMemo(() => {
    return generateLeaguePlayerStats(
      selectedLeague,
      selectedDivision,
      playerTeamId,
      playerTeamName,
      myPlayers,
      currentDivisionStandings
    );
  }, [selectedLeague, selectedDivision, playerTeamId, playerTeamName, myPlayers, currentDivisionStandings]);

  // 2. 팀 통계 데이터 (선택한 디비전의 실제 순위표 팀 연동)
  const teamStats = useMemo(() => {
    return generateLeagueTeamStats(
      selectedLeague,
      selectedDivision,
      playerTeamId,
      playerTeamName,
      currentDivisionStandings,
      playerTeamLogo
    );
  }, [selectedLeague, selectedDivision, playerTeamId, playerTeamName, currentDivisionStandings, playerTeamLogo]);

  // 3. 챔피언 통계 데이터 (엔진 함수 연동 & 티어 수정 상태 보존)
  const [championStats, setChampionStats] = useState<ChampionStatsSummary[]>([]);

  useEffect(() => {
    setChampionStats(generateLeagueChampionStats());
  }, []);

  // 챔피언 커스텀 티어 변경 핸들러
  const handleUpdateTier = (championId: string, newTier: ChampionTierGrade) => {
    setChampionStats((prev) =>
      prev.map((c) =>
        c.championId === championId ? { ...c, customTier: newTier } : c
      )
    );
    setEditingChampId(null);
  };

  // 필터 및 정렬된 선수 목록
  const filteredPlayers = useMemo(() => {
    let result = [...initialPlayerStats];

    if (playerPosFilter !== "ALL") {
      result = result.filter((p) => p.position === playerPosFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.playerName.toLowerCase().includes(q) ||
          p.teamName.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => b[playerSortKey] - a[playerSortKey]);
    return result;
  }, [initialPlayerStats, playerPosFilter, playerSortKey, searchQuery]);

  // 필터 및 정렬된 팀 목록
  const filteredTeams = useMemo(() => {
    let result = [...teamStats];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((t) => t.teamName.toLowerCase().includes(q));
    }

    result.sort((a, b) => b[teamSortKey] - a[teamSortKey]);
    return result;
  }, [teamStats, teamSortKey, searchQuery]);

  // 필터 및 정렬된 챔피언 목록 (포지션 필터 적용)
  const filteredChampions = useMemo(() => {
    let result = [...championStats];

    if (champPosFilter !== "ALL") {
      result = result.filter((c) => c.positions?.includes(champPosFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.nameKr.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => b[champSortKey] - a[champSortKey]);
    return result;
  }, [championStats, champPosFilter, champSortKey, searchQuery]);

  // 티어 뱃지 스타일 헬퍼
  const getTierBadgeStyle = (tier: ChampionTierGrade) => {
    switch (tier) {
      case "OP":
        return "bg-purple-950/80 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.35)]";
      case "1티어":
        return "bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.35)]";
      case "2티어":
        return "bg-blue-950/80 text-blue-300 border-blue-500/50";
      case "3티어":
        return "bg-slate-900/90 text-slate-400 border-slate-700/60";
      case "함정픽":
        return "bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.35)]";
      default:
        return "bg-slate-900 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full pb-8 select-none animate-in fade-in duration-200">
      {/* ================= 1. 상단 컨트롤 패널 ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-md flex flex-col gap-2">
        {/* Row 1: 3개 메인 탭 전환 버튼 (전체 너비 3등분 그리드) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 border border-slate-800/90 rounded-xl p-1 shadow-inner w-full">
          <button
            type="button"
            onClick={() => {
              setActiveTab("PLAYER");
              setSearchQuery("");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PLAYER"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>선수 통계</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("TEAM");
              setSearchQuery("");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "TEAM"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>팀 통계</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("CHAMPION");
              setSearchQuery("");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "CHAMPION"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>챔피언 통계</span>
          </button>
        </div>

        {/* Row 2: 검색창 & 디비전 선택 & 정렬 드롭다운 */}
        <div className="flex items-center gap-2 w-full">
          {/* 검색창 */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "PLAYER"
                  ? "선수 또는 팀 검색..."
                  : activeTab === "TEAM"
                  ? "팀 이름 검색..."
                  : "챔피언 검색..."
              }
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/60 transition-colors shadow-inner font-sans"
            />
          </div>

          {/* 선수 탭인 경우 디비전 선택기 */}
          {activeTab === "PLAYER" && (
            <div className="flex items-center gap-1 shrink-0">
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value as DivisionTier)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-2 py-1.5 text-xs font-bold text-amber-300 outline-none focus:border-cyan-500/60 cursor-pointer shadow-inner"
              >
                <option value="A">1부 (A)</option>
                <option value="B">2부 (B)</option>
                <option value="C">3부 (C)</option>
                <option value="D">4부 (D){currentDivision === "D" ? " ★" : ""}</option>
              </select>
            </div>
          )}

          {/* 정렬 드롭다운 */}
          <div className="flex items-center gap-1 shrink-0">
            {activeTab === "PLAYER" && (
              <select
                value={playerSortKey}
                onChange={(e) => setPlayerSortKey(e.target.value as PlayerSortKey)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-500/60 cursor-pointer shadow-inner"
              >
                <option value="kda">KDA순</option>
                <option value="avgKills">킬순</option>
                <option value="avgRating">평점순</option>
                <option value="mvpCount">MVP순</option>
                <option value="matchesPlayed">경기수순</option>
              </select>
            )}

            {activeTab === "TEAM" && (
              <select
                value={teamSortKey}
                onChange={(e) => setTeamSortKey(e.target.value as TeamSortKey)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-500/60 cursor-pointer shadow-inner"
              >
                <option value="kda">KDA순</option>
                <option value="avgRating">평점순</option>
                <option value="firstBloodRate">선취점률순</option>
                <option value="objectiveControlRate">오브젝트율순</option>
                <option value="avgKills">킬순</option>
                <option value="matchesPlayed">경기수순</option>
              </select>
            )}

            {activeTab === "CHAMPION" && (
              <select
                value={champSortKey}
                onChange={(e) => setChampSortKey(e.target.value as ChampionSortKey)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-500/60 cursor-pointer shadow-inner"
              >
                <option value="pickBanRate">밴픽률순</option>
                <option value="winRate">승률순</option>
                <option value="pickCount">픽순</option>
                <option value="banCount">밴순</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ================= 2. 서브 필터 탭 (포지션 / 디비전 / 역할군) ================= */}
      {activeTab === "PLAYER" && (
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-1 overflow-x-auto custom-scrollbar">
          {POSITION_FILTERS.map((tab) => {
            const isActive = playerPosFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPlayerPosFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-800 text-cyan-300 border border-cyan-400/40 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          <div className="ml-auto text-[11px] font-mono text-slate-500 pr-2 shrink-0">
            총 {filteredPlayers.length}명
          </div>
        </div>
      )}

      {activeTab === "TEAM" && (
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-1 overflow-x-auto custom-scrollbar">
          {(["A", "B", "C", "D"] as DivisionTier[]).map((tier) => {
            const isActive = selectedDivision === tier;
            const isMyDiv = tier === currentDivision;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedDivision(tier)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-800 text-cyan-300 border border-cyan-400/40 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {tier}부 리그{isMyDiv ? " (소속)" : ""}
              </button>
            );
          })}
          <div className="ml-auto text-[11px] font-mono text-slate-500 pr-2 shrink-0">
            총 {filteredTeams.length}팀
          </div>
        </div>
      )}

      {activeTab === "CHAMPION" && (
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800/80 rounded-xl p-1 overflow-x-auto custom-scrollbar">
          {POSITION_FILTERS.map((tab) => {
            const isActive = champPosFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChampPosFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-800 text-cyan-300 border border-cyan-400/40 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          <div className="ml-auto text-[11px] font-mono text-slate-500 pr-2 shrink-0">
            총 {filteredChampions.length}개
          </div>
        </div>
      )}

      {/* ================= 3. 메인 데이터 테이블 영역 ================= */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md overflow-hidden flex flex-col">
        {/* [A] 선수 통계 테이블 */}
        {activeTab === "PLAYER" && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                  <th className="py-2 px-1 text-center w-7">#</th>
                  <th className="py-2 px-2">선수</th>
                  <th className="py-2 px-1.5 text-center">KDA</th>
                  <th className="py-2 px-1.5 text-center">평점 / MVP</th>
                  <th className="py-2 px-2 text-center w-20">모스트픽</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                      조회된 선수가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player, idx) => {
                    const isMyPlayer = player.isPlayerTeam || (playerTeamId ? player.teamId === playerTeamId : false);
                    const rank = idx + 1;

                    // KDA 색상 분기
                    const kdaColor =
                      player.kda >= 5.0
                        ? "text-amber-400 font-black"
                        : player.kda >= 3.8
                        ? "text-cyan-300 font-bold"
                        : "text-slate-300";

                    return (
                      <tr
                        key={player.playerId}
                        className={`transition-colors hover:bg-slate-800/50 ${
                          isMyPlayer ? "bg-cyan-950/25 font-semibold" : ""
                        }`}
                      >
                        {/* 순위 */}
                        <td className="py-2 px-1 text-center font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/50 text-[10px]">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-300/20 text-slate-200 font-black border border-slate-400/50 text-[10px]">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-700/20 text-amber-500 font-black border border-amber-700/50 text-[10px]">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">{rank}</span>
                          )}
                        </td>

                        {/* 선수 정보 (포지션 뱃지 + 닉네임 / 소속 팀 · 경기수) */}
                        <td className="py-2 px-2">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-slate-800 border border-slate-700 text-cyan-300 shrink-0">
                                {getPositionNameKo(player.position)}
                              </span>
                              <span
                                className={`truncate tracking-tight font-sans text-xs ${
                                  isMyPlayer
                                    ? "text-cyan-300 font-bold"
                                    : "text-slate-200 font-semibold"
                                }`}
                              >
                                {player.playerName}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans flex items-center gap-1">
                              <span className={isMyPlayer ? "text-cyan-400/90 font-medium" : ""}>
                                {player.teamName}
                              </span>
                              <span className="text-slate-600">·</span>
                              <span className="font-mono text-slate-400">{player.matchesPlayed}G</span>
                            </div>
                          </div>
                        </td>

                        {/* KDA & K / D / A */}
                        <td className="py-2 px-1.5 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-xs ${kdaColor}`}>
                              {player.kda.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5 font-mono">
                              <span className="text-slate-200">{player.avgKills}</span>
                              <span className="text-slate-600">/</span>
                              <span className="text-rose-400">{player.avgDeaths}</span>
                              <span className="text-slate-600">/</span>
                              <span className="text-slate-300">{player.avgAssists}</span>
                            </span>
                          </div>
                        </td>

                        {/* 평점 & MVP */}
                        <td className="py-2 px-1.5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-amber-300 font-bold text-xs">
                              ★ {player.avgRating.toFixed(2)}
                            </span>
                            <span className="mt-0.5">
                              {player.mvpCount > 0 ? (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                  MVP {player.mvpCount}
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[10px]">-</span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* 모스트픽 TOP 3 (가로 20x20 초상화 + 호버 툴팁) */}
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {player.mostPicks.map((pick, i) => {
                              const champ = getChampionById(pick.championId);
                              if (!champ) return null;
                              return (
                                <div
                                  key={`${champ.id}-${i}`}
                                  className="relative group inline-block"
                                >
                                  {/* 챔피언 1:1 초상화 */}
                                  <div className="w-5 h-5 rounded overflow-hidden border border-slate-700 bg-slate-950 group-hover:border-cyan-400 transition-colors shadow-xs">
                                    <Image
                                      src={champ.images.portrait}
                                      alt={champ.nameKr}
                                      width={20}
                                      height={20}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  {/* 호버 시 툴팁: [챔피언명: X전 Y승 (Z%)] */}
                                  <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                                    <div className="px-2 py-1 rounded-md bg-slate-950/95 border border-cyan-500/50 shadow-2xl text-[10px] text-white font-mono whitespace-nowrap leading-tight backdrop-blur-md">
                                      <span className="font-bold text-cyan-300 font-sans">
                                        {champ.nameKr}
                                      </span>
                                      : {pick.games}전 {Math.round((pick.games * pick.winRate) / 100)}승 ({pick.winRate}%)
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-slate-950 border-r border-b border-cyan-500/50 rotate-45 -mt-1" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* [B] 팀 통계 테이블 */}
        {activeTab === "TEAM" && (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                  <th className="py-2 px-1 text-center w-7">#</th>
                  <th className="py-2 px-2">팀</th>
                  <th className="py-2 px-1.5 text-center">KDA</th>
                  <th className="py-2 px-1 text-center w-14">평점</th>
                  <th className="py-2 px-1.5 text-center w-16">선취점</th>
                  <th className="py-2 px-1.5 text-center w-16">오브젝트</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                      조회된 팀이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team, idx) => {
                    const isMyTeam = team.isPlayer || (playerTeamId ? team.teamId === playerTeamId : false);
                    const rank = idx + 1;
                    const teamLogoSrc = team.teamLogo || (isMyTeam ? playerTeamLogo : null);

                    return (
                      <tr
                        key={team.teamId}
                        className={`transition-colors hover:bg-slate-800/50 ${
                          isMyTeam ? "bg-cyan-950/25 font-semibold" : ""
                        }`}
                      >
                        {/* 순위 */}
                        <td className="py-2 px-1 text-center font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/50 text-[10px]">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-300/20 text-slate-200 font-black border border-slate-400/50 text-[10px]">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-700/20 text-amber-500 font-black border border-amber-700/50 text-[10px]">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">{rank}</span>
                          )}
                        </td>

                        {/* 팀명 (로고 + 이름 + MY / 경기수) */}
                        <td className="py-2 px-2 font-sans">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {teamLogoSrc ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={teamLogoSrc}
                                  alt={team.teamName}
                                  className="w-4 h-4 rounded object-contain shrink-0"
                                />
                              ) : (
                                <div className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center text-[9px] shrink-0 font-bold">
                                  🛡️
                                </div>
                              )}
                              <span
                                className={`truncate text-xs ${
                                  isMyTeam ? "text-cyan-300 font-bold" : "text-white font-semibold"
                                }`}
                              >
                                {team.teamName}
                              </span>
                              {isMyTeam && (
                                <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                                  MY
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                              {team.matchesPlayed}경기 진행
                            </div>
                          </div>
                        </td>

                        {/* KDA & K / D / A */}
                        <td className="py-2 px-1.5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-cyan-300">
                              {team.kda.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5 font-mono">
                              <span className="text-slate-200">{team.avgKills}</span>
                              <span className="text-slate-600">/</span>
                              <span className="text-rose-400">{team.avgDeaths}</span>
                              <span className="text-slate-600">/</span>
                              <span className="text-slate-300">{team.avgAssists}</span>
                            </span>
                          </div>
                        </td>

                        {/* 평균 평점 */}
                        <td className="py-2 px-1 text-center">
                          <span className="text-amber-300 font-bold text-xs whitespace-nowrap">
                            ★ {team.avgRating.toFixed(2)}
                          </span>
                        </td>

                        {/* 선취점 획득률 (FB%) + 미니 바 */}
                        <td className="py-2 px-1.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] font-bold text-slate-200">
                              {team.firstBloodRate}%
                            </span>
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                style={{ width: `${team.firstBloodRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 오브젝트 제어율 (OBJ%) + 미니 바 */}
                        <td className="py-2 px-1.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] font-bold text-slate-200">
                              {team.objectiveControlRate}%
                            </span>
                            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                style={{ width: `${team.objectiveControlRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* [C] 챔피언 통계 테이블 */}
        {activeTab === "CHAMPION" && (
          <div className="overflow-x-auto custom-scrollbar" ref={tierDropdownRef}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                  <th className="py-2 px-1 text-center w-7">#</th>
                  <th className="py-2 px-2">챔피언</th>
                  <th className="py-2 px-1 text-center w-20">구단 티어</th>
                  <th className="py-2 px-1.5 text-center w-20">승률</th>
                  <th className="py-2 px-1.5 text-center w-20">밴픽률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {filteredChampions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                      조회된 챔피언이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredChampions.map((champ, idx) => {
                    const rank = idx + 1;
                    const isDropdownOpen = editingChampId === champ.championId;

                    // 승률 색상 분기
                    const winRateColor =
                      champ.winRate >= 58.0
                        ? "text-emerald-400 font-bold"
                        : champ.winRate < 42.0
                        ? "text-rose-400 font-bold"
                        : "text-slate-200";

                    return (
                      <tr
                        key={champ.championId}
                        className="transition-colors hover:bg-slate-800/50"
                      >
                        {/* 순위 */}
                        <td className="py-2 px-1 text-center font-bold text-slate-500 text-[11px]">
                          {rank}
                        </td>

                        {/* 챔피언 정보 (1:1 초상화 + 한글명 + 영문/역할 태그) */}
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 shadow-sm">
                              <Image
                                src={champ.portrait}
                                alt={champ.nameKr}
                                width={28}
                                height={28}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-sans font-bold text-white text-xs truncate">
                                {champ.nameKr}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span className="font-mono text-slate-500 truncate max-w-[55px]">
                                  {champ.nameEn}
                                </span>
                                <span>·</span>
                                <span className="text-cyan-400/90 font-sans font-medium">
                                  {champ.positions && champ.positions.length > 0
                                    ? champ.positions.map((p) => getPositionNameKo(p)).join("/")
                                    : champ.primaryRole}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 구단 선정 티어 (수정 가능한 드롭다운 뱃지) */}
                        <td className="py-2 px-1 text-center relative">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingChampId(isDropdownOpen ? null : champ.championId)
                            }
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border inline-flex items-center gap-1 cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-xs ${getTierBadgeStyle(
                              champ.customTier
                            )}`}
                            title="클릭하여 구단 선정 티어 변경"
                          >
                            <span>{champ.customTier}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                          </button>

                          {/* 티어 선택 팝오버 드롭다운 */}
                          {isDropdownOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-slate-950/95 border border-slate-700 rounded-xl p-1 shadow-2xl flex flex-col gap-0.5 min-w-[95px] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 font-sans">
                              {CHAMPION_TIER_GRADES.map((tier) => (
                                <button
                                  key={tier}
                                  type="button"
                                  onClick={() =>
                                    handleUpdateTier(champ.championId, tier)
                                  }
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold text-left transition-colors flex items-center justify-between cursor-pointer ${
                                    champ.customTier === tier
                                      ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40"
                                      : "text-slate-300 hover:bg-slate-850 hover:text-white"
                                  }`}
                                >
                                  <span>{tier}</span>
                                  {champ.customTier === tier && (
                                    <Check className="w-3 h-3 text-cyan-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* 승률 & 전적 */}
                        <td className="py-2 px-1.5 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-xs ${winRateColor}`}>
                              {champ.winRate.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5 font-mono">
                              <span className="text-emerald-400">{champ.wins}승</span>
                              <span className="text-slate-600 mx-0.5">-</span>
                              <span className="text-rose-400">{champ.losses}패</span>
                            </span>
                          </div>
                        </td>

                        {/* 밴픽률 & 픽/밴 횟수 */}
                        <td className="py-2 px-1.5 text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-xs font-bold ${
                                champ.pickBanRate >= 70.0
                                  ? "text-cyan-300 font-black"
                                  : champ.pickBanRate >= 40.0
                                  ? "text-white"
                                  : "text-slate-400"
                              }`}
                            >
                              {champ.pickBanRate.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5 font-mono">
                              P {champ.pickCount} · B {champ.banCount}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 안내 캡션 바 */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-500/70" />
          <span>
            {activeTab === "PLAYER" && "선수 통계는 이번 시즌 디비전 공식 경기 출전 기록 기준입니다."}
            {activeTab === "TEAM" && "팀 통계는 이번 시즌 누적 팀 지표 및 오브젝트 컨트롤 데이터입니다."}
            {activeTab === "CHAMPION" && "구단 선정 티어는 감독과 코칭스태프가 직접 변경하여 밴픽 전략에 반영할 수 있습니다."}
          </span>
        </div>
        <span className="font-mono text-slate-600 shrink-0">
          {selectedLeague} · 디비전 {selectedDivision}
        </span>
      </div>
    </div>
  );
}
