"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, PlusCircle, Lock, AlertCircle, Sparkles, ChevronRight, ChevronsDown } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";

export default function SlotSelectScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const slots = useGameStore((state) => state.slots);
  const setSelectedSlotId = useGameStore((state) => state.setSelectedSlotId);
  const resetCreationState = useGameStore((state) => state.resetCreationState);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 마우스 드래그 스크롤 지원
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);
  const hasMovedRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleSlotClick = (slotId: number, isLocked: boolean) => {
    // 드래그 중 실수로 클릭되는 현상 방지
    if (hasMovedRef.current) return;

    if (isLocked) {
      showToast("팀 생성은 하나만 만들 수 있습니다.");
      return;
    }

    // 이미 생성된 팀 슬롯이면 바로 메인 게임 화면으로 진입
    const targetSlot = slots.find((s) => s.id === slotId);
    if (targetSlot?.isCreated && targetSlot.team) {
      setSelectedSlotId(slotId);
      useGameStore.setState({
        currentTeam: targetSlot.team,
        myPlayers: targetSlot.myPlayers || targetSlot.team.roster || [],
        ...(targetSlot.customTeamInfo ? { customTeamInfo: targetSlot.customTeamInfo } : {}),
        ...(targetSlot.managerProfile ? { managerProfile: targetSlot.managerProfile } : {}),
        ...(targetSlot.selectedLeague ? { selectedLeague: targetSlot.selectedLeague } : {}),
        ...(targetSlot.selectedTeam ? { selectedTeam: targetSlot.selectedTeam } : {}),
      });
      setScreen("DASHBOARD");
      return;
    }

    // 신규 생성 시 이전 생성 데이터 완전 초기화
    resetCreationState();
    setSelectedSlotId(slotId);
    setScreen("TEAM_CREATE");
  };

  // 마우스 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startYRef.current = e.pageY - scrollContainerRef.current.offsetTop;
    scrollTopRef.current = scrollContainerRef.current.scrollTop;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walk = (y - startYRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    scrollContainerRef.current.scrollTop = scrollTopRef.current - walk;
  };

  return (
    <div className="relative z-10 flex-1 flex flex-col justify-between h-full animate-in fade-in duration-200 select-none">
      {/* 토스트 메시지 안내 */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-cyan-500/40 text-cyan-200 text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 상단 네비게이션 헤더 */}
      <div className="pt-4 px-5 shrink-0 relative z-30">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
          <button
            type="button"
            onClick={() => setScreen("TITLE")}
            className="w-9 h-9 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5 pointer-events-none" />
          </button>

          <div className="text-center">
            <h2 className="text-base font-bold text-white tracking-wide">
              팀 슬롯 선택
            </h2>
            <p className="text-[10px] text-cyan-400/70 font-mono">
              SAVE & LOAD SLOTS (1 / {slots.length})
            </p>
          </div>

          <div className="w-9 h-9" />
        </div>
      </div>

      {/* 슬롯 상단 상태 요약 바 */}
      <div className="px-5 pt-3 pb-1 shrink-0 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          전체 슬롯: {slots.length}개
        </span>
        <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
          <ChevronsDown className="w-3.5 h-3.5 animate-bounce" />
          드래그하여 탐색
        </span>
      </div>

      {/* 본문: 8개 직사각형 슬롯 리스트 */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-3 custom-scrollbar cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {slots.map((slot) => {
          if (!slot.isLocked) {
            // 1번 칸: 활성화된 "팀 생성하기" 직사각형 칸
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleSlotClick(slot.id, false)}
                className="group relative w-full text-left p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0a1a38]/90 to-slate-900/90 border border-cyan-400/50 hover:border-cyan-300 shadow-[0_4px_20px_rgba(6,182,212,0.18)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.3)] transition-all duration-150 active:scale-[0.98] cursor-pointer overflow-hidden shrink-0 touch-manipulation"
              >
                {/* 상단 하이라이트 라인 */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-sky-300 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-3.5">
                    {/* 플러스 아이콘 배지 */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/30 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                      <PlusCircle className="w-6 h-6 text-cyan-300" strokeWidth={2.2} />
                    </div>

                    {/* 슬롯 텍스트 정보 */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          SLOT 0{slot.id}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-amber-300/90 font-medium">
                          <Sparkles className="w-2.5 h-2.5" />
                          생성 가능
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors mt-0.5">
                        팀 생성하기
                      </h3>
                      <p className="text-[11px] text-slate-300/70 mt-0.5">
                        새로운 e스포츠 팀을 창단하고 리그에 참가합니다.
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-cyan-400/70 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              </button>
            );
          }

          // 2 ~ 8번 칸: 회색빛 + 사선 빗금 패턴의 잠긴 칸
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => handleSlotClick(slot.id, true)}
              className="relative w-full text-left p-4 rounded-2xl bg-slate-900/50 border border-slate-700/40 text-slate-400 overflow-hidden cursor-not-allowed transition-colors hover:border-slate-600/50 shrink-0 touch-manipulation active:scale-[0.99]"
            >
              {/* 사선 빗금 오버레이 */}
              <div className="absolute inset-0 stripe-pattern opacity-60 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3.5">
                  {/* 잠금 아이콘 배지 (회색빛 톤) */}
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>

                  {/* 슬롯 텍스트 정보 */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        SLOT 0{slot.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        비활성화됨
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-400 line-through decoration-slate-600 decoration-1 mt-0.5">
                      팀 생성하기
                    </h3>
                    <p className="text-[11px] text-slate-400/80 mt-0.5">
                      팀 생성은 하나만 만들 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 shrink-0 ml-2">
                  <span className="text-[10px] px-2 py-1 rounded bg-slate-800/90 text-slate-400 border border-slate-700/50 font-mono">
                    LOCKED
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {/* 하단 스크롤 끝 여백 */}
        <div className="h-4 shrink-0" />
      </div>

      {/* 하단 고정 가이드 바 */}
      <div className="px-5 pb-5 pt-2 shrink-0">
        <div className="rounded-xl bg-slate-900/70 border border-cyan-900/40 p-3 text-[11px] text-slate-400 flex items-start gap-2.5 backdrop-blur-sm">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            현재 단일 팀 운영 시스템으로 제한되어 있어 1번 슬롯만 생성할 수 있습니다. 슬롯을 상하로 드래그하여 전체 8개 슬롯을 확인해 보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
