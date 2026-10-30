"use client";

import React, { useState } from "react";
import { AlertTriangle, X, Loader2, Trash2 } from "lucide-react";

interface DisbandConfirmModalProps {
  isOpen: boolean;
  teamName: string;
  managerNameEn: string;
  slotNumber?: number;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function DisbandConfirmModal({
  isOpen,
  teamName,
  managerNameEn,
  slotNumber,
  onConfirm,
  onClose,
}: DisbandConfirmModalProps) {
  const [inputName, setInputName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetName = (managerNameEn || "DIRECTOR").trim();
  const isMatch = inputName.trim().toLowerCase() === targetName.toLowerCase();

  const handleExecute = async () => {
    if (!isMatch || isDeleting) return;
    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "해체 처리 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in-0 duration-150">
      <div className="relative w-full max-w-[380px] rounded-3xl bg-slate-950 border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)] p-5 flex flex-col gap-4 text-left select-none animate-in zoom-in-95 duration-150">
        {/* 상단 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 헤더: 경고 아이콘 & 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-black text-white tracking-tight">
              팀 해체 확인
            </h3>
            <span className="text-[11px] font-mono text-rose-400 font-bold">
              {slotNumber ? `슬롯 ${slotNumber}번` : "현재 팀"} 세이브 영구 삭제
            </span>
          </div>
        </div>

        {/* 경고 알림 박스 */}
        <div className="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-3 flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">대상 팀:</span>
            <span className="font-bold text-white truncate max-w-[200px]">{teamName}</span>
          </div>
          <p className="text-[11px] text-rose-300/90 leading-relaxed pt-1 border-t border-rose-900/40">
            팀을 해체하면 현재까지 진행된 모든 경기 기록, 선수단 로스터, 재정 데이터가 완전히 삭제되며 되돌릴 수 없습니다.
          </p>
        </div>

        {/* 2단계 확인 안내 및 인풋 */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            정말로 팀을 해체하시겠습니까?
            <br />
            확인을 위해 감독 영문 이름{" "}
            <span className="font-mono font-black text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40 select-all">
              [{targetName}]
            </span>
            을 입력해주세요.
          </p>

          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            disabled={isDeleting}
            placeholder={`감독 영문 이름 입력 (${targetName})`}
            className="w-full bg-slate-900/90 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none font-mono transition-colors shadow-inner"
            autoFocus
          />

          {inputName.length > 0 && !isMatch && (
            <span className="text-[11px] text-rose-400 font-medium">
              영문 이름이 일치하지 않습니다.
            </span>
          )}
          {errorMessage && (
            <span className="text-[11px] text-rose-400 font-medium">
              {errorMessage}
            </span>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleExecute}
            disabled={!isMatch || isDeleting}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md ${
              isMatch && !isDeleting
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer active:scale-98"
                : "bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed"
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                해체 처리 중...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                팀 영구 해체
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
