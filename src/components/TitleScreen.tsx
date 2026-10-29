"use client";

import React, { useState, useEffect } from "react";
import { Play, Trophy, Shield, Sparkles, User, LogOut, LogIn } from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";

export default function TitleScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const currentUser = useGameStore((state) => state.currentUser);
  const setCurrentUser = useGameStore((state) => state.setCurrentUser);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // 세션 확인 및 구독
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  const handleStartGame = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (currentUser) {
      setScreen("SLOT_SELECT");
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <div className="relative z-10 flex-1 flex flex-col justify-between h-full select-none">
      {/* 상단 상태 바 */}
      <div className="pt-4 px-6 flex justify-between items-center text-xs tracking-wider text-cyan-400/60 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>

        {currentUser ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-cyan-300 font-sans max-w-[120px] truncate">
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {currentUser.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              title="로그아웃"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1 border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 px-2.5 py-0.5 rounded-full text-[10px] text-cyan-300 transition-colors cursor-pointer"
          >
            <LogIn className="w-3 h-3" />
            <span>로그인</span>
          </button>
        )}
      </div>

      {/* 중앙 타이틀 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* 트로피 아이콘 */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-500/20 border border-cyan-400/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.35)]">
            <Trophy className="w-10 h-10 text-cyan-300" strokeWidth={1.8} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400/90 rounded-full p-1 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          </div>
        </div>

        {/* 서브 타이틀 */}
        <div className="flex items-center gap-1.5 mb-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <p className="text-[11px] font-semibold tracking-[0.28em] text-cyan-300 uppercase">
            LoL Esports Simulator
          </p>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex flex-col items-center gap-1">
          <span className="text-slate-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            리그 매니지먼트
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 text-3xl sm:text-[38px] font-extrabold tracking-wider drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
            : 챔피언스
          </span>
        </h1>

        <p className="mt-4 text-xs text-slate-300/80 max-w-[260px] leading-relaxed">
          나만의 e스포츠 구단을 창단하고 최고의 챔피언들과 함께 리그를 정복하세요.
        </p>
      </div>

      {/* 하단 시작 버튼 */}
      <div className="relative z-30 px-7 pb-10 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleStartGame}
          className="relative group w-full py-4 px-6 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer overflow-hidden touch-manipulation active:scale-95 hover:scale-[1.02] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.45)] border border-cyan-300/40 hover:shadow-[0_0_35px_rgba(6,182,212,0.65)]"
        >
          {/* 반사광 효과 */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 pointer-events-none" />

          <Play className="w-5 h-5 fill-current text-cyan-100 pointer-events-none" />
          <span className="text-white drop-shadow-sm pointer-events-none">
            {currentUser ? "게임 시작" : "로그인 후 시작"}
          </span>
        </button>

        <div className="flex justify-between items-center px-1 text-[11px] text-cyan-500/50 font-mono">
          <span>Ver 0.1.0-alpha</span>
          <span className="text-cyan-400/80">Cloud Sync Active</span>
        </div>
      </div>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          setScreen("SLOT_SELECT");
        }}
      />
    </div>
  );
}
