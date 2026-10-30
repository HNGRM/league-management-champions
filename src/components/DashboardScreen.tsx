"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Newspaper,
  Users,
  Play,
  ChartColumn,
  Trophy,
  Mail,
  Mic,
  Hash,
  Shield,
  User,
  GraduationCap,
  Dumbbell,
  Wallet,
  Layers,
  Ban,
  Target,
  Search,
  CalendarDays,
  ListOrdered,
  ChartBar,
  BookOpen,
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { getTeamLogo } from "@/data/teamLogos";
import { getPlayersByTeamId } from "@/data/players";
import { createInitialLeagueDivisions } from "@/data/divisions";
import MyTeamRosterView from "@/components/dashboard/MyTeamRosterView";
import LeagueStandingsView from "@/components/dashboard/LeagueStandingsView";

// ================= 메인 탭 & 세부 탭 정의 =================
type MainTabId = "NEWS" | "TEAM" | "ANALYSIS" | "LEAGUE";

interface SubTabDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MainTabDef {
  id: MainTabId;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  subTabs: SubTabDef[];
}

const MAIN_TABS: MainTabDef[] = [
  {
    id: "NEWS",
    label: "소식",
    labelEn: "NEWS",
    icon: Newspaper,
    subTabs: [
      { id: "MAIL", label: "메일함", icon: Mail },
      { id: "INTERVIEW", label: "인터뷰", icon: Mic },
      { id: "SNS", label: "SNS", icon: Hash },
    ],
  },
  {
    id: "TEAM",
    label: "팀",
    labelEn: "TEAM",
    icon: Users,
    subTabs: [
      { id: "TEAM_INFO", label: "팀정보", icon: Shield },
      { id: "PLAYERS", label: "선수", icon: User },
      { id: "COACHES", label: "코치", icon: GraduationCap },
      { id: "TRAINING", label: "훈련", icon: Dumbbell },
      { id: "FINANCE", label: "재정", icon: Wallet },
    ],
  },
  {
    id: "ANALYSIS",
    label: "분석",
    labelEn: "ANALYSIS",
    icon: ChartColumn,
    subTabs: [
      { id: "TIER", label: "티어", icon: Layers },
      { id: "BANPICK", label: "밴픽", icon: Ban },
      { id: "STRATEGY", label: "전략", icon: Target },
      { id: "SCOUT", label: "스카우트", icon: Search },
    ],
  },
  {
    id: "LEAGUE",
    label: "리그",
    labelEn: "LEAGUE",
    icon: Trophy,
    subTabs: [
      { id: "SCHEDULE", label: "일정", icon: CalendarDays },
      { id: "STANDINGS", label: "순위", icon: ListOrdered },
      { id: "STATS", label: "통계", icon: ChartBar },
      { id: "RECORDS", label: "기록", icon: BookOpen },
    ],
  },
];

