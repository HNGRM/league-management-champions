"use client";

import React, { useState } from "react";
import {
  Dices,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Smile,
  Eye,
  Scissors,
  Glasses,
  Palette,
  Shirt,
  Check,
} from "lucide-react";
import {
  AvatarDna,
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  FACE_SHAPES,
  HAIR_STYLES,
  EYE_STYLES,
  EYEBROW_STYLES,
  NOSE_STYLES,
  MOUTH_STYLES,
  LIP_COLORS,
  BODY_TYPES,
  EYE_ACCESSORIES,
  MOUTH_ACCESSORIES,
  EAR_ACCESSORIES,
  WRINKLE_OPTIONS,
  OUTFIT_TYPES,
  createRandomAvatarDna,
  createDefaultAvatarDna,
} from "@/types/avatar";
import AvatarRenderer from "./AvatarRenderer";

interface AvatarCustomizerProps {
  value: AvatarDna;
  onChange: (dna: AvatarDna) => void;
  teamId?: string | null;
  league?: string | null;
  teamName?: string | null;
}

type TabType = "OUTFIT" | "HAIR" | "SKIN" | "EYES" | "FACE" | "ACCESSORY";

export default function AvatarCustomizer({
  value,
  onChange,
  teamId,
  league,
  teamName,
}: AvatarCustomizerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("OUTFIT");

  // Helper to update a single DNA property
  const updateProp = (prop: keyof AvatarDna, val: number) => {
    onChange({
      ...value,
      [prop]: val,
    });
  };

  // Helper to cycle through options (left / right)
  const cycleOption = (prop: keyof AvatarDna, maxCount: number, delta: number) => {
    const current = value[prop] ?? 0;
    const next = (current + delta + maxCount) % maxCount;
    updateProp(prop, next);
  };

  const handleRandomize = () => {
    onChange({
      ...createRandomAvatarDna(),
      outfitIndex: value.outfitIndex ?? 0,
    });
  };

  const handleReset = () => {
    onChange({
      ...createDefaultAvatarDna(),
      outfitIndex: value.outfitIndex ?? 0,
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto select-none">
      {/* 1. 상단: 좌측 아바타 프리뷰 & 우측 컴팩트 액션 영역 (황금비 배분) */}
      <div className="flex items-center justify-between gap-3 shrink-0 px-1 pt-0.5 pb-2">
        {/* 좌측: 반응형 아바타 렌더러 (w-28 h-28 sm:w-36 sm:h-36) */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl p-1 bg-gradient-to-b from-cyan-500/30 via-slate-800/60 to-slate-950 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center relative overflow-hidden">
          <AvatarRenderer
            dna={value}
            teamId={teamId}
            league={league}
            className="w-full h-full rounded-xl"
          />
          {/* 하단 유니폼 팀명 태그 */}
          {teamName && (
            <div className="absolute bottom-1 inset-x-1.5 bg-slate-950/85 backdrop-blur-md rounded-md py-0.5 text-center border border-cyan-500/30">
              <span className="text-[9px] font-bold text-cyan-300 truncate px-1 block">
                {teamName} 유니폼
              </span>
            </div>
          )}
        </div>

        {/* 우측: 설명 박스 & 가로 2열 버튼 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-28 sm:h-36 py-0.5">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-2 text-left">
            <span className="text-[10px] font-bold text-cyan-400 block mb-0.5">
              감독 외형 커스터마이징
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
              부위별 스타일을 좌우 화살표로 조절하거나 무작위로 생성해 보세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={handleRandomize}
              className="py-2.5 sm:py-3 px-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
              title="랜덤 생성"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>랜덤</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 sm:py-3 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
              title="다시하기"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>다시하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 중앙: 부위별 카테고리 탭 (6개 탭: 의상 / 헤어 / 피부체형 / 눈매 / 코입 / 액세서리) */}
      <div className="shrink-0 grid grid-cols-6 gap-1 px-1 py-1 bg-slate-950/80 rounded-2xl border border-slate-800">
        {[
          { tab: "OUTFIT" as TabType, label: "의상", icon: Shirt },
          { tab: "HAIR" as TabType, label: "헤어", icon: Scissors },
          { tab: "SKIN" as TabType, label: "피부/체형", icon: Palette },
          { tab: "EYES" as TabType, label: "눈매", icon: Eye },
          { tab: "FACE" as TabType, label: "코/입", icon: Smile },
          { tab: "ACCESSORY" as TabType, label: "액세서리", icon: Glasses },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className={`py-1.5 sm:py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] sm:text-[10px] font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. 하단: 활성 탭별 상세 컨트롤러 (스크롤 패널) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-3 mt-1 space-y-3.5">
        {/* ================= TAB: OUTFIT (의상: 수트 / 자켓 / 저지) ================= */}
        {activeTab === "OUTFIT" && (
          <div className="space-y-3.5">
            {/* 의상 스타일 좌우 스텝퍼 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">의상 스타일</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {(value.outfitIndex ?? 0) + 1} / {OUTFIT_TYPES.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("outfitIndex", OUTFIT_TYPES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {OUTFIT_TYPES[value.outfitIndex ?? 0]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("outfitIndex", OUTFIT_TYPES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 의상 3종 빠른 비교 선택 카드 */}
            <div className="space-y-2">
              {OUTFIT_TYPES.map((item, idx) => {
                const isSelected = (value.outfitIndex ?? 0) === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateProp("outfitIndex", idx)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.18)]"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            idx === 0
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : idx === 1
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                        >
                          {item.roleLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB: HAIR ================= */}
        {activeTab === "HAIR" && (
          <div className="space-y-3.5">
            {/* 헤어스타일 스텝퍼 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">헤어스타일</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {value.hairStyleIndex + 1} / {HAIR_STYLES.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("hairStyleIndex", HAIR_STYLES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {HAIR_STYLES[value.hairStyleIndex]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("hairStyleIndex", HAIR_STYLES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 헤어 컬러 팔레트 (12색) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-cyan-300">헤어 컬러</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {HAIR_COLORS[value.hairColorIndex]?.name}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {HAIR_COLORS.map((col, idx) => {
                  const isSelected = value.hairColorIndex === idx;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => updateProp("hairColorIndex", idx)}
                      className={`relative aspect-square rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "ring-2 ring-cyan-400 scale-105 shadow-md"
                          : "hover:scale-105 opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SKIN (피부 & 체형 & 얼굴형) ================= */}
        {activeTab === "SKIN" && (
          <div className="space-y-3.5">
            {/* 1. 피부톤 팔레트 (8색 정사각형 1줄) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-cyan-300">피부 톤</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {SKIN_TONES[value.skinToneIndex]?.name}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {SKIN_TONES.map((tone, idx) => {
                  const isSelected = value.skinToneIndex === idx;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => updateProp("skinToneIndex", idx)}
                      className={`relative aspect-square rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center border border-black/20 ${
                        isSelected
                          ? "ring-2 ring-cyan-400 scale-105 shadow-md"
                          : "hover:scale-105 opacity-85 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: tone.base }}
                      title={tone.name}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-slate-900 stroke-[3] drop-shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 체형 실루엣 스텝퍼 (좌/우 이동) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">체형 실루엣</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {(value.bodyTypeIndex ?? 1) + 1} / {BODY_TYPES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("bodyTypeIndex", BODY_TYPES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {BODY_TYPES[value.bodyTypeIndex ?? 1]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("bodyTypeIndex", BODY_TYPES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. 얼굴형 스텝퍼 (좌/우 이동) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">얼굴형</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {value.faceShapeIndex + 1} / {FACE_SHAPES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("faceShapeIndex", FACE_SHAPES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {FACE_SHAPES[value.faceShapeIndex]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("faceShapeIndex", FACE_SHAPES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: EYES ================= */}
        {activeTab === "EYES" && (
          <div className="space-y-3.5">
            {/* 눈매 스타일 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">눈매 스타일</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {value.eyeStyleIndex + 1} / {EYE_STYLES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("eyeStyleIndex", EYE_STYLES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {EYE_STYLES[value.eyeStyleIndex]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("eyeStyleIndex", EYE_STYLES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 눈동자 컬러 (8색) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-cyan-300">눈동자 컬러</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {EYE_COLORS[value.eyeColorIndex]?.name}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {EYE_COLORS.map((col, idx) => {
                  const isSelected = value.eyeColorIndex === idx;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => updateProp("eyeColorIndex", idx)}
                      className={`relative aspect-square rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center border border-black/20 ${
                        isSelected
                          ? "ring-2 ring-cyan-400 scale-105 shadow-md"
                          : "hover:scale-105 opacity-85 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 눈썹 스타일 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">눈썹 스타일</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {value.eyebrowIndex + 1} / {EYEBROW_STYLES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("eyebrowIndex", EYEBROW_STYLES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {EYEBROW_STYLES[value.eyebrowIndex]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("eyebrowIndex", EYEBROW_STYLES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: FACE (NOSE, MOUTH & LIPS) ================= */}
        {activeTab === "FACE" && (
          <div className="space-y-3.5">
            {/* 코 스타일 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">코 스타일</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {value.noseStyleIndex + 1} / {NOSE_STYLES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("noseStyleIndex", NOSE_STYLES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {NOSE_STYLES[value.noseStyleIndex]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("noseStyleIndex", NOSE_STYLES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 입 & 표정 스타일 */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">입 & 표정</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {value.mouthStyleIndex + 1} / {MOUTH_STYLES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("mouthStyleIndex", MOUTH_STYLES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {MOUTH_STYLES[value.mouthStyleIndex]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("mouthStyleIndex", MOUTH_STYLES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 입술 컬러 팔레트 (8색 정사각형 1줄) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-cyan-300">입술 색상</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {LIP_COLORS[value.lipColorIndex ?? 0]?.name}
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {LIP_COLORS.map((lip, idx) => {
                  const isSelected = (value.lipColorIndex ?? 0) === idx;
                  return (
                    <button
                      key={lip.id}
                      type="button"
                      onClick={() => updateProp("lipColorIndex", idx)}
                      className={`relative aspect-square rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center border border-black/20 ${
                        isSelected
                          ? "ring-2 ring-cyan-400 scale-105 shadow-md"
                          : "hover:scale-105 opacity-85 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: lip.hex }}
                      title={lip.name}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: ACCESSORY (눈 / 입 / 귀 액세서리 & 주름 스텝퍼) ================= */}
        {activeTab === "ACCESSORY" && (
          <div className="space-y-3.5">
            {/* 1. 눈 액세서리 (없음, 안경3종, 선글라스, 뺨 반창고) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">눈 액세서리</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {(value.eyeAccessoryIndex ?? 0) + 1} / {EYE_ACCESSORIES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("eyeAccessoryIndex", EYE_ACCESSORIES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {EYE_ACCESSORIES[value.eyeAccessoryIndex ?? 0]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("eyeAccessoryIndex", EYE_ACCESSORIES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. 입 액세서리 (없음, 깔끔한 콧수염, 소울패치, 친고티, 트리밍 쇼트, 와이드러프) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">입 액세서리</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {(value.mouthAccessoryIndex ?? 0) + 1} / {MOUTH_ACCESSORIES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("mouthAccessoryIndex", MOUTH_ACCESSORIES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {MOUTH_ACCESSORIES[value.mouthAccessoryIndex ?? 0]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("mouthAccessoryIndex", MOUTH_ACCESSORIES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. 귀 액세서리 (없음, 헤드셋, 이어셋, 링 피어싱) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">귀 액세서리</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {(value.earAccessoryIndex ?? 0) + 1} / {EAR_ACCESSORIES.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("earAccessoryIndex", EAR_ACCESSORIES.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {EAR_ACCESSORIES[value.earAccessoryIndex ?? 0]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("earAccessoryIndex", EAR_ACCESSORIES.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4. 주름 (없음, 이마주름, 팔자주름, 종합주름) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300">주름</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {(value.wrinkleIndex ?? 0) + 1} / {WRINKLE_OPTIONS.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => cycleOption("wrinkleIndex", WRINKLE_OPTIONS.length, -1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center py-2 px-2 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-white block truncate">
                    {WRINKLE_OPTIONS[value.wrinkleIndex ?? 0]?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => cycleOption("wrinkleIndex", WRINKLE_OPTIONS.length, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
