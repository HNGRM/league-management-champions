"use client";

import React, { useMemo } from "react";
import { Users, AlertCircle } from "lucide-react";
import { Player, Position } from "@/types/player";
import { getPlayerTraitById } from "@/data/playerTraits";
import { formatEokParts } from "@/utils/format";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";

interface MyTeamRosterViewProps {
  players: Player[];
  teamId?: string | null;
  league?: string | null;
}

const POSITION_ORDER: Record<Position, number> = {
  TOP: 0,
  JGL: 1,
  MID: 2,
  BOT: 3,
  SUP: 4,
};

export default function MyTeamRosterView({
  players,
  teamId,
  league,
}: MyTeamRosterViewProps) {
  // 주전 우선 -> 포지션 TOP, JGL, MID, BOT, SUP 순 정렬
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const statusOrderA = a.contractAndRole.rosterStatus === "Starter" ? 0 : 1;
      const statusOrderB = b.contractAndRole.rosterStatus === "Starter" ? 0 : 1;
      if (statusOrderA !== statusOrderB) {
        return statusOrderA - statusOrderB;
      }
      const posA = POSITION_ORDER[a.contractAndRole.mainPos] ?? 99;
      const posB = POSITION_ORDER[b.contractAndRole.mainPos] ?? 99;
      return posA - posB;
    });
  }, [players]);

  const starterCount = useMemo(
    () =>
      sortedPlayers.filter((p) => p.contractAndRole.rosterStatus === "Starter")
        .length,
    [sortedPlayers]
  );
  const subCount = sortedPlayers.length - starterCount;

  if (sortedPlayers.length === 0) {
    return (
      <div className="h-full min-h-[260px] rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center gap-2.5 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-300">
          등록된 팀 선수가 없습니다.
        </p>
        <p className="text-xs text-slate-500">
          스카우트나 이적 시장을 통해 선수를 영입해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 pb-4 select-none">
      {/* 선수단 통계 요약 바 */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shrink-0 shadow-sm">
        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-cyan-400" />
          선수단 로스터 ({sortedPlayers.length}인)
        </span>
        <span className="text-[10px] font-mono text-cyan-400/90 font-bold px-2 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-800/40">
          STARTER {starterCount} · SUB {subCount}
        </span>
      </div>

      {/* 세로 선수 리스트 */}
      <div className="flex flex-col gap-2.5">
        {sortedPlayers.map((player) => {
          const isStarter = player.contractAndRole.rosterStatus === "Starter";
          const ovr = Math.round(
            (player.stats.mechanics +
              player.stats.decision +
              player.stats.mental +
              player.stats.execution +
              player.stats.teamwork) /
              5
          );

          const salaryParts = formatEokParts(player.contractAndRole.salary);
          const marketParts = formatEokParts(player.contractAndRole.marketValue);

          return (
            <div
              key={player.profile.playerId}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex gap-3.5 items-center hover:border-slate-700 transition-colors"
            >
              {/* 좌측 선수 2D 벡터 아바타 초상화 */}
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 shrink-0 flex items-center justify-center relative ${
                  isStarter
                    ? "border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                    : "border-slate-700/80 shadow-md"
                }`}
              >
                <AvatarRenderer
                  dna={player.profile.avatarConfig}
                  teamId={teamId}
                  league={league}
                  size="100%"
                  className="w-full h-full"
                />
                {/* 좌상단 포지션 마크 (모서리에 밀착 & 주전/후보 색상 연동) */}
                <div
                  className={`absolute top-0 left-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-br-xl backdrop-blur-md border-r border-b font-mono font-black text-[11px] sm:text-xs shadow-md tracking-wider ${
                    isStarter
                      ? "bg-cyan-950/95 border-cyan-400/70 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                      : "bg-slate-900/95 border-slate-600/70 text-slate-400"
                  }`}
                >
                  {player.contractAndRole.mainPos}
                </div>
                {/* 우하단 주전/후보 마크 (모서리에 밀착 & 주전/후보 색상 연동) */}
                <div
                  className={`absolute bottom-0 right-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-tl-xl backdrop-blur-md border-l border-t font-bold text-[11px] sm:text-xs shadow-md tracking-tight ${
                    isStarter
                      ? "bg-cyan-950/95 border-cyan-400/70 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                      : "bg-slate-900/95 border-slate-600/70 text-slate-400"
                  }`}
                >
                  {isStarter ? "주전" : "후보"}
                </div>
              </div>

              {/* 우측 선수 상세 정보 */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                {/* 1열: 닉네임 및 포지션 */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate font-mono">
                      {player.profile.nicknameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      ({player.profile.nicknameKr})
                    </span>
                    {player.profile.isRetiring && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        ⏳ 은퇴 예정
                      </span>
                    )}
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[9px] font-mono border border-slate-700/80 shrink-0">
                    주 {player.contractAndRole.mainPos} · 부{" "}
                    {player.contractAndRole.subPos}
                  </span>
                </div>

                {/* 2열: 나이, 연차, 종합, 잠재력 */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium flex-wrap">
                  <span>{player.profile.age}세</span>
                  <span className="text-slate-600">·</span>
                  <span>
                    {player.profile.careerYears === 1
                      ? "신인(1년차)"
                      : `${player.profile.careerYears}년차`}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-300 font-semibold">
                    종합 {ovr}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-300 font-semibold">
                    잠재 {player.talentAndGrowth.potential}
                  </span>
                </div>

                {/* 3열: 5대 핵심 스탯 */}
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 flex-wrap leading-tight">
                  <span>
                    피지컬{" "}
                    <b className="text-slate-200">
                      {player.stats.mechanics}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span>
                    판단{" "}
                    <b className="text-slate-200">
                      {player.stats.decision}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span>
                    정신{" "}
                    <b className="text-slate-200">
                      {player.stats.mental}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span>
                    결정{" "}
                    <b className="text-slate-200">
                      {player.stats.execution}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span>
                    팀워크{" "}
                    <b className="text-slate-200">
                      {player.stats.teamwork}
                    </b>
                  </span>
                </div>

                {/* 4열: 고유 특성 뱃지 & 성장/스타성 */}
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  {Array.from(new Set(player.traitsAndMastery.traits)).map(
                    (traitId, idx) => {
                      const trait = getPlayerTraitById(traitId);
                      if (!trait) return null;
                      const badgeColor =
                        trait.type === "긍정형"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                          : trait.type === "부정형"
                          ? "bg-rose-950/60 text-rose-300 border-rose-500/40"
                          : "bg-amber-950/60 text-amber-300 border-amber-500/40";
                      return (
                        <span
                          key={`${player.profile.playerId}-${traitId}-${idx}`}
                          title={`${trait.nameKo} (${trait.nameEn}): ${trait.effect}`}
                          className={`px-1.5 py-0.5 rounded text-[9px] border font-medium ${badgeColor}`}
                        >
                          {trait.nameKo}
                        </span>
                      );
                    }
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] border border-slate-700 font-medium">
                    스타성 {player.talentAndGrowth.starQuality}
                  </span>
                </div>

                {/* 5열: 재정/계약 정보 */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-medium mt-0.5 flex-wrap leading-tight">
                  <span className="flex items-center gap-1 text-cyan-300 font-bold">
                    <span className="text-slate-400 font-normal">연봉</span>
                    <span>
                      {salaryParts.integer}
                      <span className="text-[0.85em] opacity-80">.{salaryParts.decimal}</span>
                      <span className="text-[0.75em] opacity-70 ml-0.5 font-normal">{salaryParts.unit}</span>
                    </span>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="text-emerald-400 font-medium">
                    {player.contractAndRole.contractYears > 0
                      ? `계약 ${player.contractAndRole.contractYears}년`
                      : "FA"}
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="flex items-center gap-1 text-slate-300 font-semibold">
                    <span className="text-slate-400 font-normal">가치</span>
                    {player.profile.isRetiring || !player.contractAndRole.marketValue ? (
                      <span className="text-slate-500 font-normal">-</span>
                    ) : (
                      <span>
                        {marketParts.integer}
                        <span className="text-[0.85em] opacity-80">.{marketParts.decimal}</span>
                        <span className="text-[0.75em] opacity-70 ml-0.5 font-normal">{marketParts.unit}</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
