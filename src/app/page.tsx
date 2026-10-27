"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";
import TitleScreen from "@/components/TitleScreen";
import SlotSelectScreen from "@/components/SlotSelectScreen";
import TeamCreateScreen from "@/components/TeamCreateScreen";
import ManagerCreateScreen from "@/components/ManagerCreateScreen";
import DashboardScreen from "@/components/DashboardScreen";

export default function Home() {
  const currentScreen = useGameStore((state) => state.currentScreen);

  return (
    <div className="relative w-full h-[100dvh] max-w-[430px] flex flex-col justify-between overflow-hidden shadow-2xl bg-[#030d22] sm:border sm:border-cyan-900/40 sm:rounded-3xl sm:h-[92dvh]">
      {/* 1. 배경 레이어: 파란 그라데이션 + 천천히 움직이는 격자무늬 패턴 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#061533] via-[#091e46] to-[#020917] pointer-events-none" />

      {/* 천천히 움직이는 격자무늬 */}
      <div className="absolute inset-0 animate-grid opacity-65 pointer-events-none" />

      {/* 앰비언트 블루 & 사이언 조명 효과 */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-subtle-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* 화면 전환 렌더링 */}
      {currentScreen === "TITLE" && <TitleScreen />}
      {currentScreen === "SLOT_SELECT" && <SlotSelectScreen />}
      {currentScreen === "TEAM_CREATE" && <TeamCreateScreen />}
      {currentScreen === "MANAGER_CREATE" && <ManagerCreateScreen />}
      {currentScreen === "DASHBOARD" && <DashboardScreen />}
    </div>
  );
}
