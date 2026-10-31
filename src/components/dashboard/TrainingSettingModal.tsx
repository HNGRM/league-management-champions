"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  Sparkles,
  Check,
  AlertTriangle,
  Heart,
  Shield,
  Swords,
  Brain,
  Target,
  Users,
  Dumbbell,
} from "lucide-react";
import { Player, Position } from "@/types/player";
import { Champion } from "@/types/champion";
import {
  TrainingType,
  TRAINING_TYPES,
  PlayerTrainingAssignment,
} from "@/types/training";
import { champions, getChampionsByPosition } from "@/data/champions";
import { isTier1Champion } from "@/utils/metaTiers";

interface TrainingSettingModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (playerId: string, assignment: PlayerTrainingAssignment) => void;
}

type PositionFilter = "ALL" | Position;

export default function TrainingSettingModal({
  player,
  isOpen,
  onClose,
  onConfirm,
}: TrainingSettingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 모달 내부 상태
  const [selectedTrainingType, setSelectedTrainingType] =
    useState<TrainingType>("MECHANICS");
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(
    null
  );
  const [posFilter, setPosFilter] = useState<PositionFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // 선수가 바뀔 때 기존 설정 주입
  useEffect(() => {
    if (player) {
      if (player.trainingAssignment) {
        setSelectedTrainingType(player.trainingAssignment.trainingType);
        setSelectedChampionId(player.trainingAssignment.targetChampionId);
      } else {
        // 기본값: 체력 30% 이하면 휴식, 아니면 피지컬 훈련
        const stamina = player.conditionAndForm?.stamina ?? 100;
        if (stamina <= 30) {
          setSelectedTrainingType("REST");
          setSelectedChampionId(null);
        } else {
          setSelectedTrainingType("MECHANICS");
          const posChamps = getChampionsByPosition(
            player.contractAndRole?.mainPos || "MID"
          );
          setSelectedChampionId(posChamps[0]?.id || champions[0]?.id || "001");
        }
      }
      // 선수의 주 포지션으로 필터 기본 선택
      setPosFilter(player.contractAndRole?.mainPos || "ALL");
      setSearchQuery("");
    }
  }, [player, isOpen]);

  // '휴식' 선택 시 챔피언 ID null 처리
  const handleSelectTrainingType = (type: TrainingType) => {
    setSelectedTrainingType(type);
    if (type === "REST") {
      setSelectedChampionId(null);
    } else if (!selectedChampionId) {
      // 챔피언이 선택되어 있지 않으면 기본 챔피언 선택
      const posChamps = getChampionsByPosition(
        player?.contractAndRole?.mainPos || "MID"
      );
      setSelectedChampionId(posChamps[0]?.id || champions[0]?.id || "001");
    }
  };

  // 챔피언 필터링 및 정렬
  const filteredChampions = useMemo(() => {
    let list: Champion[] = champions;

    // 1. 포지션 필터
    if (posFilter !== "ALL") {
      list = getChampionsByPosition(posFilter);
    }

    // 2. 한글 검색어 필터
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.nameKr.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q)
      );
    }

    // 3. 정렬: 1티어 챔피언 우선 -> 숙련도 높은 순 -> ID 오름차순
    const masteryMap = player?.traitsAndMastery?.championMastery || {};
    return [...list].sort((a, b) => {
      const aTier = isTier1Champion(a.id) ? 1 : 0;
      const bTier = isTier1Champion(b.id) ? 1 : 0;
      if (bTier !== aTier) return bTier - aTier;

      const aMastery = masteryMap[a.id] ?? 0;
      const bMastery = masteryMap[b.id] ?? 0;
      if (bMastery !== aMastery) return bMastery - aMastery;

      return a.id.localeCompare(b.id);
    });
  }, [posFilter, searchQuery, player]);

  if (!mounted || !isOpen || !player) return null;

  const stamina = player.conditionAndForm?.stamina ?? 100;
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

  const masteryMap = player.traitsAndMastery?.championMastery || {};

  const handleConfirm = () => {
    onConfirm(player.profile.playerId, {
      trainingType: selectedTrainingType,
      targetChampionId:
        selectedTrainingType === "REST" ? null : selectedChampionId,
    });
    onClose();
  };

  const POS_TABS: { id: PositionFilter; label: string }[] = [
    { id: "ALL", label: "전체" },
    { id: "TOP", label: "탑" },
    { id: "JGL", label: "정글" },
    { id: "MID", label: "미드" },
    { id: "BOT", label: "바텀" },
    { id: "SUP", label: "서폿" },
  ];

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] max-h-[92vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 select-none"
      >
        {/* ================= 1. 모달 헤더 ================= */}
        <div className="shrink-0 p-4 border-b border-slate-800/80 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  {player.profile.nicknameEn} ({player.profile.nicknameKr})
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  {player.contractAndRole?.mainPos}
                </span>
                <span className="text-[10px] text-slate-400">
                  {player.contractAndRole?.rosterStatus === "Starter"
                    ? "주전"
                    : "후보"}
                </span>
              </div>
              {/* 체력 표시 */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-400 font-medium">
                  현재 체력:
                </span>
                <span className={`text-xs font-mono font-bold ${staminaColor}`}>
                  {stamina}%
                </span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${staminaBg}`}
                    style={{ width: `${stamina}%` }}
                  />
                </div>
                {isExhausted && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    탈진 위험
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer active:scale-95 shrink-0"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= 모달 본문 스크롤 영역 ================= */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
          {/* ================= Step 1. 훈련 종목 선택 ================= */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-mono font-bold">
                  1
                </span>
                훈련 종목 선택 (6종)
              </span>
              <span className="text-[10px] text-slate-400">
                훈련 시 주당 체력 -10%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TRAINING_TYPES.map((type) => {
                const isSelected = selectedTrainingType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSelectTrainingType(type.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] flex flex-col gap-1 relative ${
                      isSelected
                        ? "bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{type.icon}</span>
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? "text-cyan-200" : "text-slate-200"
                          }`}
                        >
                          {type.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 leading-tight">
                      {type.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= Step 2. 연습할 챔피언 선택 (80종 카드 그리드) ================= */}
          {selectedTrainingType === "REST" ? (
            <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-950/20 p-5 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-2xl">🟢</span>
              <span className="text-xs font-bold text-emerald-300">
                휴식 모드가 지정되었습니다
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[300px]">
                훈련을 진행하지 않고 팀 시설(웰니스 센터)에서 체력을 집중적으로
                회복합니다. (챔피언 연습 미배정)
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-mono font-bold">
                    2
                  </span>
                  연습 챔피언 선택 (80종)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  총 {filteredChampions.length}종
                </span>
              </div>

              {/* 검색창 & 포지션 필터 */}
              <div className="flex flex-col gap-2">
                {/* 실시간 한글 검색창 */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="챔피언 한글/영문 이름 검색..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* 포지션 필터 탭 */}
                <div className="grid grid-cols-6 gap-1">
                  {POS_TABS.map((tab) => {
                    const isActive = posFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPosFilter(tab.id)}
                        className={`py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center ${
                          isActive
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm"
                            : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 80종 챔피언 카드 그리드 */}
              <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                {filteredChampions.map((champ) => {
                  const isSelected = selectedChampionId === champ.id;
                  const isT1 = isTier1Champion(champ.id);
                  const mastery = masteryMap[champ.id] ?? 0;

                  return (
                    <div
                      key={champ.id}
                      onClick={() => setSelectedChampionId(champ.id)}
                      className={`rounded-xl border p-1.5 flex flex-col gap-1 transition-all cursor-pointer active:scale-95 relative overflow-hidden ${
                        isSelected
                          ? "bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {/* 1:1 정사각형 초상화 */}
                      <div className="w-full aspect-square rounded-lg overflow-hidden relative bg-slate-950 border border-slate-800/80">
                        <img
                          src={champ.images.portrait}
                          alt={champ.nameKr}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* 1티어 뱃지 */}
                        {isT1 && (
                          <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[8px] flex items-center gap-0.5 shadow-md">
                            ★ 1티어
                          </div>
                        )}

                        {/* 선택 완료 체크마크 오버레이 */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-cyan-500/30 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 챔피언 한글명 */}
                      <span className="text-[11px] font-bold text-white truncate text-center leading-tight">
                        {champ.nameKr}
                      </span>

                      {/* 현재 선수의 숙련도 게이지 및 점수 */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                          <span className="text-slate-400">숙련도</span>
                          <span className="text-cyan-300 font-bold">
                            {mastery}점
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(5, mastery))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= 하단 액션 버튼 ================= */}
        <div className="shrink-0 p-4 border-t border-slate-800/80 bg-slate-900/90 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 touch-manipulation"
          >
            <span>취소</span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer active:scale-95 touch-manipulation"
          >
            <Check className="w-4 h-4 text-cyan-200 stroke-[2.5]" />
            <span>배정 확정</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
