"use client";

import React from "react";
import {
  X,
  Calendar,
  User,
  Shield,
  Check,
  AlertCircle,
  FileText,
  Building2,
  Handshake,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { MailItem } from "@/data/dummyMails";

interface MailDetailBottomSheetProps {
  mail: MailItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (mailId: string, actionState: "ACCEPTED" | "REJECTED" | "COMPLETED") => void;
}

export default function MailDetailBottomSheet({
  mail,
  isOpen,
  onClose,
  onAction,
}: MailDetailBottomSheetProps) {
  if (!isOpen || !mail) return null;

  const getCategoryBadge = (category: MailItem["category"]) => {
    switch (category) {
      case "필수":
        return {
          icon: "🔴",
          badgeClass: "bg-rose-950/90 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]",
          label: "필수 안건",
        };
      case "팀":
        return {
          icon: "🛡️",
          badgeClass: "bg-indigo-950/90 text-indigo-300 border-indigo-500/50",
          label: "팀 보고",
        };
      case "경기":
        return {
          icon: "📊",
          badgeClass: "bg-cyan-950/90 text-cyan-300 border-cyan-500/50",
          label: "경기 분석",
        };
      case "뉴스":
        return {
          icon: "📰",
          badgeClass: "bg-purple-950/90 text-purple-300 border-purple-500/50",
          label: "리그 소식",
        };
    }
  };

  const badgeInfo = getCategoryBadge(mail.category);

  return (
    <>
      {/* 딤드 배경 오버레이 */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 animate-in fade-in duration-200"
      />

      {/* 바텀 시트 본체 (화면 하단 85% 높이) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[85vh] max-h-[85%] bg-slate-950 border-t-2 border-x border-slate-800 rounded-t-3xl z-50 flex flex-col shadow-[0_-12px_45px_rgba(0,0,0,0.85)] animate-in slide-in-from-bottom duration-300 overflow-hidden select-none">
        {/* 상단 드래그 핸들바 & 헤더 영역 */}
        <div className="shrink-0 pt-3 px-5 pb-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-col gap-2">
          {/* 중앙 슬라이드 핸들바 */}
          <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto" />

          <div className="flex items-center justify-between mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeInfo.badgeClass}`}
            >
              <span>{badgeInfo.icon}</span>
              <span>{badgeInfo.label}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar flex flex-col gap-4">
          {/* 메일 헤더 메타데이터 */}
          <div className="flex flex-col gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
              {mail.title}
            </h2>

            <div className="rounded-xl bg-slate-900/80 border border-slate-800/80 p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-bold text-slate-200 truncate">{mail.sender}</span>
                  <span className="text-[11px] text-slate-400 truncate">({mail.senderRole})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                  {mail.dateStr}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{mail.seasonYear} 시즌 수신함</span>
                <span className="text-slate-700">·</span>
                <span className="text-indigo-400 font-semibold">대외 공문</span>
              </div>
            </div>
          </div>

          {/* 메일 본문 내용 */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4 min-h-[140px]">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {mail.content}
            </p>
          </div>

          {/* 필수 액션 상태 배너 (이미 처리된 경우) */}
          {mail.actionState && mail.actionState !== "PENDING" && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                mail.actionState === "ACCEPTED" || mail.actionState === "COMPLETED"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/60 border-rose-500/40 text-rose-300"
              }`}
            >
              {mail.actionState === "ACCEPTED" || mail.actionState === "COMPLETED" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>
                {mail.actionState === "ACCEPTED"
                  ? "이 안건에 대해 [수락 / 승인] 완료되었습니다."
                  : mail.actionState === "REJECTED"
                  ? "이 안건에 대해 [거절 / 보류] 처리되었습니다."
                  : "로스터 등록 점검이 완료되었습니다."}
              </span>
            </div>
          )}
        </div>

        {/* 하단 액션 버튼 영역 */}
        <div className="shrink-0 p-4 border-t border-slate-800/80 bg-slate-900/90">
          {mail.hasAction && mail.actionState === "PENDING" ? (
            <div className="flex items-center gap-2">
              {mail.actionType === "ACCEPT_REJECT" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onAction?.(mail.id, "REJECTED");
                    }}
                    className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 touch-manipulation"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>거절하기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAction?.(mail.id, "ACCEPTED");
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer active:scale-95 touch-manipulation"
                  >
                    <Handshake className="w-4 h-4 text-cyan-200" />
                    <span>수락하기 (2.5억 원)</span>
                  </button>
                </>
              )}

              {mail.actionType === "CONTRACT_SIGN" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onAction?.(mail.id, "REJECTED");
                    }}
                    className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 touch-manipulation"
                  >
                    <span>보류하기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAction?.(mail.id, "ACCEPTED");
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer active:scale-95 touch-manipulation"
                  >
                    <Check className="w-4 h-4 text-emerald-100" />
                    <span>계약 체결 (1.2억 원)</span>
                  </button>
                </>
              )}

              {mail.actionType === "CONFIRM" && (
                <button
                  type="button"
                  onClick={() => {
                    onAction?.(mail.id, "COMPLETED");
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer active:scale-95 touch-manipulation"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                  <span>로스터 등록 확인 완료</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 touch-manipulation"
            >
              <span>확인 / 닫기</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