export default function DashboardScreen() {
  const currentTeam = useGameStore((state) => state.currentTeam);
  const selectedTeam = useGameStore((state) => state.selectedTeam);
  const customTeamInfo = useGameStore((state) => state.customTeamInfo);
  const managerProfile = useGameStore((state) => state.managerProfile);
  const currentYear = useGameStore((state) => state.currentYear);
  const currentWeek = useGameStore((state) => state.currentWeek);
  const myPlayers = useGameStore((state) => state.myPlayers);
  const setMyPlayers = useGameStore((state) => state.setMyPlayers);
  const selectedLeague = useGameStore((state) => state.selectedLeague);
  const leagueDivisions = useGameStore((state) => state.leagueDivisions);
  const setLeagueDivisions = useGameStore((state) => state.setLeagueDivisions);
  const currentDivision = useGameStore((state) => state.currentDivision);

  // 대시보드 진입 시 혹시 myPlayers가 비어있고 팀이 선택되어 있다면 기본 로스터 복사 주입
  useEffect(() => {
    if (myPlayers.length === 0) {
      const teamIdToLoad = currentTeam?.id || selectedTeam?.id;
      if (teamIdToLoad) {
        const defaultPlayers = getPlayersByTeamId(teamIdToLoad);
        if (defaultPlayers.length > 0) {
          const cloned = defaultPlayers.map((p) =>
            JSON.parse(JSON.stringify(p))
          );
          setMyPlayers(cloned);
        }
      }
    }
  }, [myPlayers.length, currentTeam?.id, selectedTeam?.id, setMyPlayers]);

  // 대시보드 진입 시 혹시 leagueDivisions가 없다면 기본 4개 디비전 데이터 생성 및 주입
  useEffect(() => {
    if (!leagueDivisions && (currentTeam || selectedTeam)) {
      const activeLeague = selectedLeague || "KCL";
      const teamId = currentTeam?.id || selectedTeam?.id || "TEAM-01";
      const nameKo = customTeamInfo.nameKo || currentTeam?.name || selectedTeam?.nameKo || "새 팀";
      const nameEn = customTeamInfo.nameEn || selectedTeam?.nameEn || "New Team";
      const shortName = customTeamInfo.shortName || currentTeam?.shortName || selectedTeam?.shortName || "NEW";
      const initialDivs = createInitialLeagueDivisions(activeLeague, {
        id: teamId,
        nameKo,
        nameEn,
        shortName,
        customLogoUrl: customTeamInfo.customLogoUrl,
      });
      setLeagueDivisions(initialDivs);
    }
  }, [leagueDivisions, currentTeam, selectedTeam, selectedLeague, customTeamInfo, setLeagueDivisions]);

  // 활성 메인 탭 & 메인 탭별 마지막 세부 탭 기억
  const [activeMainTab, setActiveMainTab] = useState<MainTabId>("NEWS");
  const [activeSubTabs, setActiveSubTabs] = useState<Record<MainTabId, number>>({
    NEWS: 0,
    TEAM: 0,
    ANALYSIS: 0,
    LEAGUE: 0,
  });

  const mainTab = MAIN_TABS.find((t) => t.id === activeMainTab) || MAIN_TABS[0];
  const subIndex = activeSubTabs[activeMainTab];
  const subTabCount = mainTab.subTabs.length;

  const setSubIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(subTabCount - 1, index));
    setActiveSubTabs((prev) => ({ ...prev, [activeMainTab]: clamped }));
  };

  // ================= 세부 탭 가로 드래그(스와이프) 이동 =================
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const SWIPE_THRESHOLD = 55;

  // 양 끝 세부 탭에서는 저항감(rubber band) 적용
  const applyResistance = (diffX: number) => {
    if ((subIndex === 0 && diffX > 0) || (subIndex === subTabCount - 1 && diffX < 0)) {
      return diffX * 0.2;
    }
    return diffX;
  };

  const finishSwipe = (diffX: number) => {
    if (isHorizontalSwipe.current) {
      if (diffX < -SWIPE_THRESHOLD) setSubIndex(subIndex + 1);
      else if (diffX > SWIPE_THRESHOLD) setSubIndex(subIndex - 1);
    }
    setDragOffset(0);
    setIsDragging(false);
    isHorizontalSwipe.current = null;
  };

  // PC 마우스 드래그
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, button, select, textarea, label, .no-swipe")) return;

    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      const diffX = ev.clientX - dragStartX.current;
      const diffY = ev.clientY - dragStartY.current;
      if (isHorizontalSwipe.current === null && (Math.abs(diffX) > 8 || Math.abs(diffY) > 8)) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
      if (isHorizontalSwipe.current) setDragOffset(applyResistance(diffX));
    };

    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      finishSwipe(ev.clientX - dragStartX.current);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // 모바일 터치 스와이프
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diffX = e.touches[0].clientX - dragStartX.current;
    const diffY = e.touches[0].clientY - dragStartY.current;
    if (isHorizontalSwipe.current === null && (Math.abs(diffX) > 6 || Math.abs(diffY) > 6)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
    }
    if (isHorizontalSwipe.current) setDragOffset(applyResistance(diffX));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    finishSwipe(dragOffset);
  };

  // ================= 헤더 정보 =================
  const teamNameKo = customTeamInfo.nameKo || currentTeam?.name || "나의 팀";
  const teamShortName = customTeamInfo.shortName || currentTeam?.shortName || "NEW";
  const teamLogoUrl =
    customTeamInfo.customLogoUrl || (currentTeam ? getTeamLogo(currentTeam.id) : null);
  const managerName =
    managerProfile.nameEn && managerProfile.nameKo
      ? `${managerProfile.nameEn} (${managerProfile.nameKo})`
      : managerProfile.nameEn || managerProfile.nameKo || "감독";

  return (
    <div className="relative z-10 flex-1 flex flex-col justify-between h-full min-h-0 animate-in fade-in duration-200 select-none">
      {/* ================= 1. 상단 고정: 팀 헤더 (Top Anchor) ================= */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {teamLogoUrl ? (
              <div className="w-10 h-10 rounded-xl bg-white border border-cyan-400/60 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <img src={teamLogoUrl} alt={teamNameKo} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-400/60 flex items-center justify-center shrink-0 font-mono font-black text-xs text-cyan-300">
                {teamShortName}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white tracking-tight truncate">
                {teamNameKo}
              </span>
              <span className="text-[10px] text-slate-400 truncate">감독 {managerName}</span>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest">
              {currentYear} SEASON
            </span>
            <span className="text-xs font-bold text-slate-200">{currentWeek}주차</span>
          </div>
        </div>
      </div>

      {/* ================= 2. 상단 세부 탭 바 ================= */}
      <div className="shrink-0 px-4 pb-2">
        <div
          className="grid gap-1 p-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl"
          style={{ gridTemplateColumns: `repeat(${subTabCount}, minmax(0, 1fr))` }}
        >
          {mainTab.subTabs.map((sub, idx) => {
            const Icon = sub.icon;
            const isActive = idx === subIndex;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubIndex(idx)}
                className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 text-xs tracking-tight transition-all duration-150 cursor-pointer touch-manipulation border ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold"
                    : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 font-medium"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 3. 중앙 컨텐츠 (세부 탭 가로 드래그 슬라이더) ================= */}
      <div
        className="flex-1 min-h-0 overflow-hidden relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={activeMainTab}
          className={`flex h-full ${isDragging ? "" : "transition-transform duration-200 ease-out"}`}
          style={{
            width: `${subTabCount * 100}%`,
            transform: `translateX(calc(-${subIndex * (100 / subTabCount)}% + ${
              dragOffset / subTabCount
            }px))`,
          }}
        >
          {mainTab.subTabs.map((sub) => {
            const Icon = sub.icon;
            const isMyTeamPlayersTab =
              mainTab.id === "TEAM" && sub.id === "PLAYERS";
            const isLeagueStandingsTab =
              mainTab.id === "LEAGUE" && sub.id === "STANDINGS";

            return (
              <div
                key={sub.id}
                className="h-full px-4 py-1 overflow-y-auto custom-scrollbar"
                style={{ width: `${100 / subTabCount}%` }}
              >
                {isMyTeamPlayersTab ? (
                  <MyTeamRosterView
                    players={myPlayers}
                    teamId={currentTeam?.id || selectedTeam?.id}
                    league={selectedTeam?.league}
                  />
                ) : isLeagueStandingsTab ? (
                  <LeagueStandingsView
                    divisions={leagueDivisions}
                    currentDivision={currentDivision}
                    playerLeague={selectedLeague || "KCL"}
                  />
                ) : (
                  <div className="h-full min-h-[200px] rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 flex flex-col items-center justify-center gap-2 text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-200">
                      {mainTab.label} · {sub.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {mainTab.labelEn} / {sub.id}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 4. 하단 고정 네비게이션 바 (Bottom Anchor) ================= */}
      <div className="shrink-0 px-3 pt-2 pb-3 border-t border-slate-800/60 bg-slate-950/50 backdrop-blur-sm">
        <div className="grid grid-cols-5 items-end gap-1">
          {[MAIN_TABS[0], MAIN_TABS[1], null, MAIN_TABS[2], MAIN_TABS[3]].map((tab) => {
            // 중앙: ▶ 진행 버튼 (게임 시스템 연동 전까지는 동작 없음)
            if (!tab) {
              return (
                <div key="advance" className="flex justify-center">
                  <button
                    type="button"
                    aria-label="다음 진행"
                    className="-mt-6 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 border-2 border-cyan-200/60 text-white shadow-[0_0_25px_rgba(6,182,212,0.55)] flex items-center justify-center active:scale-95 transition-all cursor-pointer touch-manipulation"
                  >
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </button>
                </div>
              );
            }

            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-150 cursor-pointer touch-manipulation ${
                  isActive ? "text-cyan-300" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    isActive
                      ? "bg-cyan-500/20 border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                      : "bg-transparent border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] ${isActive ? "font-bold" : "font-medium"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
