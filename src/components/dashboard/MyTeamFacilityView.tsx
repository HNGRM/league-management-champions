"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Wallet,
  Wrench,
  TrendingUp,
  Sparkles,
  Check,
  AlertCircle,
  Hammer,
  Crown,
  X,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  FacilityId,
  FacilityDefinition,
  FACILITIES,
  DEFAULT_FACILITY_LEVELS,
  getFacilityById,
  getFacilityLevelSpec,
  getTotalFacilityMaintenance,
  getTotalFacilityInvestment,
} from "@/types/facility";
import { useGameStore } from "@/store/useGameStore";
import { formatKoreanMoney } from "@/utils/format";

export default function MyTeamFacilityView() {
  const [mounted, setMounted] = useState(false);
  const [confirmFacilityId, setConfirmFacilityId] = useState<FacilityId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTeam = useGameStore((state) => state.currentTeam);
  const facilities = useGameStore((state) => state.facilities) ?? DEFAULT_FACILITY_LEVELS;
  const upgradeFacility = useGameStore((state) => state.upgradeFacility);

  // 팀 보유 자금 (기본 5.00억 원)
  const currentBalance = currentTeam?.balance ?? 500_000_000;

  // 총 시설 유지비 및 총 시설 누적 투자액
  const totalMaintenance = useMemo(
    () => getTotalFacilityMaintenance(facilities),
    [facilities]
  );
  const totalInvestment = useMemo(
    () => getTotalFacilityInvestment(facilities),
    [facilities]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // 공사 확정 처리
  const handleConfirmUpgrade = () => {
    if (!confirmFacilityId) return;
    const currentLvl = facilities[confirmFacilityId] ?? 1;
    const targetLvl = currentLvl + 1;
    const targetFacility = getFacilityById(confirmFacilityId);

    const success = upgradeFacility(confirmFacilityId);
    if (success) {
      showToast(
        `${targetFacility.nameKr}이(가) Lv.${targetLvl} 시설로 성공적으로 증축되었습니다!`
      );
    } else {
      showToast("보유 자금이 부족하여 시설 확장을 진행할 수 없습니다.");
    }
    setConfirmFacilityId(null);
  };

  const pendingFacility = confirmFacilityId
    ? getFacilityById(confirmFacilityId)
    : null;
  const pendingCurrentLevel = confirmFacilityId
    ? facilities[confirmFacilityId] ?? 1
    : 1;
  const pendingNextLevel = pendingCurrentLevel + 1;
  const pendingCurrentSpec = confirmFacilityId
    ? getFacilityLevelSpec(confirmFacilityId, pendingCurrentLevel)
    : null;
  const pendingNextSpec =
    confirmFacilityId && pendingNextLevel <= 5
      ? getFacilityLevelSpec(confirmFacilityId, pendingNextLevel)
      : null;

  return (
    <div className="flex flex-col gap-3 pb-8 select-none animate-in fade-in duration-200 relative">
      {/* ================= 1. 상단 요약 바 ================= */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-slate-800 rounded-2xl p-3.5 shadow-sm flex flex-col gap-2.5 relative overflow-hidden">
        {/* 네온 글로우 백그라운드 */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 1열: 타이틀 & 팀 가치 기여 뱃지 */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                팀 4대 시설 관리
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                시설 증축 및 영구 버프 시스템
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 shadow-sm shrink-0">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span>팀 가치 반영 자산</span>
          </div>
        </div>

        {/* 2열: 보유 자금 & 시설 유지비 총액 & 누적 투자액 카드 2단 그리드 */}
        <div className="grid grid-cols-2 gap-2 relative z-10 pt-2 border-t border-slate-800/80 text-xs">
          {/* 💰 팀 총 보유 자금 */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                <span>팀 총 보유 자금</span>
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold font-mono text-cyan-300">
              {formatKoreanMoney(currentBalance)}
            </span>
          </div>

          {/* 🏗️ 시즌 시설 유지비 */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-rose-400" />
                <span>시즌 시설 유지비</span>
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-bold font-mono text-rose-300">
                {formatKoreanMoney(totalMaintenance)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">/ 시즌</span>
            </div>
          </div>
        </div>

        {/* 안내 뱃지 */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/40 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
          <span>누적 시설 투자액</span>
          <span className="font-mono font-bold text-slate-200">
            {formatKoreanMoney(totalInvestment)}
          </span>
        </div>
      </div>

      {/* ================= 2. 4대 시설 카드 리스트 ================= */}
      <div className="flex flex-col gap-3.5">
        {FACILITIES.map((facility) => {
          const currentLevel = facilities[facility.id] ?? 1;
          const isMaxLevel = currentLevel >= 5;
          const nextLevel = currentLevel + 1;

          const currentSpec = getFacilityLevelSpec(facility.id, currentLevel);
          const nextSpec = !isMaxLevel
            ? getFacilityLevelSpec(facility.id, nextLevel)
            : null;

          const canAfford =
            nextSpec ? currentBalance >= nextSpec.upgradeCost : false;
          const additionalMaintenance = nextSpec
            ? nextSpec.maintenanceCost - currentSpec.maintenanceCost
            : 0;

          return (
            <div
              key={facility.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:border-slate-700"
            >
              {/* 카드 상단: 16:9 고화질 비주얼 영역 */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={facility.imageUrl}
                  alt={facility.nameKr}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />

                {/* 상단 오버레이 그라데이션 */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/60 pointer-events-none" />

                {/* 좌측 상단: 분류 뱃지 */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${facility.categoryBadgeClass}`}
                  >
                    {facility.category}
                  </span>
                </div>

                {/* 우측 상단: 현재 레벨 뱃지 */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border backdrop-blur-md ${
                      isMaxLevel
                        ? "bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                        : "bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    }`}
                  >
                    {isMaxLevel && <Crown className="w-3 h-3 text-amber-400" />}
                    <span>
                      Lv.{currentLevel} / 5
                    </span>
                  </span>
                </div>

                {/* 이미지 하단 캡션: 시설명 및 현재 단계 명칭 */}
                <div className="absolute bottom-2.5 left-3 right-3 z-10 flex flex-col leading-tight">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black text-white tracking-tight drop-shadow-md">
                      {facility.nameKr}
                    </span>
                    <span className="text-[10px] text-cyan-300/80 font-mono font-medium drop-shadow-sm">
                      {facility.nameEn}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-cyan-300 drop-shadow-sm mt-0.5">
                    [{currentSpec.name}]
                  </span>
                </div>
              </div>

              {/* 카드 중단: 상세 효과 (현재 효과 & 다음 단계 미리보기) */}
              <div className="p-3.5 flex flex-col gap-2.5 border-t border-slate-800/80 bg-slate-900/60">
                {/* 1) 현재 적용 중인 버프 */}
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>현재 단계 효과 (Lv.{currentLevel})</span>
                    </span>
                    <span className="font-mono text-emerald-400/80">
                      유지비 {formatKoreanMoney(currentSpec.maintenanceCost)}/시즌
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-200 leading-snug">
                    {currentSpec.currentEffectText}
                  </span>
                </div>

                {/* 2) 다음 단계(Lv+1) 효과 미리보기 */}
                {!isMaxLevel && nextSpec ? (
                  <div className="p-2.5 rounded-xl bg-cyan-950/25 border border-cyan-500/25 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>다음 단계 미리보기 ({nextSpec.name} - Lv.{nextLevel})</span>
                      </span>
                    </div>
                    <span className="text-xs font-medium text-cyan-100/90 leading-snug">
                      {currentSpec.nextEffectPreviewText || nextSpec.currentEffectText}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-950/20 border border-amber-500/20 text-center">
                    <span className="text-[11px] font-bold text-amber-300">
                      ★ 최고 레벨에 도달하여 최대 버프가 영구 적용 중입니다.
                    </span>
                  </div>
                )}
              </div>

              {/* 카드 하단: 공사비용 & 업그레이드 액션 영역 */}
              <div className="p-3.5 pt-2.5 border-t border-slate-800/80 bg-slate-950/70 flex flex-col gap-2">
                {!isMaxLevel && nextSpec ? (
                  <>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1 text-slate-300">
                        <span className="text-[11px] text-slate-400">공사비:</span>
                        <span className="font-bold text-amber-300">
                          {formatKoreanMoney(nextSpec.upgradeCost)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>추가 유지비:</span>
                        <span className="font-bold text-rose-300">
                          +{formatKoreanMoney(additionalMaintenance)}/시즌
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => setConfirmFacilityId(facility.id)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 touch-manipulation shadow-md ${
                        canAfford
                          ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                          : "bg-slate-800 border border-slate-700/80 text-slate-500 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>
                        {canAfford
                          ? `Lv.${nextLevel}로 확장 공사`
                          : `자금 부족 (${formatKoreanMoney(nextSpec.upgradeCost)})`}
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>최고 레벨 도달 (MAX)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= 3. 확장 공사 확인 모달 ================= */}
      {mounted &&
        confirmFacilityId &&
        pendingFacility &&
        pendingNextSpec &&
        pendingCurrentSpec &&
        createPortal(
          <div
            onClick={() => setConfirmFacilityId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 select-none"
            >
              {/* 모달 헤더 */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      시설 증축 공사 승인
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {pendingFacility.nameKr} 확장
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmFacilityId(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 모달 본문 */}
              <div className="p-4 flex flex-col gap-3">
                {/* 레벨 상승 배지 */}
                <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400">현재</span>
                    <span className="text-sm font-bold font-mono text-slate-200">
                      Lv.{pendingCurrentLevel}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {pendingCurrentSpec.name}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-cyan-400" />

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-cyan-400">확장 후</span>
                    <span className="text-sm font-bold font-mono text-cyan-300">
                      Lv.{pendingNextLevel}
                    </span>
                    <span className="text-[10px] text-cyan-300">
                      {pendingNextSpec.name}
                    </span>
                  </div>
                </div>

                {/* 비용 및 자금 계산표 */}
                <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-3 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">일회성 공사비:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {formatKoreanMoney(pendingNextSpec.upgradeCost)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">현재 보유 자금:</span>
                    <span className="font-mono text-slate-200">
                      {formatKoreanMoney(currentBalance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400">공사 후 잔여 자금:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {formatKoreanMoney(
                        currentBalance - pendingNextSpec.upgradeCost
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">시즌 유지비 변동:</span>
                    <span className="font-mono text-rose-300">
                      {formatKoreanMoney(pendingCurrentSpec.maintenanceCost)} ➔{" "}
                      {formatKoreanMoney(pendingNextSpec.maintenanceCost)}/시즌
                    </span>
                  </div>
                </div>

                {/* 다음 단계 효과 요약 */}
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>증축 완료 시 신규 효과</span>
                  </span>
                  <span className="text-xs text-cyan-100 font-medium leading-relaxed">
                    {pendingNextSpec.currentEffectText}
                  </span>
                </div>
              </div>

              {/* 모달 하단 버튼 */}
              <div className="p-4 pt-2 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmFacilityId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                >
                  <Hammer className="w-3.5 h-3.5" />
                  <span>공사 승인 및 착공</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ================= 4. 안내 토스트 ================= */}
      {mounted &&
        toastMessage &&
        createPortal(
          <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center pointer-events-none px-4">
            <div className="max-w-[390px] px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/60 text-cyan-100 text-xs font-bold shadow-[0_8px_30px_rgba(0,0,0,0.85)] flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
