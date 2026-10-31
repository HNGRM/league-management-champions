"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  CheckCheck,
  Filter,
  Calendar,
  AlertCircle,
  Inbox,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { MailItem } from "@/data/dummyMails";
import MailDetailBottomSheet from "./MailDetailBottomSheet";

type CategoryFilter = "전체" | "필수" | "팀" | "경기" | "뉴스";

interface MailboxViewProps {
  currentYear?: number;
}

export default function MailboxView({ currentYear = 2026 }: MailboxViewProps) {
  const mails = useGameStore((state) => state.mails);
  const markMailAsRead = useGameStore((state) => state.markMailAsRead);
  const markAllMailsAsRead = useGameStore((state) => state.markAllMailsAsRead);
  const updateMailAction = useGameStore((state) => state.updateMailAction);

  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("전체");
  const [onlyCurrentSeason, setOnlyCurrentSeason] = useState<boolean>(false);

  // 바텀 시트 상세 열람용 메일
  const [mounted, setMounted] = useState(false);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
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

  // 전체 안 읽은 메일 수
  const totalUnreadCount = useMemo(
    () => mails.filter((m) => !m.isRead).length,
    [mails]
  );

  // 카테고리별 안 읽은 메일 수 계산
  const categoryUnreadMap = useMemo(() => {
    const map: Record<CategoryFilter, number> = {
      전체: totalUnreadCount,
      필수: 0,
      팀: 0,
      경기: 0,
      뉴스: 0,
    };
    mails.forEach((m) => {
      if (!m.isRead && map[m.category] !== undefined) {
        map[m.category] += 1;
      }
    });
    return map;
  }, [mails, totalUnreadCount]);

  // 필터링된 메일 목록
  const filteredMails = useMemo(() => {
    return mails.filter((m) => {
      // 1. 카테고리 필터
      if (selectedCategory !== "전체" && m.category !== selectedCategory) {
        return false;
      }
      // 2. 이번 시즌 필터
      if (onlyCurrentSeason && m.seasonYear !== currentYear) {
        return false;
      }
      return true;
    });
  }, [mails, selectedCategory, onlyCurrentSeason, currentYear]);

  // 메일 카드 클릭 핸들러 (바텀 시트 오픈 + 읽음 처리)
  const handleOpenMail = (mail: MailItem) => {
    setSelectedMail(mail);
    setIsSheetOpen(true);
    if (!mail.isRead) {
      markMailAsRead(mail.id);
    }
  };

  // 모두 읽음 처리
  const handleMarkAllRead = () => {
    if (totalUnreadCount === 0) {
      showToast("모든 메일을 이미 확인했습니다.");
      return;
    }
    markAllMailsAsRead();
    showToast("모든 메일을 읽음 처리했습니다.");
  };

  // 액션 버튼 응답 핸들러
  const handleMailAction = (
    mailId: string,
    actionState: "ACCEPTED" | "REJECTED" | "COMPLETED"
  ) => {
    updateMailAction(mailId, actionState);
    if (selectedMail && selectedMail.id === mailId) {
      setSelectedMail({
        ...selectedMail,
        isRead: true,
        actionState,
      });
    }
    if (actionState === "ACCEPTED") {
      showToast("안건을 수락 승인했습니다.");
    } else if (actionState === "REJECTED") {
      showToast("안건을 거절 처리했습니다.");
    } else {
      showToast("확인 완료 처리되었습니다.");
    }
  };

  const CATEGORY_TABS: { id: CategoryFilter; label: string; icon?: string }[] = [
    { id: "전체", label: "전체" },
    { id: "필수", label: "필수", icon: "🔴" },
    { id: "팀", label: "팀", icon: "🛡️" },
    { id: "경기", label: "경기", icon: "📊" },
    { id: "뉴스", label: "뉴스", icon: "📰" },
  ];

  return (
    <div className="flex flex-col gap-2.5 pb-6 select-none relative">
      {/* ================= 1. 상단 컨트롤 바 ================= */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm">
        {/* 1행: 메일함 타이틀, 안 읽은 카운트, 모두 읽음 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">메일함</span>
              {totalUnreadCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
                  {totalUnreadCount}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">
                  (모두 확인)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-white active:scale-95 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer touch-manipulation"
          >
            <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>모두 읽음</span>
          </button>
        </div>

        {/* 2행: 이번 시즌 메일만 보기 체크박스 필터 */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={onlyCurrentSeason}
              onChange={(e) => setOnlyCurrentSeason(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
            />
            <span className="text-[11px] font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>이번 시즌 메일만 보기 ({currentYear}년)</span>
            </span>
          </label>

          <span className="text-[10px] text-slate-500 font-mono">
            총 {filteredMails.length}건
          </span>
        </div>
      </div>

      {/* ================= 2. 4대 카테고리 탭 (2글자 버튼 필터) ================= */}
      <div className="grid grid-cols-5 gap-1.5">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          const unreadCount = categoryUnreadMap[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer touch-manipulation relative ${
                isActive
                  ? "bg-cyan-500/20 border-cyan-400/80 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold scale-[1.02]"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1">
                {tab.icon && <span className="text-xs">{tab.icon}</span>}
                <span className="text-[11px] tracking-tight">{tab.label}</span>
              </div>

              {/* 안 읽은 메일 표시 점 또는 숫자 */}
              {unreadCount > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    tab.id === "필수" ? "bg-rose-400 animate-pulse" : "bg-cyan-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ================= 3. 메일 리스트 카드 ================= */}
      <div className="flex flex-col gap-2">
        {filteredMails.length === 0 ? (
          <div className="h-44 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center gap-2 text-center p-6">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-300">
              도착한 메일이 없습니다.
            </span>
            <span className="text-[10px] text-slate-500">
              필터 조건을 변경하거나 다음 일정을 진행해 보세요.
            </span>
          </div>
        ) : (
          filteredMails.map((mail) => {
            const isUnread = !mail.isRead;
            const isEssential = mail.category === "필수";
            const isActionPending = mail.hasAction && mail.actionState === "PENDING";

            return (
              <div
                key={mail.id}
                onClick={() => handleOpenMail(mail)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] flex flex-col gap-1.5 relative overflow-hidden ${
                  isUnread
                    ? "bg-slate-900/95 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-75 hover:opacity-100"
                }`}
              >
                {/* 안 읽은 메일 시안 좌측 바 인디케이터 */}
                {isUnread && (
                  <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500" />
                )}

                {/* 1행: 카테고리 뱃지, 발신자, 수신 일자 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* 카테고리 태그 */}
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                        mail.category === "필수"
                          ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
                          : mail.category === "팀"
                          ? "bg-indigo-950/80 text-indigo-300 border-indigo-500/50"
                          : mail.category === "경기"
                          ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/50"
                          : "bg-purple-950/80 text-purple-300 border-purple-500/50"
                      }`}
                    >
                      {mail.category}
                    </span>

                    {/* 발신자 정보 */}
                    <span className="text-xs font-semibold text-slate-300 truncate">
                      {mail.sender}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate hidden sm:inline">
                      ({mail.senderRole})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isActionPending && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        미처리
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mail.dateStr}
                    </span>
                  </div>
                </div>

                {/* 2행: 메일 제목 */}
                <div className="flex items-center justify-between gap-1">
                  <h3
                    className={`text-xs sm:text-sm tracking-tight truncate leading-tight ${
                      isUnread ? "font-bold text-white" : "font-medium text-slate-300"
                    }`}
                  >
                    {mail.title}
                  </h3>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>

                {/* 3행: 메일 본문 한 줄 미리보기 */}
                <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                  {mail.content.replace(/\n/g, " ")}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ================= 4. 바텀 시트 메일 상세 열람 ================= */}
      <MailDetailBottomSheet
        mail={selectedMail}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onAction={handleMailAction}
      />

      {/* 안내 토스트 팝업 (Portal로 중앙 정렬) */}
      {mounted &&
        toastMessage &&
        createPortal(
          <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center pointer-events-none px-4">
            <div className="max-w-[390px] px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/60 text-cyan-100 text-xs font-bold shadow-[0_8px_30px_rgba(0,0,0,0.85)] flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
