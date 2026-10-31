"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users, AlertCircle, ArrowLeftRight, Check, Zap, Sparkles } from "lucide-react";
import { Player, Position } from "@/types/player";
import { getPlayerTraitById } from "@/data/playerTraits";
import { formatEokParts } from "@/utils/format";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import PlayerDetailModal from "@/components/dashboard/PlayerDetailModal";
import { useGameStore } from "@/store/useGameStore";
import {
  autoAssignPlayerRoles,
  sortPlayersByRoleOrder,
  calculatePlayerOvr,
} from "@/utils/playerAssignment";

interface MyTeamRosterViewProps {
  players: Player[];
  teamId?: string | null;
  league?: string | null;
}

export default function MyTeamRosterView({
  players,
  teamId,
  league,
}: MyTeamRosterViewProps) {
  const swapMyPlayers = useGameStore((state) => state.swapMyPlayers);
  const autoAssignMyPlayers = useGameStore((state) => state.autoAssignMyPlayers);

  // 역할 교체 모드 활성화 여부
  const [isSwapMode, setIsSwapMode] = useState<boolean>(false);
  // 교체 대상 1단계 선택된 선수 ID
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  // 일반 모드에서 팝업으로 상세 정보를 열람할 선수
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);

  // 컴포넌트 마운트 시 만약 주전이 한 명도 없다면(초기 진입) 자동으로 최적 주전 배정 수행
  useEffect(() => {
    if (players && players.length > 0) {
      const hasStarter = players.some(
        (p) => p.contractAndRole?.rosterStatus === "Starter"
      );
      if (!hasStarter) {
        autoAssignMyPlayers();
      }
    }
  }, [players, autoAssignMyPlayers]);

  // 원클릭 자동 배정 핸들러
  const handleAutoAssign = () => {
    if (players.length === 0) return;
    autoAssignMyPlayers();
    setSelectedPlayerId(null);
  };

  // 고정 렌더링 순서로 정렬:
  // 위에서부터 주전 5명 (TOP -> JGL -> MID -> BOT -> SUP) 고정 순서, 그 아래 후보(Sub) 선수들
  const sortedPlayers = useMemo(() => {
    return sortPlayersByRoleOrder(players);
  }, [players]);

  const starterCount = useMemo(
    () =>
      sortedPlayers.filter((p) => p.contractAndRole.rosterStatus === "Starter")
        .length,
    [sortedPlayers]
  );
  const subCount = sortedPlayers.length - starterCount;

  // 선택된 1단계 선수 객체
  const selectedPlayer = useMemo(
    () => players.find((p) => p.profile.playerId === selectedPlayerId),
    [players, selectedPlayerId]
  );

  // 카드 클릭 핸들러 (모드에 따라 상세 팝업 or 2-Step 스왑)
  const handleCardClick = (player: Player) => {
    if (!isSwapMode) {
      // 일반 모드: 상세 모달 열기
      setDetailPlayer(player);
      return;
    }

    // 역할 교체 모드: 2-Step 탭 스왑
    if (!selectedPlayerId) {
      // 1단계: 첫 번째 선수 선택
      setSelectedPlayerId(player.profile.playerId);
    } else if (selectedPlayerId === player.profile.playerId) {
      // 동일 카드 다시 터치: 취소
      setSelectedPlayerId(null);
    } else {
      // 2단계: 두 번째 선수 터치 -> 즉시 맞교환!
      swapMyPlayers(selectedPlayerId, player.profile.playerId);
      setSelectedPlayerId(null);
    }
  };

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
          선수 영입이나 이적 시장을 통해 선수를 영입해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 pb-4 select-none">
      {/* 선수단 통계 요약 바 & 역할 교체 모드 토글 버튼 */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shrink-0 shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" />
            선수단 로스터 ({sortedPlayers.length}인)
          </span>
          <span className="text-[10px] font-mono text-cyan-400/90 font-bold px-2 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-800/40">
            STARTER {starterCount} · SUB {subCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* ⚡ 자동 배정 버튼 (교체 모드가 아닐 때 노출) */}
          {!isSwapMode && (
            <button
              type="button"
              onClick={handleAutoAssign}
              title="라인별 최고 OVR 주전 최적 자동 배정"
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-900/90 hover:border-cyan-400 active:scale-95 transition-all text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer touch-manipulation"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>자동 배정</span>
            </button>
          )}

          {/* 🔄 역할 교체 모드 토글 버튼 */}
          <button
            type="button"
            onClick={() => {
              if (isSwapMode) {
                setIsSwapMode(false);
                setSelectedPlayerId(null);
              } else {
                setIsSwapMode(true);
                setSelectedPlayerId(null);
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shadow-md ${
              isSwapMode
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"
                : "bg-slate-900/90 hover:bg-slate-850 border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400"
            }`}
          >
            {isSwapMode ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>교체 완료</span>
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>역할 교체</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 역할 교체 모드 안내 가이드 바 */}
      {isSwapMode && (
        <div className="bg-cyan-950/70 border border-cyan-500/50 rounded-xl px-3 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[11px] font-bold text-cyan-200 flex items-center gap-1.5 flex-wrap">
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
            {selectedPlayerId && selectedPlayer ? (
              <span>
                <b className="text-white underline underline-offset-2">
                  {selectedPlayer.profile.nicknameEn}
                </b>
                {" ↔ "}맞바꿀 대상을 터치하세요 (취소는 재터치)
              </span>
            ) : (
              <span>교체할 첫 번째 대상을 선택하세요.</span>
            )}
          </span>

          {selectedPlayerId && (
            <button
              type="button"
              onClick={() => setSelectedPlayerId(null)}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer shrink-0 ml-2"
            >
              선택 취소
            </button>
          )}
        </div>
      )}

      {/* 세로 선수 카드 리스트 */}
      <div className="flex flex-col gap-2.5">
        {sortedPlayers.map((player) => {
          const isStarter = player.contractAndRole.rosterStatus === "Starter";
          const isSelected = selectedPlayerId === player.profile.playerId;
          const ovr = calculatePlayerOvr(player);

          const salaryParts = formatEokParts(player.contractAndRole.salary);
          const marketParts = formatEokParts(player.contractAndRole.marketValue);

          return (
            <div
              key={player.profile.playerId}
              onClick={() => handleCardClick(player)}
              className={`p-3 rounded-2xl border flex gap-3.5 items-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.45)] scale-[1.01]"
                  : isSwapMode
                  ? "bg-slate-900/90 border-slate-700 hover:border-cyan-400/70 hover:bg-slate-850 active:scale-[0.99]"
                  : "bg-slate-900/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 active:scale-[0.99]"
              }`}
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
                {/* 좌상단 포지션 마크 */}
                <div
                  className={`absolute top-0 left-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-br-xl backdrop-blur-md border-r border-b font-mono font-black text-[11px] sm:text-xs shadow-md tracking-wider ${
                    isStarter
                      ? "bg-cyan-950/95 border-cyan-400/70 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                      : "bg-slate-900/95 border-slate-600/70 text-slate-400"
                  }`}
                >
                  {player.contractAndRole.mainPos}
                </div>
                {/* 우하단 주전/후보 마크 */}
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
                {/* 1열: 닉네임, 은퇴예정 배지, 스왑 배지(교체 모드 시) */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate font-mono">
                      {player.profile.nicknameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({player.profile.nicknameKr})
                    </span>
                    {player.profile.isRetiring && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        ⏳ 은퇴 예정
                      </span>
                    )}
                  </div>

                  {isSwapMode && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? "bg-cyan-400 text-slate-950 border-cyan-300 animate-pulse"
                          : "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                      }`}
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>{isSelected ? "선택됨" : "교체"}</span>
                    </span>
                  )}
                </div>

                {/* 2열: 나이, 연차, 종합 */}
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

                {/* 4열: 고유 특성 뱃지 & 스타성 */}
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

      {/* 선수 상세 정보 열람 팝업 모달 */}
      <PlayerDetailModal
        player={detailPlayer}
        teamId={teamId}
        league={league}
        onClose={() => setDetailPlayer(null)}
      />
    </div>
  );
}
