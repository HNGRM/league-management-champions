"use client";

import React, { useMemo } from "react";
import { Coach } from "@/types/coach";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import { GraduationCap, AlertCircle, Coins, Shield } from "lucide-react";
import { formatEokParts } from "@/utils/format";

interface MyTeamCoachesViewProps {
  coaches: Coach[];
  teamId?: string;
  league?: string;
}

export default function MyTeamCoachesView({
  coaches,
  teamId,
  league,
}: MyTeamCoachesViewProps) {
  // 코치 OVR 내림차순 정렬
  const sortedCoaches = useMemo(() => {
    return [...coaches].sort((a, b) => {
      const ovrA = Math.round(
        (a.stats.ingame +
          a.stats.analysis +
          a.stats.training +
          a.stats.managing +
          a.stats.scouting) /
          5
      );
      const ovrB = Math.round(
        (b.stats.ingame +
          b.stats.analysis +
          b.stats.training +
          b.stats.managing +
          b.stats.scouting) /
          5
      );
      return ovrB - ovrA;
    });
  }, [coaches]);

  // 총 연봉 계산
  const totalSalary = useMemo(() => {
    return sortedCoaches.reduce((acc, c) => acc + (c.contractAndRole?.salary || 0), 0);
  }, [sortedCoaches]);

  const totalSalaryParts = formatEokParts(totalSalary);

  if (sortedCoaches.length === 0) {
    return (
      <div className="h-full min-h-[260px] rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center gap-2.5 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-300">
          등록된 팀 코치가 없습니다.
        </p>
        <p className="text-xs text-slate-500">
          코치 영입을 통해 코칭스태프를 보강해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 pb-4 select-none">
      {/* 코치진 통계 요약 바 */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">
              코칭스태프 현황
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              총 {sortedCoaches.length}명 재직 중
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-400 font-mono">코치진 총 연봉</span>
            <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              {totalSalaryParts.integer}
              <span className="text-[0.85em] opacity-80">.{totalSalaryParts.decimal}</span>
              <span className="text-[0.75em] opacity-70 ml-0.5 font-normal">{totalSalaryParts.unit}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 코치 목록 카드 */}
      <div className="flex flex-col gap-2.5">
        {sortedCoaches.map((coach) => {
          const coachOvr = Math.round(
            (coach.stats.ingame +
              coach.stats.analysis +
              coach.stats.training +
              coach.stats.managing +
              coach.stats.scouting) /
              5
          );

          const salaryParts = formatEokParts(coach.contractAndRole?.salary || 0);
          const marketParts = formatEokParts(coach.contractAndRole?.marketValue || 0);

          return (
            <div
              key={coach.profile.coachId}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex gap-3.5 items-center hover:border-slate-700 transition-colors"
            >
              {/* 좌측 코치 아바타 초상화 */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.25)] shrink-0 flex items-center justify-center relative">
                <AvatarRenderer
                  dna={coach.profile.avatarConfig}
                  teamId={teamId}
                  league={league}
                  size="100%"
                  className="w-full h-full"
                />
                {/* 좌상단 코치 배지 */}
                <div className="absolute top-0 left-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-br-xl backdrop-blur-md border-r border-b border-indigo-400/70 bg-indigo-950/95 font-mono font-black text-[11px] sm:text-xs text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.35)] tracking-wider">
                  COACH
                </div>
              </div>

              {/* 우측 코치 상세 정보 */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                {/* 1열: 닉네임, 은퇴예정 배지, 담당 보직 */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0 truncate">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate font-mono">
                      {coach.profile.nicknameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      ({coach.profile.nicknameKr})
                    </span>
                    {coach.profile.isRetiring && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        ⏳ 은퇴 예정
                      </span>
                    )}
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-[9px] border border-indigo-500/30 font-medium shrink-0">
                    {coach.contractAndRole?.role || "미배정 코치"}
                  </span>
                </div>

                {/* 2열: 나이, 연차, 종합, 언어 */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium flex-wrap">
                  <span>{coach.profile.age}세</span>
                  <span className="text-slate-600">·</span>
                  <span>
                    {coach.profile.careerYears === 1
                      ? "신임(1년차)"
                      : `${coach.profile.careerYears}년차`}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-300 font-semibold">
                    종합 {coachOvr}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-300 font-semibold">
                    {coach.profile.firstLanguage}
                    {coach.profile.secondLanguage
                      ? ` / ${coach.profile.secondLanguage}`
                      : ""}
                  </span>
                </div>

                {/* 3열: 5대 핵심 코치 스탯 */}
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 flex-wrap leading-tight">
                  <span>
                    인게임{" "}
                    <b className="text-slate-200">
                      {coach.stats.ingame}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span>
                    분석{" "}
                    <b className="text-slate-200">
                      {coach.stats.analysis}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span>
                    훈련{" "}
                    <b className="text-slate-200">
                      {coach.stats.training}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span>
                    관리{" "}
                    <b className="text-slate-200">
                      {coach.stats.managing}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span>
                    스카우트{" "}
                    <b className="text-slate-200">
                      {coach.stats.scouting}
                    </b>
                  </span>
                </div>

                {/* 4열: 재정/계약 정보 행 */}
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
                    {coach.contractAndRole?.contractYears > 0
                      ? `계약 ${coach.contractAndRole.contractYears}년`
                      : "FA"}
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="flex items-center gap-1 text-slate-300 font-semibold">
                    <span className="text-slate-400 font-normal">가치</span>
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
          );
        })}
      </div>
    </div>
  );
}
