"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trophy, ArrowUpRight, ArrowDownRight, Sparkles, ChevronDown, Check, Globe } from "lucide-react";
import { DivisionTier, LeagueDivisions, LeagueLanguage, TeamStanding } from "@/types/game";
import { DIVISION_METAS, REGIONAL_LEAGUES, getAiLeagueDivisions } from "@/data/divisions";

interface LeagueStandingsViewProps {
  divisions: LeagueDivisions | null;
  currentDivision?: DivisionTier;
  playerLeague?: LeagueLanguage;
}

const TIER_ORDER: DivisionTier[] = ["A", "B", "C", "D"];

export default function LeagueStandingsView({
  divisions,
  currentDivision = "D",
  playerLeague = "KCL",
}: LeagueStandingsViewProps) {
  // 열람 중인 지역 리그 (기본값: 플레이어의 소속 지역 리그)
  const [selectedLeagueCode, setSelectedLeagueCode] = useState<LeagueLanguage>(playerLeague);
  // 열람 중인 디비전 탭 (기본값: 플레이어의 소속 디비전 D)
  const [selectedTier, setSelectedTier] = useState<DivisionTier>(currentDivision);
  // 드롭다운 열림/닫힘 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // 플레이어 소속 리그 변경 시 동기화
  useEffect(() => {
    if (playerLeague) {
      setSelectedLeagueCode(playerLeague);
    }
  }, [playerLeague]);

  // 플레이어 소속 디비전 변경 시 동기화
  useEffect(() => {
    if (currentDivision) {
      setSelectedTier(currentDivision);
    }
  }, [currentDivision]);

  // 현재 열람 중인 리그가 플레이어 소속 리그인지 여부
  const isViewingPlayerLeague = selectedLeagueCode === playerLeague;

  // 현재 열람 중인 리그의 4개 디비전 데이터 (플레이어 소속이면 실제 저장된 divisions, 타 리그면 AI divisions)
  const activeDivisions = isViewingPlayerLeague && divisions
    ? divisions
    : getAiLeagueDivisions(selectedLeagueCode);

  const activeLeagueInfo =
    REGIONAL_LEAGUES.find((l) => l.code === selectedLeagueCode) || REGIONAL_LEAGUES[0];
  const activeMeta = DIVISION_METAS[selectedTier];
  const standings: TeamStanding[] = activeDivisions ? activeDivisions[selectedTier] || [] : [];

  const handleSelectLeague = (code: LeagueLanguage) => {
    setSelectedLeagueCode(code);
    setIsDropdownOpen(false);
    // 내 소속 지역으로 돌아왔을 때는 내 소속 디비전(D)으로 자동 선택
    if (code === playerLeague) {
      setSelectedTier(currentDivision || "D");
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-6 select-none">
      {/* 1. 지역 리그 선택 드롭다운 (A/B/C/D 탭 상단) */}
      <div className="relative z-30" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className="w-full bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-2.5 flex items-center justify-between transition-all duration-150 cursor-pointer shadow-sm group touch-manipulation"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* 리그 로고 썸네일 */}
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-700/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeLeagueInfo.logoUrl}
                alt={activeLeagueInfo.code}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                  {activeLeagueInfo.koreanName}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-400">
                  ({activeLeagueInfo.code})
                </span>
                {isViewingPlayerLeague && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-[9px] shrink-0">
                    내 소속 지역
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate">
                {activeLeagueInfo.region} · 총 30개 팀 참가
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 text-slate-400 group-hover:text-cyan-400 shrink-0">
            <span className="text-[11px] font-medium hidden sm:inline">리그 변경</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-cyan-400" : ""
              }`}
            />
          </div>
        </button>

        {/* 드롭다운 메뉴 팝오버 */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-1.5 flex flex-col gap-1 z-40 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="px-2.5 py-1 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 border-b border-slate-800/80 pb-1.5 mb-0.5">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                지역 리그 선택 (5개 지역)
              </span>
              <span className="text-[9px] text-slate-400">전 세계 150개 팀</span>
            </div>

            {REGIONAL_LEAGUES.map((league) => {
              const isSelected = league.code === selectedLeagueCode;
              const isHome = league.code === playerLeague;

              return (
                <button
                  key={league.code}
                  type="button"
                  onClick={() => handleSelectLeague(league.code)}
                  className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer touch-manipulation ${
                    isSelected
                      ? "bg-cyan-500/15 border border-cyan-400/50 text-cyan-100 shadow-xs"
                      : "hover:bg-slate-900 border border-transparent text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-700/80 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={league.logoUrl}
                        alt={league.code}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">
                          {league.koreanName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ({league.code})
                        </span>
                        {isHome && (
                          <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-bold border border-cyan-500/30">
                            내 소속
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate">
                        {league.region}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. 디비전 전환 탭 바 (A -> B -> C -> D) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-1.5 flex gap-1 z-10">
        {TIER_ORDER.map((tier) => {
          const meta = DIVISION_METAS[tier];
          const isSelected = selectedTier === tier;
          const isMyDivision = isViewingPlayerLeague && currentDivision === tier;

          return (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`flex-1 py-2 px-1.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 cursor-pointer touch-manipulation relative border ${
                isSelected
                  ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold"
                  : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50 font-medium"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-black">{meta.name}</span>
                {isMyDivision && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 scale-95">{meta.subName.split(" ")[0]}</span>

              {isMyDivision && (
                <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded bg-cyan-500 text-slate-950 text-[8px] font-black shadow tracking-tighter">
                  내 소속
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. 현재 선택된 디비전 메타 배너 */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col gap-1.5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-md font-mono font-black text-[11px] border ${activeMeta.badgeColor}`}
            >
              {activeMeta.name}
            </span>
            <span className="text-xs font-bold text-white tracking-tight truncate">
              {activeLeagueInfo.koreanName} · {activeMeta.subName}
            </span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 shrink-0">
            {activeMeta.teamCount}팀 참가
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          {activeMeta.description}
        </p>

        {/* 승격 / 강등 안내 뱃지 */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 text-[10px] flex-wrap">
          {selectedTier === "D" && (
            <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              1~2위: 리그 C 승격 플레이오프 진출
            </span>
          )}
          {selectedTier === "C" && (
            <>
              <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                1~2위: 리그 B 승격
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-rose-400 flex items-center gap-0.5 font-medium">
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
                5~6위: 리그 D 강등
              </span>
            </>
          )}
          {selectedTier === "B" && (
            <>
              <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                1~2위: 리그 A 승격
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-rose-400 flex items-center gap-0.5 font-medium">
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
                7~8위: 리그 C 강등
              </span>
            </>
          )}
          {selectedTier === "A" && (
            <>
              <span className="text-amber-300 flex items-center gap-0.5 font-medium">
                <Sparkles className="w-3 h-3 text-amber-300" />
                1~4위: 챔피언십 PO (월드 진출전)
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-rose-400 flex items-center gap-0.5 font-medium">
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
                9~10위: 리그 B 강등
              </span>
            </>
          )}
        </div>
      </div>

      {/* 4. 공식 순위표 테이블 (Standings Table) */}
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
          {standings.map((team, idx) => {
            const isMyTeam = isViewingPlayerLeague && team.isPlayer;

            const isPromotionZone =
              (selectedTier === "D" && idx < 2) ||
              (selectedTier === "C" && idx < 2) ||
              (selectedTier === "B" && idx < 2) ||
              (selectedTier === "A" && idx < 4);

            const isRelegationZone =
              (selectedTier === "C" && idx >= 4) ||
              (selectedTier === "B" && idx >= 6) ||
              (selectedTier === "A" && idx >= 8);

            return (
              <div
                key={team.teamId}
                className={`grid grid-cols-12 px-3 py-2.5 items-center transition-colors relative ${
                  isMyTeam
                    ? "bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-900/80 border-l-4 border-l-cyan-400"
                    : isPromotionZone
                    ? "hover:bg-slate-900/40 border-l-2 border-l-emerald-500/70"
                    : isRelegationZone
                    ? "hover:bg-slate-900/40 border-l-2 border-l-rose-500/70"
                    : "hover:bg-slate-900/40 border-l-2 border-l-transparent"
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
                    {team.rank}
                  </span>
                </div>

                {/* 2. 팀 정보 (로고 + 이름 + 배지) */}
                <div className="col-span-6 flex items-center gap-2 min-w-0 pl-1 pr-1">
                  {/* 팀 로고 */}
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

                  {/* 팀명 및 내 팀 배지 (영문이름 (한글이름) 포맷) */}
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span
                      className={`text-xs font-bold truncate ${
                        isMyTeam ? "text-cyan-200" : "text-white"
                      }`}
                    >
                      {team.teamNameEn && team.teamNameEn !== team.teamName
                        ? `${team.teamNameEn} (${team.teamName})`
                        : team.teamName}
                    </span>
                    {isMyTeam && (
                      <span className="px-1 py-0.2 rounded bg-cyan-400 text-slate-950 font-black text-[9px] shrink-0 shadow">
                        MY
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. 경기수 */}
                <div className="col-span-1 text-center font-mono text-xs text-slate-400">
                  {team.matchesPlayed}
                </div>

                {/* 4. 승 */}
                <div className="col-span-1 text-center font-mono text-xs font-bold text-cyan-300">
                  {team.wins}
                </div>

                {/* 5. 패 */}
                <div className="col-span-1 text-center font-mono text-xs font-bold text-rose-300">
                  {team.losses}
                </div>

                {/* 6. 승률 */}
                <div className="col-span-1 text-center font-mono text-[11px] text-slate-300">
                  {team.winRate}%
                </div>

                {/* 7. 득실 */}
                <div className="col-span-1 text-center font-mono text-[11px] text-slate-400">
                  {team.points > 0 ? `+${team.points}` : team.points}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 안내 문구 */}
      <div className="px-2 text-[10px] text-slate-400 font-medium flex items-center justify-between">
        <span>※ 정규 시즌 매치 결과에 따라 순위가 실시간 갱신됩니다.</span>
        <span className="font-mono text-slate-400">동률 시: 득실차 ➔ 승자승 순</span>
      </div>
    </div>
  );
}
