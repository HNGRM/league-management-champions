"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Coach } from "@/types/coach";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import { formatEokParts } from "@/utils/format";
import { getCoachRoleMeta } from "@/utils/coachAssignment";
import { X, GraduationCap, Coins, Briefcase } from "lucide-react";

interface CoachDetailModalProps {
  coach: Coach | null;
  teamId?: string | null;
  league?: string | null;
  onClose: () => void;
}

export default function CoachDetailModal({
  coach,
  teamId,
  league,
  onClose,
}: CoachDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !coach) return null;

  const coachOvr = Math.round(
    (coach.stats.ingame +
      coach.stats.analysis +
      coach.stats.training +
      coach.stats.managing +
      coach.stats.scouting) /
      5
  );

  const roleMeta = getCoachRoleMeta(coach.contractAndRole?.role);
  const salaryParts = formatEokParts(coach.contractAndRole?.salary || 0);
  const marketParts = formatEokParts(coach.contractAndRole?.marketValue || 0);

  const statsList = [
    { key: "ING", label: "인게임", value: coach.stats.ingame, color: "from-blue-500 to-indigo-500" },
    { key: "ANA", label: "전력분석", value: coach.stats.analysis, color: "from-indigo-500 to-purple-500" },
    { key: "TRN", label: "훈련", value: coach.stats.training, color: "from-emerald-500 to-teal-500" },
    { key: "MNG", label: "팀 관리", value: coach.stats.managing, color: "from-amber-500 to-orange-500" },
    { key: "SCT", label: "영입", value: coach.stats.scouting, color: "from-pink-500 to-rose-500" },
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
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight ${
                roleMeta.isAssigned
                  ? "bg-indigo-950 border border-indigo-500/50 text-indigo-300"
                  : "bg-slate-800 border border-slate-700 text-slate-400"
              }`}
            >
              {roleMeta.badge}
            </span>
            <span className="text-xs font-bold text-slate-200">
              코치 상세 프로필
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
          {/* 기본 프로필 카드 */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex gap-3.5 items-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/40 shrink-0 relative flex items-center justify-center">
              <AvatarRenderer
                dna={coach.profile.avatarConfig}
                teamId={teamId || undefined}
                league={league || undefined}
                size="100%"
                className="w-full h-full"
              />
              <div
                className={`absolute top-0 left-0 px-2 py-0.5 rounded-br-lg font-bold text-[10px] tracking-tight ${
                  roleMeta.isAssigned
                    ? "bg-indigo-950/90 border-r border-b border-indigo-400/50 text-indigo-300"
                    : "bg-slate-900/90 border-r border-b border-slate-600/50 text-slate-400"
                }`}
              >
                {roleMeta.badge}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base font-bold text-white tracking-tight truncate font-mono">
                  {coach.profile.nicknameEn}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  ({coach.profile.nicknameKr})
                </span>
                {coach.profile.isRetiring && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                    ⏳ 은퇴 예정
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium flex-wrap">
                <span>{coach.profile.age}세</span>
                <span className="text-slate-600">·</span>
                <span>
                  {coach.profile.careerYears === 1
                    ? "신임 (1년차)"
                    : `${coach.profile.careerYears}년차`}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-300 font-bold font-mono">
                  종합 OVR {coachOvr}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                  {roleMeta.label}
                </span>
                <span className="text-cyan-300">
                  · {coach.profile.firstLanguage}
                  {coach.profile.secondLanguage ? ` / ${coach.profile.secondLanguage}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* 5대 코치 핵심 역량 스탯 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>5대 코치 지도 스탯</span>
              <span className="text-[10px] font-mono text-indigo-400">평균 {coachOvr}</span>
            </span>

            <div className="flex flex-col gap-1.5">
              {statsList.map((stat) => {
                const isSpecialty = roleMeta.code === stat.key;
                return (
                  <div key={stat.key} className="flex items-center gap-2 text-xs">
                    <span
                      className={`w-14 text-[11px] shrink-0 font-medium ${
                        isSpecialty ? "text-indigo-300 font-bold" : "text-slate-400"
                      }`}
                    >
                      {stat.label}
                    </span>
                    <div className="flex-1 h-2 bg-slate-800/90 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                        style={{ width: `${Math.min(100, Math.max(5, stat.value))}%` }}
                      />
                    </div>
                    <span
                      className={`w-7 text-right font-mono font-bold text-xs shrink-0 ${
                        isSpecialty ? "text-indigo-300 font-black text-sm" : "text-slate-200"
                      }`}
                    >
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 담당 보직 업무 설명 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              전담 보직 역할
            </span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70">
              {roleMeta.code === "ING" && "인게임 밴픽 가이드 및 경기 중 실시간 오더·전술 지시를 보조합니다."}
              {roleMeta.code === "ANA" && "상대 구단 분석 리포트 작성 및 챔피언 티어 정리를 전담합니다."}
              {roleMeta.code === "TRN" && "선수들의 5대 경기력 스탯 훈련 효율과 챔피언 숙련도 성장을 촉진합니다."}
              {roleMeta.code === "MNG" && "선수단의 일일 체력 소모 완화 및 멘탈·의욕 상태를 관리합니다."}
              {roleMeta.code === "SCT" && "국내외 리그 유망주 발굴 및 이적 시장 계약 협상력을 증대합니다."}
              {roleMeta.code === "UNA" && "현재 배정된 전담 보직이 없는 대기 코치입니다. 역할 교체 모드를 통해 보직을 부여할 수 있습니다."}
            </p>
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
                  {coach.contractAndRole?.contractYears > 0
                    ? `잔여 ${coach.contractAndRole.contractYears}년`
                    : "FA"}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-medium">시장 가치</span>
                <span className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                  {coach.profile.isRetiring || !coach.contractAndRole?.marketValue ? (
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
