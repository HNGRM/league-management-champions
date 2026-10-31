"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Dumbbell,
  Heart,
  Zap,
  Building2,
  AlertTriangle,
  Settings,
  Sparkles,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Player } from "@/types/player";
import { Coach } from "@/types/coach";
import { PlayerTrainingAssignment, getTrainingTypeInfo } from "@/types/training";
import { getChampionById } from "@/data/champions";
import { sortPlayersByRoleOrder } from "@/utils/playerAssignment";
import {
  getTrainingCoachBuff,
  getWellnessCenterInfo,
  smartAutoAssignTraining,
  getSmartTrainingAssignment,
} from "@/utils/trainingCalculator";
import TrainingSettingModal from "./TrainingSettingModal";

interface MyTeamTrainingViewProps {
  players: Player[];
  coaches: Coach[];
  onUpdatePlayer?: (
    playerId: string,
    updater: Partial<Player> | ((prev: Player) => Player)
  ) => void;
  onSetPlayers?: (players: Player[]) => void;
}

export default function MyTeamTrainingView({
  players,
  coaches,
  onUpdatePlayer,
  onSetPlayers,
}: MyTeamTrainingViewProps) {
  // 모달 제어 상태
  const [mounted, setMounted] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // 훈련 코치 및 웰니스 센터 정보
  const { coach: trainingCoach, buffPercent } = useMemo(
    () => getTrainingCoachBuff(coaches),
    [coaches]
  );

  const wellnessInfo = useMemo(() => getWellnessCenterInfo(1), []);

  // 주전 순 -> 후보 순 정렬
  const sortedPlayers = useMemo(
    () => sortPlayersByRoleOrder(players),
    [players]
  );

  // 개별 선수 훈련 설정 모달 오픈
  const handleOpenSetting = (player: Player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  // 개별 선수 훈련 설정 확정
  const handleConfirmSetting = (
    playerId: string,
    assignment: PlayerTrainingAssignment
  ) => {
    if (onUpdatePlayer) {
      onUpdatePlayer(playerId, { trainingAssignment: assignment });
    } else if (onSetPlayers) {
      onSetPlayers(
        players.map((p) =>
          p.profile.playerId === playerId
            ? { ...p, trainingAssignment: assignment }
            : p
        )
      );
    }
    showToast("훈련 설정이 변경되었습니다.");
  };

  // [⚡ 스마트 자동 배정] 실행
  const handleSmartAutoAssign = () => {
    const updated = smartAutoAssignTraining(players);
    if (onSetPlayers) {
      onSetPlayers(updated);
    } else if (onUpdatePlayer) {
      updated.forEach((p) => {
        onUpdatePlayer(p.profile.playerId, {
          trainingAssignment: p.trainingAssignment,
        });
      });
    }
    showToast("선수단 스마트 훈련 자동 배정이 완료되었습니다.");
  };

  return (
    <div className="flex flex-col gap-3 pb-6 select-none animate-in fade-in duration-200 relative">
      {/* ================= 1. 상단 상태 & 유틸리티 바 ================= */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800 rounded-2xl p-3.5 shadow-sm flex flex-col gap-3 relative overflow-hidden">
        {/* 상단 1열: 타이틀 및 스마트 자동 배정 버튼 */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                선수단 훈련 관리
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                주간 훈련 및 연습 챔피언 배정
              </span>
            </div>
          </div>

          {/* ⚡ 스마트 자동 배정 버튼 */}
          <button
            type="button"
            onClick={handleSmartAutoAssign}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer active:scale-95 touch-manipulation shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>스마트 자동 배정</span>
          </button>
        </div>

        {/* 상단 2열: 훈련 코치 효과 & 웰니스 센터 카드 2단 그리드 */}
        <div className="grid grid-cols-2 gap-2 relative z-10 pt-2 border-t border-slate-800/80 text-xs">
          {/* 🏋️‍♂️ 훈련 코치 효과 */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <span>🏋️‍♂️</span>
                <span>훈련 코치 효과</span>
              </span>
              {trainingCoach ? (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  +{buffPercent}% 부여 중
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-500 border border-slate-700">
                  공석
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
              {trainingCoach ? (
                <span className="text-xs font-bold text-white truncate">
                  {trainingCoach.profile.nicknameEn} ({trainingCoach.profile.nicknameKr})
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500 truncate">
                  미배정 - 훈련 버프 없음
                </span>
              )}
            </div>
          </div>

          {/* 🏥 웰니스 센터 시설 */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <span>🏥</span>
                <span>웰니스 센터 시설</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                +{wellnessInfo.recoveryPercent}% 회복
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
              <span className="text-xs font-bold text-white truncate">
                팀 시설 Lv.{wellnessInfo.level}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                (휴식 시 체력 회복)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. 선수단 훈련 매트릭스 카드 리스트 ================= */}
      <div className="flex flex-col gap-2">
        {sortedPlayers.map((player) => {
          const isStarter = player.contractAndRole?.rosterStatus === "Starter";
          const stamina = player.conditionAndForm?.stamina ?? 100;

          // 체력 상태별 색상 및 경고 분기
          const isExhausted = stamina <= 20;
          const isWarning = stamina > 20 && stamina <= 30;

          let staminaColor = "text-emerald-400";
          let staminaBg = "bg-emerald-500";
          if (isExhausted) {
            staminaColor = "text-rose-400 animate-pulse";
            staminaBg = "bg-rose-500 animate-pulse";
          } else if (isWarning) {
            staminaColor = "text-orange-400";
            staminaBg = "bg-orange-500";
          } else if (stamina <= 60) {
            staminaColor = "text-amber-300";
            staminaBg = "bg-amber-400";
          }

          // 현재 배정된 훈련 정보 (없으면 스마트 기본값 조회)
          const assignment: PlayerTrainingAssignment =
            player.trainingAssignment || getSmartTrainingAssignment(player);

          const trainingInfo = getTrainingTypeInfo(assignment.trainingType);

          // 연습 챔피언 정보
          const targetChamp = assignment.targetChampionId
            ? getChampionById(assignment.targetChampionId)
            : null;

          const mastery =
            assignment.targetChampionId &&
            player.traitsAndMastery?.championMastery
              ? player.traitsAndMastery.championMastery[
                  assignment.targetChampionId
                ] ?? 0
              : 0;

          return (
            <div
              key={player.profile.playerId}
              className={`p-3 rounded-2xl border transition-all flex flex-col gap-2.5 relative overflow-hidden ${
                isExhausted
                  ? "bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                  : isStarter
                  ? "bg-slate-900/85 border-slate-800 hover:border-slate-700"
                  : "bg-slate-950/60 border-slate-800/70 opacity-90 hover:opacity-100"
              }`}
            >
              {/* 좌측 강조 바 */}
              {isStarter && (
                <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500" />
              )}

              {/* 1열: 선수 정보, 포지션, 주전/후보 뱃지, 체력 게이지 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* 포지션 뱃지 */}
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-cyan-300 font-mono font-bold text-[10px] shrink-0">
                    {player.contractAndRole?.mainPos}
                  </span>

                  {/* 닉네임 */}
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                    {player.profile.nicknameEn}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                    ({player.profile.nicknameKr})
                  </span>

                  {/* 주전 / 후보 라벨 */}
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      isStarter
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {isStarter ? "주전" : "후보"}
                  </span>
                </div>

                {/* 체력 표시 및 게이지 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isExhausted && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>[⚠️ 탈진 위험]</span>
                    </span>
                  )}
                  <span className={`text-xs font-mono font-bold ${staminaColor}`}>
                    체력 {stamina}%
                  </span>
                  <div className="w-14 sm:w-16 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${staminaBg}`}
                      style={{ width: `${stamina}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 2열: 배정된 훈련 종목 & 연습 챔피언 & [설정 / 변경] 버튼 */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 flex-wrap">
                {/* 배정 훈련 뱃지 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      훈련:
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${trainingInfo.badgeBg} ${trainingInfo.badgeBorder} ${trainingInfo.badgeText}`}
                    >
                      <span>{trainingInfo.icon}</span>
                      <span>{trainingInfo.label}</span>
                    </span>
                  </div>

                  {/* 훈련 체력 소모/회복 안내 */}
                  <span className="text-[10px] font-mono text-slate-500">
                    {assignment.trainingType === "REST"
                      ? "(체력 +15% 회복)"
                      : isStarter
                      ? "(주간 -20% 소모)"
                      : "(훈련 -10% 소모)"}
                  </span>
                </div>

                {/* 우측: 연습 챔피언 & 설정 버튼 */}
                <div className="flex items-center gap-2.5 ml-auto">
                  {/* 연습 챔피언 썸네일 & 정보 */}
                  {assignment.trainingType === "REST" || !targetChamp ? (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <span>연습:</span>
                      <span className="text-slate-600 font-medium">[-]</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800/80 rounded-xl px-2 py-1">
                      {/* 1:1 초상화 썸네일 (32x32) */}
                      <div className="w-8 h-8 rounded-lg overflow-hidden relative bg-slate-900 border border-slate-700/80 shrink-0">
                        <img
                          src={targetChamp.images.portrait}
                          alt={targetChamp.nameKr}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold text-slate-200">
                          {targetChamp.nameKr}
                        </span>
                        <span className="text-[9px] text-cyan-300 font-mono">
                          숙련도 {mastery}점
                        </span>
                      </div>
                    </div>
                  )}

                  {/* [설정 / 변경] 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleOpenSetting(player)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 touch-manipulation shrink-0"
                  >
                    <Settings className="w-3 h-3 text-cyan-400" />
                    <span>설정 / 변경</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= 3. 훈련 설정 모달 ================= */}
      <TrainingSettingModal
        player={selectedPlayer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSetting}
      />

      {/* ================= 4. 안내 토스트 (Portal로 섀시 중앙 및 뷰포트 정렬) ================= */}
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
