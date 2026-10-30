"use client";

import React, { useState } from "react";
import { Trophy, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { DivisionTier, LeagueDivisions, TeamStanding } from "@/types/game";
import { DIVISION_METAS } from "@/data/divisions";

interface LeagueStandingsViewProps {
  divisions: LeagueDivisions | null;
  currentDivision?: DivisionTier;
  leagueName?: string;
}

const TIER_ORDER: DivisionTier[] = ["A", "B", "C", "D"];

export default function LeagueStandingsView({
  divisions,
  currentDivision = "D",
  leagueName = "챔피언스 리그",
}: LeagueStandingsViewProps) {
  // 사용자가 열람 중인 디비전 탭 (기본값: 플레이어의 현재 소속 리그, 예: 리그 D)
  const [selectedTier, setSelectedTier] = useState<DivisionTier>(currentDivision);

  // 소속 디비전 정보가 변경되거나 로드될 때 내 소속 리그로 자동 동기화
  React.useEffect(() => {
    if (currentDivision) {
      setSelectedTier(currentDivision);
    }
  }, [currentDivision]);

  if (!divisions) {
    return (
      <div className="h-full min-h-[260px] rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <Trophy className="w-8 h-8 text-slate-600 animate-pulse" />
        <span className="text-sm font-bold text-slate-400">
          리그 순위 정보를 불러오는 중입니다...
        </span>
      </div>
    );
  }

  const activeMeta = DIVISION_METAS[selectedTier];
  const standings: TeamStanding[] = divisions[selectedTier] || [];

  return (
    <div className="flex flex-col gap-3 pb-6 select-none">
      {/* 1. 디비전 전환 탭 바 (A -> B -> C -> D) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-1.5 flex gap-1">
        {TIER_ORDER.map((tier) => {
          const meta = DIVISION_METAS[tier];
          const isSelected = selectedTier === tier;
          const isMyDivision = currentDivision === tier;

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

      {/* 2. 현재 선택된 디비전 메타 배너 */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex flex-col gap-1.5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-md font-mono font-black text-[11px] border ${activeMeta.badgeColor}`}
            >
              {activeMeta.name}
            </span>
            <span className="text-xs font-bold text-white tracking-tight truncate">
              {leagueName} · {activeMeta.subName}
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

      {/* 3. 공식 순위표 테이블 (Standings Table) */}
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
                  team.isPlayer
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

                  {/* 팀명 및 내 팀 배지 */}
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span
                      className={`text-xs font-bold truncate ${
                        team.isPlayer ? "text-cyan-200" : "text-white"
                      }`}
                    >
                      {team.teamName}
                    </span>
                    {team.isPlayer && (
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

      {/* 4. 안내 문구 */}
      <div className="px-2 text-[10px] text-slate-500 font-medium flex items-center justify-between">
        <span>※ 정규 시즌 매치 결과에 따라 순위가 실시간 갱신됩니다.</span>
        <span className="font-mono text-slate-600">동률 시: 득실차 ➔ 승자승 순</span>
      </div>
    </div>
  );
}
