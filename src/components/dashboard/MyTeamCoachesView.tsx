"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Coach, CoachRole } from "@/types/coach";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import {
  GraduationCap,
  AlertCircle,
  Coins,
  Zap,
  ArrowLeftRight,
  Check,
  Plus,
} from "lucide-react";
import { formatEokParts } from "@/utils/format";
import { useGameStore } from "@/store/useGameStore";
import {
  COACH_ROLES_META,
  CoachRoleMeta,
  getCoachRoleMeta,
} from "@/utils/coachAssignment";
import CoachDetailModal from "@/components/dashboard/CoachDetailModal";

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
  const assignMyCoachRole = useGameStore((state) => state.assignMyCoachRole);
  const autoAssignMyCoaches = useGameStore((state) => state.autoAssignMyCoaches);

  // 역할 교체 모드 활성화 여부
  const [isSwapMode, setIsSwapMode] = useState<boolean>(false);
  // 교체 대상 1단계 선택된 코치 ID
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  // 교체 대상 1단계 선택된 공석 직책
  const [selectedVacantRole, setSelectedVacantRole] = useState<CoachRole | null>(null);
  // 일반 모드에서 상세 정보 팝업으로 열람할 코치
  const [detailCoach, setDetailCoach] = useState<Coach | null>(null);
  // 토스트 안내 메시지
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2500);
  };

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
    setSelectedVacantRole(null);
  };

  // 5대 전담 보직 슬롯 (인게임 -> 분석 -> 훈련 -> 관리 -> 영입 고정 순서)
  const roleSlots = useMemo(() => {
    return COACH_ROLES_META.map((meta) => {
      const coach = coaches.find(
        (c) => getCoachRoleMeta(c.contractAndRole?.role).code === meta.code
      );
      return {
        meta,
        coach: coach || null,
      };
    });
  }, [coaches]);

  // 5대 전담 보직 슬롯에 배정되지 않은 미배정/추가 코치 목록
  const unassignedCoaches = useMemo(() => {
    const assignedCoachIds = new Set(
      roleSlots
        .map((slot) => slot.coach?.profile.coachId)
        .filter((id): id is string => Boolean(id))
    );
    return coaches.filter((c) => !assignedCoachIds.has(c.profile.coachId));
  }, [coaches, roleSlots]);

  // 배정 인원 및 공석 수
  const assignedCount = useMemo(
    () => roleSlots.filter((slot) => slot.coach !== null).length,
    [roleSlots]
  );
  const vacantCount = Math.max(0, 5 - assignedCount);

  // 선택된 1단계 코치 객체
  const selectedCoach = useMemo(
    () => coaches.find((c) => c.profile.coachId === selectedCoachId) || null,
    [coaches, selectedCoachId]
  );

  // 총 연봉 계산
  const totalSalary = useMemo(() => {
    return coaches.reduce(
      (acc, c) => acc + (c.contractAndRole?.salary || 0),
      0
    );
  }, [coaches]);

  const totalSalaryParts = formatEokParts(totalSalary);

  // 코치 카드 클릭 핸들러
  const handleCardClick = (coach: Coach) => {
    if (!isSwapMode) {
      // ① 일반 모드: 상세 모달 열기
      setDetailCoach(coach);
      return;
    }

    // ② 역할 교체 모드
    // 시나리오 A: 이전에 공석 카드가 선택되어 있던 경우 ([공석] -> 코치 탭)
    if (selectedVacantRole) {
      assignMyCoachRole(coach.profile.coachId, selectedVacantRole);
      setSelectedVacantRole(null);
      setSelectedCoachId(null);
      return;
    }

    // 시나리오 B: 아직 아무것도 선택 안 됨 (코치 1단계 선택)
    if (!selectedCoachId) {
      setSelectedCoachId(coach.profile.coachId);
      return;
    }

    // 시나리오 C: 동일 카드 다시 터치 -> 선택 취소
    if (selectedCoachId === coach.profile.coachId) {
      setSelectedCoachId(null);
      return;
    }

    // 시나리오 D: 다른 코치 터치 -> 맞교환 (주전 ↔ 주전, 주전 ↔ 미배정 등)
    swapMyCoaches(selectedCoachId, coach.profile.coachId);
    setSelectedCoachId(null);
  };

  // 공석 카드 클릭 핸들러
  const handleVacantSlotClick = (meta: CoachRoleMeta) => {
    if (!isSwapMode) {
      // ① 일반 모드: 토스트 안내
      showToast("이 직책은 현재 비어있습니다. 역할 교체 모드에서 코치를 배정하세요.");
      return;
    }

    // ② 역할 교체 모드
    // 시나리오 A: 이미 코치가 1단계로 선택되어 있는 경우 (코치 -> [공석] 탭)
    if (selectedCoachId) {
      assignMyCoachRole(selectedCoachId, meta.role);
      setSelectedCoachId(null);
      setSelectedVacantRole(null);
      return;
    }

    // 시나리오 B: 동일 공석 카드 재터치 -> 선택 취소
    if (selectedVacantRole === meta.role) {
      setSelectedVacantRole(null);
      return;
    }

    // 시나리오 C: 공석 카드 1단계 선택
    setSelectedVacantRole(meta.role);
  };

  // 모드 전환 토글
  const toggleSwapMode = () => {
    setIsSwapMode((prev) => !prev);
    setSelectedCoachId(null);
    setSelectedVacantRole(null);
  };

  if (coaches.length === 0) {
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

  // 코치 카드 렌더러
  const renderCoachCard = (coach: Coach) => {
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
    const isTargetForVacant = Boolean(selectedVacantRole);
    const isTargetForSwap = Boolean(selectedCoachId && !isSelected);
    const salaryParts = formatEokParts(coach.contractAndRole?.salary || 0);
    const marketParts = formatEokParts(coach.contractAndRole?.marketValue || 0);

    return (
      <div
        key={coach.profile.coachId}
        onClick={() => handleCardClick(coach)}
        className={`p-3 rounded-2xl border flex gap-3.5 items-center transition-all cursor-pointer ${
          isSelected
            ? "bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.45)] scale-[1.01]"
            : isSwapMode && (isTargetForVacant || isTargetForSwap)
            ? "bg-slate-900/90 border-slate-700 hover:border-indigo-400/80 hover:bg-indigo-950/20 active:scale-[0.99]"
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

          {/* 좌상단 한글 직책 배지 (인게임, 분석, 훈련, 관리, 영입, 미배정) */}
          <div
            className={`absolute top-0 left-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-br-xl backdrop-blur-md border-r border-b font-bold text-[11px] sm:text-xs tracking-tight shadow-md ${
              roleMeta.isAssigned
                ? "border-indigo-400/70 bg-indigo-950/95 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                : "border-slate-600/70 bg-slate-900/95 text-slate-400"
            }`}
          >
            {roleMeta.badge}
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
                    : selectedVacantRole
                    ? "bg-indigo-600 text-white border-indigo-400 animate-pulse"
                    : "bg-indigo-950/80 text-indigo-300 border-indigo-500/40"
                }`}
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>
                  {isSelected
                    ? "선택됨"
                    : selectedVacantRole
                    ? "배정"
                    : selectedCoachId
                    ? "교체"
                    : "선택"}
                </span>
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
              영입{" "}
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
  };

  // 공석 카드 렌더러
  const renderVacantCard = (meta: CoachRoleMeta) => {
    const isVacantSelected = selectedVacantRole === meta.role;
    const isTargetForAssign = Boolean(selectedCoachId);

    return (
      <div
        key={`vacant-${meta.code}`}
        onClick={() => handleVacantSlotClick(meta)}
        className={`p-3 rounded-2xl border border-dashed flex gap-3.5 items-center transition-all cursor-pointer ${
          isVacantSelected
            ? "bg-amber-950/40 border-amber-400/90 ring-2 ring-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.01]"
            : isSwapMode && isTargetForAssign
            ? "bg-indigo-950/30 border-indigo-400/80 hover:border-indigo-300 hover:bg-indigo-950/40 active:scale-[0.99] shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            : isSwapMode
            ? "bg-slate-950/40 border-slate-700 hover:border-indigo-400/60 hover:bg-slate-900/40 active:scale-[0.99]"
            : "bg-slate-950/40 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/30 active:scale-[0.99]"
        }`}
      >
        {/* 좌측 공석 아이콘 박스 */}
        <div
          className={`w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden bg-slate-950/70 border-2 border-dashed shrink-0 flex flex-col items-center justify-center relative ${
            isVacantSelected
              ? "border-amber-400/70"
              : isSwapMode && isTargetForAssign
              ? "border-indigo-400/60"
              : "border-slate-800"
          }`}
        >
          {/* 좌상단 한글 직책 배지 (흐린 톤) */}
          <div className="absolute top-0 left-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-br-xl backdrop-blur-md border-r border-b font-bold text-[11px] sm:text-xs tracking-tight border-slate-700/60 bg-slate-900/85 text-slate-400">
            {meta.badge}
          </div>

          {/* 중앙 플러스 아이콘 및 공석 텍스트 */}
          <div className="flex flex-col items-center justify-center gap-1 pt-3">
            <div
              className={`w-8 h-8 rounded-full border border-dashed flex items-center justify-center transition-all ${
                isVacantSelected
                  ? "border-amber-400 bg-amber-500/15 text-amber-300 animate-pulse"
                  : isSwapMode && isTargetForAssign
                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-300 scale-110 animate-bounce"
                  : "border-slate-700 bg-slate-900/70 text-slate-500"
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
              공석
            </span>
          </div>
        </div>

        {/* 우측 공석 직책 안내 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          {/* 1열: 직책명 및 공석 상태 */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-slate-300 tracking-tight font-mono flex items-center gap-1">
                <span className="text-slate-500 font-bold">+</span>
                <span>코치 공석</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700/60 shrink-0">
                {meta.role}
              </span>
            </div>

            {isSwapMode && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border flex items-center gap-1 shrink-0 ${
                  isVacantSelected
                    ? "bg-amber-400 text-slate-950 border-amber-300 animate-pulse"
                    : isTargetForAssign
                    ? "bg-indigo-500 text-slate-950 border-indigo-300 animate-pulse"
                    : "bg-slate-800/90 text-slate-400 border-slate-700/80"
                }`}
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>
                  {isVacantSelected
                    ? "선택됨"
                    : isTargetForAssign
                    ? "배정하기"
                    : "공석"}
                </span>
              </span>
            )}
          </div>

          {/* 2열: 직책 설명 */}
          <div className="text-[11px] text-slate-400 font-medium leading-relaxed truncate">
            {meta.description}
          </div>

          {/* 3열: 권장 스탯 안내 */}
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
            <span>주요 권장 스탯:</span>
            <span className="text-indigo-300 font-bold">
              {meta.statKey === "ingame" && "인게임"}
              {meta.statKey === "analysis" && "분석"}
              {meta.statKey === "training" && "훈련"}
              {meta.statKey === "managing" && "관리"}
              {meta.statKey === "scouting" && "영입"}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500">연봉 미발생</span>
          </div>

          {/* 4열: 가이드 안내 문구 */}
          <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
            {isSwapMode ? (
              <span
                className={
                  isTargetForAssign
                    ? "text-indigo-300 font-semibold"
                    : isVacantSelected
                    ? "text-amber-300 font-semibold"
                    : "text-slate-400"
                }
              >
                {isTargetForAssign
                  ? "👉 터치하여 선택된 코치를 이 직책에 배정합니다."
                  : isVacantSelected
                  ? "👉 배정할 코치 카드를 터치하세요."
                  : "터치하여 배정할 코치를 선택할 수 있습니다."}
              </span>
            ) : (
              <span className="text-slate-500">
                ※ 현재 비어있는 직책입니다. [역할 교체] 모드에서 코치를 배정하세요.
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2.5 pb-4 select-none relative">
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
              재직 {coaches.length}명 (배정 {assignedCount}/5
              {vacantCount > 0 ? ` · 공석 ${vacantCount}` : ""})
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
            onClick={toggleSwapMode}
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
            {selectedCoach ? (
              <span>
                <b className="text-white underline underline-offset-2">
                  {selectedCoach.profile.nicknameEn}
                </b>
                {" ↔ "}맞바꿀 코치나 배정할 <b className="text-amber-300">[공석]</b> 카드를 터치하세요
              </span>
            ) : selectedVacantRole ? (
              <span>
                <b className="text-amber-300 underline underline-offset-2">
                  [{selectedVacantRole}] 공석
                </b>
                {" ➔ "}이 보직에 배정할 코치 카드를 터치하세요
              </span>
            ) : (
              <span>교체할 코치나 배정할 [공석] 슬롯을 선택하세요.</span>
            )}
          </span>

          {(selectedCoachId || selectedVacantRole) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCoachId(null);
                setSelectedVacantRole(null);
              }}
              className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer shrink-0 ml-2"
            >
              선택 취소
            </button>
          )}
        </div>
      )}

      {/* 5대 전담 보직 슬롯 (코치 배정 시 코치 카드, 미배정 시 공석 카드 렌더링) */}
      <div className="flex flex-col gap-2.5">
        {roleSlots.map(({ meta, coach }) =>
          coach ? renderCoachCard(coach) : renderVacantCard(meta)
        )}
      </div>

      {/* 5대 보직 외 미배정 대기 코치 목록 */}
      {unassignedCoaches.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-[11px] font-bold text-slate-400">
              미배정 대기 코치 ({unassignedCoaches.length}명)
            </span>
            <span className="text-[10px] text-slate-600">
              · 역할 교체 모드를 통해 5대 전담 보직으로 배정할 수 있습니다.
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {unassignedCoaches.map((coach) => renderCoachCard(coach))}
          </div>
        </div>
      )}

      {/* 코치 상세 정보 열람 팝업 모달 */}
      <CoachDetailModal
        coach={detailCoach}
        teamId={teamId}
        league={league}
        onClose={() => setDetailCoach(null)}
      />

      {/* 공석 클릭 시 안내 토스트 팝업 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] sm:max-w-md px-4 py-2.5 rounded-xl bg-slate-900/95 border border-indigo-500/50 text-indigo-100 text-xs font-bold shadow-[0_4px_24px_rgba(0,0,0,0.7)] flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
