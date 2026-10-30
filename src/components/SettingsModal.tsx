"use client";

import React, { useState } from "react";
import {
  X,
  Gamepad2,
  Monitor,
  Volume2,
  User,
  Info,
  Trash2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import DisbandConfirmModal from "./DisbandConfirmModal";

type SettingsTab = "PLAY" | "DISPLAY" | "AUDIO" | "ACCOUNT" | "ETC";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  managerNameEn: string;
  managerNameKo: string;
  slotNumber: number;
  userEmail?: string | null;
  onDisbandConfirm: () => Promise<void> | void;
}

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "PLAY", label: "플레이", icon: Gamepad2 },
  { id: "DISPLAY", label: "화면", icon: Monitor },
  { id: "AUDIO", label: "오디오", icon: Volume2 },
  { id: "ACCOUNT", label: "계정", icon: User },
  { id: "ETC", label: "기타", icon: Info },
];

export default function SettingsModal({
  isOpen,
  onClose,
  teamName,
  managerNameEn,
  managerNameKo,
  slotNumber,
  userEmail,
  onDisbandConfirm,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("ACCOUNT");
  const [isDisbandModalOpen, setIsDisbandModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in-0 duration-150 select-none">
        <div className="relative w-full max-w-[430px] h-[520px] rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
          {/* 상단 헤더 */}
          <div className="shrink-0 px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white">⚙️ 환경설정</span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">
                SETTINGS
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 메인: 좌측 탭바 + 우측 설정 컨텐츠 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 좌측 탭 내비게이션 바 */}
            <div className="w-[84px] shrink-0 border-r border-slate-800/80 bg-slate-950/90 p-2 flex flex-col gap-1.5 overflow-y-auto scrollbar-none">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isAccount = tab.id === "ACCOUNT";

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full py-2.5 px-1.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative touch-manipulation border ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold"
                        : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-900/50 font-medium"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-cyan-300"
                          : isAccount
                          ? "text-rose-400/80"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="text-[11px] tracking-tight">{tab.label}</span>
                    {isAccount && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 우측 설정 컨텐츠 영역 */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-none flex flex-col">
              {/* 1. 플레이 탭 */}
              {activeTab === "PLAY" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-white">게임플레이 & 시뮬레이션</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      경기 재생 배속, 주요 교전 하이라이트 연출 옵션이 추후 패치에 적용될 예정입니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. 화면 탭 */}
              {activeTab === "DISPLAY" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-white">화면 & UI 연출</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      미니맵 표기 방식 및 모바일 배터리 절약 모드가 추후 패치에 적용될 예정입니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 3. 오디오 탭 */}
              {activeTab === "AUDIO" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-white">오디오 & 사운드</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      BGM, SFX 볼륨 및 군중 함성 On/Off 설정이 추후 패치에 적용될 예정입니다.
                    </p>
                  </div>
                </div>
              )}

              {/* 4. 기타 탭 */}
              {activeTab === "ETC" && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-white">게임 정보</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      League Management: Champions
                      <br />
                      Version 0.1.0-alpha
                    </p>
                  </div>
                </div>
              )}

              {/* 5. 계정 탭 (★ 핵심 기능: 세이브 관리 & 팀 해체) */}
              {activeTab === "ACCOUNT" && (
                <div className="flex flex-col gap-4">
                  {/* 계정 & 현재 세이브 슬롯 정보 */}
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="text-slate-400">연동 계정</span>
                      <span className="font-mono font-bold text-cyan-300 truncate max-w-[150px]">
                        {userEmail || "게스트 감독"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">세이브 슬롯</span>
                      <span className="font-mono font-bold text-white">
                        슬롯 {slotNumber}번
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">현재 팀</span>
                      <span className="font-bold text-white truncate max-w-[150px]">
                        {teamName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">담당 감독</span>
                      <span className="font-medium text-slate-200">
                        {managerNameKo} ({managerNameEn})
                      </span>
                    </div>
                  </div>

                  {/* 위험 구역 (Danger Zone: 팀 해체) */}
                  <div className="rounded-2xl bg-rose-950/20 border border-rose-500/40 p-3.5 flex flex-col gap-2.5 shadow-sm">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-xs font-black tracking-wide">
                        위험 구역 (Danger Zone)
                      </span>
                    </div>

                    <p className="text-[11px] text-rose-300/80 leading-relaxed">
                      현재 슬롯의 구단 데이터를 완전히 해체하고 세이브 파일을 영구 삭제합니다.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsDisbandModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer active:scale-98 touch-manipulation mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      팀 해체 (세이브 삭제)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2단계 확인 팝업 모달 */}
      <DisbandConfirmModal
        isOpen={isDisbandModalOpen}
        teamName={teamName}
        managerNameEn={managerNameEn}
        slotNumber={slotNumber}
        onConfirm={async () => {
          await onDisbandConfirm();
          setIsDisbandModalOpen(false);
          onClose();
        }}
        onClose={() => setIsDisbandModalOpen(false)}
      />
    </>
  );
}
