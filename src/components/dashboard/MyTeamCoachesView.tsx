"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Coach } from "@/types/coach";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import { GraduationCap, AlertCircle, Coins, Zap, ArrowLeftRight, Check } from "lucide-react";
import { formatEokParts } from "@/utils/format";
import { useGameStore } from "@/store/useGameStore";
import {
  autoAssignCoachRoles,
  sortCoachesByRoleOrder,
  getCoachRoleMeta,
} from "@/utils/coachAssignment";
import CoachDetailModal from "@/components/dashboard/CoachDetailModal";
import { swapCoaches } from "@/utils/rosterSwap";

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
  const swapMyCoaches = useGameStore((state) => state.swapMyCoaches);
  const autoAssignMyCoaches = useGameStore((state) => state.autoAssignMyCoaches);

  // 역할 교체 모드 활성화 여부
  const [isSwapMode, setIsSwapMode] = useState<boolean>(false);
  // 교체 대상 1단계 선택된 코치 ID
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  // 일반 모드에서 상세 정보 팝업으로 열람할 코치
  const [detailCoach, setDetailCoach] = useState<Coach | null>(null);

  // 초기 진입 시: 아직 보직이 하나도 배정되어 있지 않거나 비어있는 경우 자동 배정 실행
  useEffect(() => {
    if (coaches.length > 0) {
      const hasAnyRole = coaches.some((c) => Boolean(c.contractAndRole?.role));
      if (!hasAnyRole) {
        autoAssignMyCoaches();
      }
    }
  }, [coaches, autoAssignMyCoaches]);

  // 원클릭 자동 배정 핸들러
  const handleAutoAssign = () => {
    if (coaches.length === 0) return;
    autoAssignMyCoaches();
    setSelectedCoachId(null);
  };

  // 고정 렌더링 순서로 정렬:
  // 1. [ING] 인게임 코치 -> 2. [ANA] 분석 코치 -> 3. [TRN] 훈련 코치 ->
  // 4. [MNG] 관리 코치 -> 5. [SCT] 스카우트 코치 -> 6. [UNA] 미배정 코치들
  const sortedCoaches = useMemo(() => {
    return sortCoachesByRoleOrder(coaches);
  }, [coaches]);

  // 선택된 1단계 코치 객체
  const selectedCoach = useMemo(
    () => coaches.find((c) => c.profile.coachId === selectedCoachId),
    [coaches, selectedCoachId]
  );

  // 총 연봉 계산
  const totalSalary = useMemo(() => {
    return sortedCoaches.reduce(
      (acc, c) => acc + (c.contractAndRole?.salary || 0),
      0
    );
  }, [sortedCoaches]);

  const totalSalaryParts = formatEokParts(totalSalary);

  // 카드 클릭 핸들러 (모드에 따라 상세 팝업 or 2-Step 스왑)
  const handleCardClick = (coach: Coach) => {
    if (!isSwapMode) {
      // 일반 모드: 상세 모달 열기
      setDetailCoach(coach);
      return;
    }

    // 역할 교체 모드: 2-Step 탭 스왑
    if (!selectedCoachId) {
      // 1단계: 첫 번째 코치 선택
      setSelectedCoachId(coach.profile.coachId);
    } else if (selectedCoachId === coach.profile.coachId) {
      // 동일 카드 다시 터치: 취소
      setSelectedCoachId(null);
    } else {
      // 2단계: 두 번째 코치 터치 -> 즉시 맞교환!
      swapMyCoaches(selectedCoachId, coach.profile.coachId);
      setSelectedCoachId(null);
    }
  };

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
      {/* 코치진 통계 요약 바 & 액션 버튼 */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center justify-between shrink-0 shadow-sm flex-wrap gap-2">
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

        <div className="flex items-center gap-2">
          {/* ⚡ 자동 배정 버튼 (교체 모드가 아닐 때 노출) */}
          {!isSwapMode && (
            <button
              type="button"
              onClick={handleAutoAssign}
              title="스탯 기반 5대 전담 보직 최적 자동 배정"
              className="px-2.5 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:text-white hover:bg-indigo-900/90 hover:border-indigo-400 active:scale-95 transition-all text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer touch-manipulation"
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
                setSelectedCoachId(null);
              } else {
                setIsSwapMode(true);
                setSelectedCoachId(null);
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shadow-md ${
              isSwapMode
                ? "bg-gradient-to-r from-emerald-500 to-indigo-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"
                : "bg-slate-900/90 hover:bg-slate-850 border-indigo-500/40 text-indigo-300 hover:text-white hover:border-indigo-400"
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

          <div className="h-6 w-px bg-slate-800" />

          {/* 총 연봉 표기 */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-400 font-mono">
              코치진 총 연봉
            </span>
            <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              {totalSalaryParts.integer}
              <span className="text-[0.85em] opacity-80">
                .{totalSalaryParts.decimal}
              </span>
              <span className="text-[0.75em] opacity-70 ml-0.5 font-normal">
                {totalSalaryParts.unit}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 역할 교체 모드 안내 가이드 바 */}
      {isSwapMode && (
        <div className="bg-indigo-950/70 border border-indigo-500/50 rounded-xl px-3 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-[11px] font-bold text-indigo-200 flex items-center gap-1.5 flex-wrap">
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
            {selectedCoachId && selectedCoach ? (
              <span>
                <b className="text-white underline underline-offset-2">
                  {selectedCoach.profile.nicknameEn}
                </b>
                {" ↔ "}맞바꿀 대상을 터치하세요 (취소는 재터치)
              </span>
            ) : (
              <span>교체할 첫 번째 대상을 선택하세요.</span>
            )}
          </span>

          {selectedCoachId && (
            <button
              type="button"
              onClick={() => setSelectedCoachId(null)}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer shrink-0 ml-2"
            >
              선택 취소
            </button>
          )}
        </div>
      )}

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

          const roleMeta = getCoachRoleMeta(coach.contractAndRole?.role);
          const isSelected = selectedCoachId === coach.profile.coachId;
          const salaryParts = formatEokParts(coach.contractAndRole?.salary || 0);
          const marketParts = formatEokParts(coach.contractAndRole?.marketValue || 0);

          return (
            <div
              key={coach.profile.coachId}
              onClick={() => handleCardClick(coach)}
              className={`p-3 rounded-2xl border flex gap-3.5 items-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.45)] scale-[1.01]"
                  : isSwapMode
                  ? "bg-slate-900/90 border-slate-700 hover:border-indigo-400/70 hover:bg-slate-850 active:scale-[0.99]"
                  : "bg-slate-900/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 active:scale-[0.99]"
              }`}
            >
              {/* 좌측 코치 아바타 초상화 */}
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 shrink-0 flex items-center justify-center relative ${
                  roleMeta.isAssigned
                    ? "border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                    : "border-slate-700/80 shadow-md"
                }`}
              >
                <AvatarRenderer
                  dna={coach.profile.avatarConfig}
                  teamId={teamId}
                  league={league}
                  size="100%"
                  className="w-full h-full"
                />

                {/* 좌상단 3글자 직책 이니셜 배지 (ING, ANA, TRN, MNG, SCT, UNA) */}
                <div
                  className={`absolute top-0 left-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-br-xl backdrop-blur-md border-r border-b font-mono font-black text-[11px] sm:text-xs tracking-wider shadow-md ${
                    roleMeta.isAssigned
                      ? "border-indigo-400/70 bg-indigo-950/95 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                      : "border-slate-600/70 bg-slate-900/95 text-slate-400"
                  }`}
                >
                  {roleMeta.code}
                </div>
              </div>

              {/* 우측 코치 상세 정보 */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                {/* 1열: 닉네임, 은퇴예정 배지, 스왑 배지(교체 모드 시) */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate font-mono">
                      {coach.profile.nicknameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({coach.profile.nicknameKr})
                    </span>
                    {coach.profile.isRetiring && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        ⏳ 은퇴 예정
                      </span>
                    )}
                  </div>

                  {isSwapMode && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? "bg-indigo-400 text-slate-950 border-indigo-300 animate-pulse"
                          : "bg-indigo-950/80 text-indigo-300 border-indigo-500/40"
                      }`}
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>{isSelected ? "선택됨" : "교체"}</span>
                    </span>
                  )}
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

                {/* 3열: 5대 핵심 코치 스탯 (담당 보직 스탯 강조) */}
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 flex-wrap leading-tight">
                  <span
                    className={
                      roleMeta.code === "ING"
                        ? "text-indigo-300 font-bold bg-indigo-950/60 px-1 rounded border border-indigo-500/30"
                        : ""
                    }
                  >
                    인게임{" "}
                    <b
                      className={
                        roleMeta.code === "ING"
                          ? "text-indigo-200"
                          : "text-slate-200"
                      }
                    >
                      {coach.stats.ingame}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span
                    className={
                      roleMeta.code === "ANA"
                        ? "text-indigo-300 font-bold bg-indigo-950/60 px-1 rounded border border-indigo-500/30"
                        : ""
                    }
                  >
                    분석{" "}
                    <b
                      className={
                        roleMeta.code === "ANA"
                          ? "text-indigo-200"
                          : "text-slate-200"
                      }
                    >
                      {coach.stats.analysis}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span
                    className={
                      roleMeta.code === "TRN"
                        ? "text-indigo-300 font-bold bg-indigo-950/60 px-1 rounded border border-indigo-500/30"
                        : ""
                    }
                  >
                    훈련{" "}
                    <b
                      className={
                        roleMeta.code === "TRN"
                          ? "text-indigo-200"
                          : "text-slate-200"
                      }
                    >
                      {coach.stats.training}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span
                    className={
                      roleMeta.code === "MNG"
                        ? "text-indigo-300 font-bold bg-indigo-950/60 px-1 rounded border border-indigo-500/30"
                        : ""
                    }
                  >
                    관리{" "}
                    <b
                      className={
                        roleMeta.code === "MNG"
                          ? "text-indigo-200"
                          : "text-slate-200"
                      }
                    >
                      {coach.stats.managing}
                    </b>
                  </span>
                  <span className="text-slate-700">·</span>
                  <span
                    className={
                      roleMeta.code === "SCT"
                        ? "text-indigo-300 font-bold bg-indigo-950/60 px-1 rounded border border-indigo-500/30"
                        : ""
                    }
                  >
                    스카우트{" "}
                    <b
                      className={
                        roleMeta.code === "SCT"
                          ? "text-indigo-200"
                          : "text-slate-200"
                      }
                    >
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
                      <span className="text-[0.85em] opacity-80">
                        .{salaryParts.decimal}
                      </span>
                      <span className="text-[0.75em] opacity-70 ml-0.5 font-normal">
                        {salaryParts.unit}
                      </span>
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
                    {coach.profile.isRetiring ||
                    !coach.contractAndRole?.marketValue ? (
                      <span className="text-slate-500 font-normal">-</span>
                    ) : (
                      <span>
                        {marketParts.integer}
                        <span className="text-[0.85em] opacity-80">
                          .{marketParts.decimal}
                        </span>
                        <span className="text-[0.75em] opacity-70 ml-0.5 font-normal">
                          {marketParts.unit}
                        </span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 코치 상세 정보 열람 팝업 모달 */}
      <CoachDetailModal
        coach={detailCoach}
        teamId={teamId}
        league={league}
        onClose={() => setDetailCoach(null)}
      />
    </div>
  );
}
