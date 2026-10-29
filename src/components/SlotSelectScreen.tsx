"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, PlusCircle, Lock, AlertCircle, Sparkles, ChevronRight, ChevronsDown, Loader2, Cloud } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { fetchUserSlots } from "@/lib/saveManager";

export default function SlotSelectScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const slots = useGameStore((state) => state.slots);
  const setSlots = useGameStore((state) => state.setSlots);
  const currentUser = useGameStore((state) => state.currentUser);
  const setSelectedSlotId = useGameStore((state) => state.setSelectedSlotId);
  const resetCreationState = useGameStore((state) => state.resetCreationState);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingCloud, setLoadingCloud] = useState(false);

  // 마우스 드래그 스크롤 참조
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);
  const hasMovedRef = useRef(false);

  // 클라우드 세이브 슬롯 로딩
  useEffect(() => {
    if (currentUser?.id) {
      setLoadingCloud(true);
      fetchUserSlots(currentUser.id)
        .then((cloudSlots) => {
          setSlots(cloudSlots);
        })
        .finally(() => {
          setLoadingCloud(false);
        });
    }
  }, [currentUser?.id, setSlots]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleSlotClick = (slotId: number, isLocked: boolean) => {
    if (hasMovedRef.current) return;

    if (isLocked) {
      showToast("이전 슬롯을 먼저 생성해야 잠금 해제됩니다.");
      return;
    }

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

    // 신규 슬롯 생성 시 기존 생성 상태 초기화
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
    e.preventDefault();
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walk = (y - startYRef.current) * 1.3;
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

      {/* 상단 네비게이션 바 */}
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
            <h2 className="text-base font-bold text-white tracking-wide flex items-center justify-center gap-1.5">
              <span>슬롯 선택</span>
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            </h2>
            <p className="text-[10px] text-cyan-400/70 font-mono">
              CLOUD SAVE SLOTS (1 / {slots.length})
            </p>
          </div>

          <div className="w-9 h-9 flex items-center justify-center">
            {loadingCloud && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
          </div>
        </div>
      </div>

      {/* 서브 가이드 정보 */}
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

      {/* 메인: 8개 직사각형 슬롯 리스트 */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex-1 overflow-y-auto px-5 py-3 space-y-3 cursor-grab active:cursor-grabbing scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
      >
        {slots.map((slot) => {
          const isSlotActive = slot.isCreated;
          const isSlotLocked = slot.isLocked;

          return (
            <div
              key={slot.id}
              onClick={() => handleSlotClick(slot.id, isSlotLocked)}
              className={`relative w-full rounded-2xl p-4 transition-all duration-200 border text-left overflow-hidden select-none touch-manipulation ${
                isSlotLocked
                  ? "bg-slate-950/40 border-slate-800/40 opacity-45 cursor-not-allowed"
                  : isSlotActive
                  ? "bg-gradient-to-r from-slate-900/90 via-cyan-950/30 to-blue-950/40 border-cyan-500/40 hover:border-cyan-400/70 cursor-pointer shadow-[0_4px_20px_rgba(6,182,212,0.15)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.3)] active:scale-[0.98]"
                  : "bg-slate-900/60 border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer hover:bg-slate-800/60 active:scale-[0.98]"
              }`}
            >
              {/* 슬롯 상단: 번호 및 상태 뱃지 */}
              <div className="flex items-center justify-between mb-2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400/90 tracking-wider">
                    SLOT {String(slot.id).padStart(2, "0")}
                  </span>
                  {isSlotActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      진행 중
                    </span>
                  )}
                </div>

                {/* 잠금 여부 표시 */}
                {isSlotLocked && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Lock className="w-3.5 h-3.5" />
                    <span>LOCKED</span>
                  </div>
                )}
              </div>

              {/* 슬롯 본문 내용 */}
              <div className="pointer-events-none">
                {isSlotActive && slot.team ? (
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-base font-extrabold text-white tracking-wide truncate">
                        {slot.team.name}
                      </h3>
                      <span className="text-xs font-mono text-cyan-300">
                        {slot.selectedLeague || "KCL"} 디비전 D
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>감독: {slot.managerProfile?.name || "지휘관"}</span>
                      <span>로스터: {slot.myPlayers?.length || 5}명</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-cyan-400/80 font-mono border-t border-cyan-900/30">
                      <span>최근 저장: {slot.lastPlayedAt || "클라우드 동기화"}</span>
                      <span className="flex items-center gap-0.5 text-cyan-300 font-bold">
                        이어하기 <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSlotLocked
                            ? "bg-slate-900 text-slate-600"
                            : "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
                        }`}
                      >
                        {isSlotLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <PlusCircle className="w-5 h-5 text-cyan-400 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isSlotLocked ? "text-slate-500" : "text-slate-200"
                          }`}
                        >
                          {isSlotLocked ? "잠긴 슬롯" : "새 게임 생성"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {isSlotLocked
                            ? "이전 슬롯을 먼저 클리어하세요"
                            : "새로운 구단 창단 및 리그 참가"}
                        </p>
                      </div>
                    </div>

                    {!isSlotLocked && (
                      <span className="text-xs text-cyan-400/80 font-mono flex items-center gap-1 font-bold">
                        시작 <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 여백 및 가이드 문구 */}
      <div className="py-3 px-6 text-center text-[11px] text-cyan-500/40 font-mono shrink-0">
        슬롯을 클릭하여 이전 게임을 이어하거나 새로운 구단을 창단하세요.
      </div>
    </div>
  );
}
