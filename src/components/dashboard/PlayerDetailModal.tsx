"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Player, getPositionNameKo } from "@/types/player";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import { getPlayerTraitById } from "@/data/playerTraits";
import { formatEokParts } from "@/utils/format";
import { X, Sparkles, Shield, Coins, Calendar, UserCheck } from "lucide-react";

interface PlayerDetailModalProps {
  player: Player | null;
  teamId?: string | null;
  league?: string | null;
  onClose: () => void;
}

export default function PlayerDetailModal({
  player,
  teamId,
  league,
  onClose,
}: PlayerDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !player) return null;

  const isStarter = player.contractAndRole.rosterStatus === "Starter";
  const ovr = Math.round(
    (player.stats.mechanics +
      player.stats.decision +
      player.stats.mental +
      player.stats.execution +
      player.stats.teamwork) /
      5
  );

  const salaryParts = formatEokParts(player.contractAndRole.salary || 0);
  const marketParts = formatEokParts(player.contractAndRole.marketValue || 0);

  const statsList = [
    { label: "피지컬", value: player.stats.mechanics, color: "from-cyan-500 to-blue-500" },
    { label: "판단력", value: player.stats.decision, color: "from-blue-500 to-indigo-500" },
    { label: "정신력", value: player.stats.mental, color: "from-indigo-500 to-purple-500" },
    { label: "결정력", value: player.stats.execution, color: "from-purple-500 to-pink-500" },
    { label: "팀워크", value: player.stats.teamwork, color: "from-emerald-500 to-teal-500" },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 헤더 바 */}
        <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${
                isStarter
                  ? "bg-cyan-950 border border-cyan-500/50 text-cyan-300"
                  : "bg-slate-800 border border-slate-700 text-slate-400"
              }`}
            >
              {isStarter ? "STARTER" : "SUB"}
            </span>
            <span className="text-xs font-bold text-slate-200">
              선수 상세 프로필
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3.5">
          {/* 기본 프로필 카드 (아바타 + 닉네임 + 연차) */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex gap-3.5 items-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-500/40 shrink-0 relative flex items-center justify-center">
              <AvatarRenderer
                dna={player.profile.avatarConfig}
                teamId={teamId || undefined}
                league={league || undefined}
                size="100%"
                className="w-full h-full"
              />
              <div className="absolute -top-0.5 -left-0.5 px-2 py-0.5 rounded-br-lg rounded-tl-2xl bg-cyan-950/90 border-r border-b border-cyan-400/50 font-mono font-bold text-[10px] text-cyan-300">
                {getPositionNameKo(player.contractAndRole.mainPos)}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base font-bold text-white tracking-tight truncate font-mono">
                  {player.profile.nicknameEn}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  ({player.profile.nicknameKr})
                </span>
                {player.profile.isRetiring && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                    ⏳ 은퇴 예정
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium flex-wrap">
                <span>{player.profile.age}세</span>
                <span className="text-slate-600">·</span>
                <span>
                  {player.profile.careerYears === 1
                    ? "신인 (1년차)"
                    : `${player.profile.careerYears}년차`}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-300 font-bold font-mono">
                  종합 OVR {ovr}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  주 {getPositionNameKo(player.contractAndRole.mainPos)} · 부 {getPositionNameKo(player.contractAndRole.subPos)}
                </span>
                <span className="text-cyan-300">
                  · {player.profile.firstLanguage}
                  {player.profile.secondLanguage ? ` / ${player.profile.secondLanguage}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* 5대 핵심 경기력 스탯 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>5대 경기력 스탯</span>
              <span className="text-[10px] font-mono text-cyan-400">평균 {ovr}</span>
            </span>

            <div className="flex flex-col gap-1.5">
              {statsList.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-slate-400 font-medium text-[11px] shrink-0">
                    {stat.label}
                  </span>
                  <div className="flex-1 h-2 bg-slate-800/90 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                      style={{ width: `${Math.min(100, Math.max(5, stat.value))}%` }}
                    />
                  </div>
                  <span className="w-7 text-right font-mono font-bold text-slate-200 text-xs shrink-0">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 고유 특성 (Traits) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              보유 특성
            </span>

            {player.traitsAndMastery.traits.length === 0 ? (
              <span className="text-xs text-slate-500 py-1">보유한 특성이 없습니다.</span>
            ) : (
              <div className="flex flex-col gap-1.5">
                {Array.from(new Set(player.traitsAndMastery.traits)).map((traitId) => {
                  const trait = getPlayerTraitById(traitId);
                  if (!trait) return null;

                  const badgeColor =
                    trait.type === "긍정형"
                      ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/40"
                      : trait.type === "부정형"
                      ? "bg-rose-950/70 text-rose-300 border-rose-500/40"
                      : "bg-amber-950/70 text-amber-300 border-amber-500/40";

                  return (
                    <div
                      key={trait.id}
                      className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 flex flex-col gap-0.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] border font-bold ${badgeColor}`}
                        >
                          {trait.nameKo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {trait.nameEn}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                        {trait.effect}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 재정 & 계약 정보 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              계약 및 시장 가치
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-medium">연봉</span>
                <span className="text-xs font-bold text-cyan-300 font-mono mt-0.5">
                  {salaryParts.integer}
                  <span className="text-[0.85em] opacity-80">.{salaryParts.decimal}</span>
                  <span className="text-[0.75em] opacity-70 ml-0.5 font-normal">{salaryParts.unit}</span>
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-medium">계약 기간</span>
                <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                  {player.contractAndRole.contractYears > 0
                    ? `잔여 ${player.contractAndRole.contractYears}년`
                    : "FA"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-medium">시장 가치</span>
                <span className="text-xs font-bold text-slate-200 font-mono mt-0.5">
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
        </div>

        {/* 하단 고정 닫기 버튼 */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
