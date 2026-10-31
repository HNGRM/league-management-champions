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
  Hammer,
  Crown,
  X,
  ArrowRight,
  ChevronRight,
  Coins,
} from "lucide-react";
import {
  FacilityId,
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
  const [selectedFacilityId, setSelectedFacilityId] = useState<FacilityId | null>(null);
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

  // 모달 내부에서 확장 공사 실행
  const handleUpgrade = (facilityId: FacilityId) => {
    const currentLvl = facilities[facilityId] ?? 1;
    const targetLvl = currentLvl + 1;
    const facility = getFacilityById(facilityId);

    const success = upgradeFacility(facilityId);
    if (success) {
      showToast(
        `${facility.nameKr}이(가) Lv.${targetLvl} 시설로 성공적으로 증축되었습니다!`
      );
    } else {
      showToast("보유 자금이 부족하여 시설 확장을 진행할 수 없습니다.");
    }
  };

  // 현재 모달로 열람 중인 시설 정보
  const activeFacility = selectedFacilityId
    ? getFacilityById(selectedFacilityId)
    : null;
  const activeCurrentLevel = selectedFacilityId
    ? facilities[selectedFacilityId] ?? 1
    : 1;
  const isMaxLevel = activeCurrentLevel >= 5;
  const activeNextLevel = activeCurrentLevel + 1;

  const activeCurrentSpec = selectedFacilityId
    ? getFacilityLevelSpec(selectedFacilityId, activeCurrentLevel)
    : null;
  const activeNextSpec =
    selectedFacilityId && !isMaxLevel
      ? getFacilityLevelSpec(selectedFacilityId, activeNextLevel)
      : null;

  const canAfford =
    activeNextSpec ? currentBalance >= activeNextSpec.upgradeCost : false;
  const additionalMaintenance =
    activeNextSpec && activeCurrentSpec
      ? activeNextSpec.maintenanceCost - activeCurrentSpec.maintenanceCost
      : 0;

  return (
    <div className="flex flex-col gap-2.5 pb-6 select-none animate-in fade-in duration-200 relative">
      {/* ================= 1. 상단 요약 바 ================= */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-slate-800 rounded-2xl p-3 shadow-sm flex flex-col gap-2 relative overflow-hidden">
        {/* 네온 글로우 */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 1열: 타이틀 & 팀 가치 기여 뱃지 */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                팀 4대 시설 관리
              </span>
              <span className="text-[9px] text-slate-400 font-mono truncate">
                시설 증축 및 영구 버프 시스템
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[9px] font-bold text-cyan-300 shadow-sm shrink-0">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span>팀 가치 반영</span>
          </div>
        </div>

        {/* 2열: 보유 자금 & 시설 유지비 총액 카드 2단 그리드 */}
        <div className="grid grid-cols-2 gap-2 relative z-10 pt-1.5 border-t border-slate-800/80 text-xs">
          {/* 💰 팀 총 보유 자금 */}
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Wallet className="w-3 h-3 text-cyan-400" />
                <span>팀 총 보유 자금</span>
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold font-mono text-cyan-300">
              {formatKoreanMoney(currentBalance)}
            </span>
          </div>

          {/* 🏗️ 시즌 시설 유지비 */}
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Wrench className="w-3 h-3 text-rose-400" />
                <span>시즌 시설 유지비</span>
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm font-bold font-mono text-rose-300">
                {formatKoreanMoney(totalMaintenance)}
              </span>
              <span className="text-[9px] text-slate-500 font-mono">/ 시즌</span>
            </div>
          </div>
        </div>

        {/* 누적 시설 투자액 */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/40 px-2.5 py-1 rounded-xl border border-slate-800/60">
          <span>누적 시설 투자액</span>
          <span className="font-mono font-bold text-slate-200">
            {formatKoreanMoney(totalInvestment)}
          </span>
        </div>
      </div>

      {/* ================= 2. 4대 시설 2행 2열 (2x2) 그리드 ================= */}
      {/* 
        좌상단: 홈 경기장 (arena)
        우상단: 트레이닝 센터 (training)
        좌하단: 웰니스 센터 (wellness)
        우하단: 미디어 스튜디오 (media)
      */}
      <div className="grid grid-cols-2 gap-2.5">
        {FACILITIES.map((facility) => {
          const currentLevel = facilities[facility.id] ?? 1;
          const isMax = currentLevel >= 5;
          const currentSpec = getFacilityLevelSpec(facility.id, currentLevel);

          return (
            <button
              key={facility.id}
              type="button"
              onClick={() => setSelectedFacilityId(facility.id)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/60 shadow-md text-left transition-all duration-150 active:scale-95 cursor-pointer flex flex-col justify-between p-2.5"
            >
              {/* 시설 배경 이미지 */}
              <img
                src={facility.imageUrl}
                alt={facility.nameKr}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* 어두운 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-black/60 pointer-events-none" />

              {/* 상단 1열: 기능(분류) 뱃지 & 레벨 뱃지 */}
              <div className="relative z-10 flex items-center justify-between w-full gap-1">
                {/* 분류 뱃지 (ex: 재정/수익) */}
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-md ${facility.categoryBadgeClass}`}
                >
                  {facility.category}
                </span>

                {/* 몇 레벨 시설인지 (ex: Lv.1/5) */}
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border backdrop-blur-md ${
                    isMax
                      ? "bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-sm"
                      : "bg-cyan-950/90 text-cyan-300 border-cyan-500/60"
                  }`}
                >
                  {isMax && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                  <span>Lv.{currentLevel}/5</span>
                </span>
              </div>

              {/* 하단 2열: 시설 이름 & 몇 레벨 시설 명칭 */}
              <div className="relative z-10 flex flex-col leading-tight mt-auto">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-sm font-black text-white tracking-tight drop-shadow-md">
                    {facility.nameKr}
                  </span>
                  <span className="text-[9px] text-cyan-300/80 font-mono">
                    {facility.nameEn}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-cyan-300 drop-shadow-sm mt-0.5 truncate">
                  Lv.{currentLevel} {currentSpec.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 안내 힌트 문구 */}
      <div className="text-center text-[10px] text-slate-500 font-medium">
        시설 카드를 터치하면 상세 버프 효과 및 확장 공사 메뉴가 열립니다.
      </div>

      {/* ================= 3. 시설 상세 & 확장 공사 모달 (Portal 렌더링) ================= */}
      {mounted &&
        selectedFacilityId &&
        activeFacility &&
        activeCurrentSpec &&
        createPortal(
          <div
            onClick={() => setSelectedFacilityId(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] max-h-[92vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 select-none"
            >
              {/* 모달 상단 16:9 비주얼 영역 */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950 shrink-0">
                <img
                  src={activeFacility.imageUrl}
                  alt={activeFacility.nameKr}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/60 pointer-events-none" />

                {/* 상단 뱃지 & 닫기 버튼 */}
                <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${activeFacility.categoryBadgeClass}`}
                    >
                      {activeFacility.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border backdrop-blur-md ${
                        isMaxLevel
                          ? "bg-amber-950/90 text-amber-300 border-amber-500/60"
                          : "bg-cyan-950/90 text-cyan-300 border-cyan-500/60"
                      }`}
                    >
                      {isMaxLevel && <Crown className="w-3 h-3 text-amber-400" />}
                      <span>Lv.{activeCurrentLevel} / 5</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFacilityId(null)}
                    className="p-1 rounded-full bg-slate-950/70 border border-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer"
                    aria-label="닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 시설 타이틀 오버레이 */}
                <div className="absolute bottom-2.5 left-3 right-3 z-10 flex flex-col leading-tight">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-black text-white tracking-tight drop-shadow-md">
                      {activeFacility.nameKr}
                    </span>
                    <span className="text-[10px] text-cyan-300/80 font-mono">
                      {activeFacility.nameEn}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-cyan-300 drop-shadow-sm mt-0.5">
                    [{activeCurrentSpec.name}]
                  </span>
                </div>
              </div>

              {/* 모달 스크롤 본문 */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
                {/* 1) 현재 단계 효과 */}
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/35 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>현재 적용 효과 (Lv.{activeCurrentLevel})</span>
                    </span>
                    <span className="font-mono text-emerald-400/80">
                      유지비 {formatKoreanMoney(activeCurrentSpec.maintenanceCost)}/시즌
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-200 leading-snug">
                    {activeCurrentSpec.currentEffectText}
                  </span>
                </div>

                {/* 2) 다음 단계(Lv+1) 효과 미리보기 */}
                {!isMaxLevel && activeNextSpec ? (
                  <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/35 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          다음 단계 미리보기 ({activeNextSpec.name} - Lv.{activeNextLevel})
                        </span>
                      </span>
                    </div>
                    <span className="text-xs font-medium text-cyan-100 leading-snug">
                      {activeCurrentSpec.nextEffectPreviewText ||
                        activeNextSpec.currentEffectText}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-center flex flex-col items-center gap-1">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      최고 레벨에 도달하여 최대 영구 버프가 적용 중입니다.
                    </span>
                  </div>
                )}

                {/* 3) 비용 및 자금 계산표 */}
                {!isMaxLevel && activeNextSpec && (
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-3 flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">일회성 공사비:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {formatKoreanMoney(activeNextSpec.upgradeCost)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">현재 보유 자금:</span>
                      <span className="font-mono text-slate-200">
                        {formatKoreanMoney(currentBalance)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400 font-medium">공사 후 잔여 자금:</span>
                      <span
                        className={`font-mono font-bold ${
                          canAfford ? "text-cyan-300" : "text-rose-400"
                        }`}
                      >
                        {formatKoreanMoney(
                          currentBalance - activeNextSpec.upgradeCost
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-medium">시즌 유지비 변동:</span>
                      <span className="font-mono text-rose-300">
                        {formatKoreanMoney(activeCurrentSpec.maintenanceCost)} ➔{" "}
                        {formatKoreanMoney(activeNextSpec.maintenanceCost)}/시즌
                        <span className="text-slate-400 ml-1">
                          (+{formatKoreanMoney(additionalMaintenance)})
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 모달 하단 액션 버튼 */}
              <div className="p-4 pt-2 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFacilityId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  닫기
                </button>

                {!isMaxLevel && activeNextSpec ? (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleUpgrade(selectedFacilityId)}
                    className={`flex-2 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 touch-manipulation shadow-md ${
                      canAfford
                        ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                        : "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>
                      {canAfford
                        ? `Lv.${activeNextLevel}로 확장 공사`
                        : `자금 부족`}
                    </span>
                  </button>
                ) : (
                  <div className="flex-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>최고 레벨 도달 (MAX)</span>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ================= 4. 안내 토스트 (Portal 렌더링) ================= */}
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
