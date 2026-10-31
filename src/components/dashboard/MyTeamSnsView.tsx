"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  RotateCw,
  Heart,
  Repeat2,
  MessageCircle,
  BadgeCheck,
  Newspaper,
  Mic,
  Flame,
  Shield,
  Sparkles,
  Share2,
} from "lucide-react";
import { SnsPost, INITIAL_SNS_POSTS } from "@/data/dummySnsPosts";

interface MyTeamSnsViewProps {
  teamName?: string;
  teamLogoUrl?: string | null;
}

type SnsFilter = "ALL" | "FAN" | "HATER" | "MEDIA";

export default function MyTeamSnsView({
  teamName = "우리 팀",
  teamLogoUrl,
}: MyTeamSnsViewProps) {
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<SnsPost[]>(INITIAL_SNS_POSTS);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [retweetedMap, setRetweetedMap] = useState<Record<string, boolean>>({});
  const [selectedFilter, setSelectedFilter] = useState<SnsFilter>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      // 순서를 살짝 섞거나 초기화
      setPosts((prev) => [...prev].reverse());
      setIsRefreshing(false);
      showToast("새로운 실시간 피드를 불러왔습니다.");
    }, 450);
  };

  // 좋아요 토글
  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap((prev) => {
      const current = !!prev[id];
      const next = !current;
      setPosts((postList) =>
        postList.map((p) =>
          p.id === id ? { ...p, likes: p.likes + (next ? 1 : -1) } : p
        )
      );
      return { ...prev, [id]: next };
    });
  };

  // 리트윗 토글
  const handleToggleRetweet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRetweetedMap((prev) => {
      const current = !!prev[id];
      const next = !current;
      setPosts((postList) =>
        postList.map((p) =>
          p.id === id ? { ...p, retweets: p.retweets + (next ? 1 : -1) } : p
        )
      );
      return { ...prev, [id]: next };
    });
  };

  // 필터링
  const filteredPosts = posts.filter((p) => {
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "FAN") return p.authorType === "FAN";
    if (selectedFilter === "HATER") return p.authorType === "HATER";
    if (selectedFilter === "MEDIA")
      return p.authorType === "REPORTER" || p.authorType === "ANALYST";
    return true;
  });

  // 페르소나별 아바타 및 배지 렌더링
  const renderPersonaAvatar = (post: SnsPost) => {
    switch (post.authorType) {
      case "FAN":
        return (
          <div className="w-9 h-9 rounded-full bg-cyan-950/90 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.25)] relative overflow-hidden">
            {teamLogoUrl ? (
              <img
                src={teamLogoUrl}
                alt={teamName}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <Shield className="w-4 h-4 text-cyan-400" />
            )}
          </div>
        );
      case "HATER":
        return (
          <div className="w-9 h-9 rounded-full bg-rose-950/90 border border-rose-500/50 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.25)]">
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
        );
      case "REPORTER":
        return (
          <div className="w-9 h-9 rounded-full bg-blue-950/90 border border-blue-400/50 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.25)]">
            <Newspaper className="w-4 h-4 text-blue-400" />
          </div>
        );
      case "ANALYST":
        return (
          <div className="w-9 h-9 rounded-full bg-purple-950/90 border border-purple-400/50 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.25)]">
            <Mic className="w-4 h-4 text-purple-400" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-2.5 pb-6 select-none animate-in fade-in duration-200 relative">
      {/* ================= 1. 상단 컨트롤 헤더 바 ================= */}
      <div className="bg-slate-950/85 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm">
        {/* 타이틀 및 새로고침 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">
                실시간 e스포츠 피드 (SNS)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer active:scale-95 touch-manipulation disabled:opacity-50"
            title="새로고침"
            aria-label="새로고침"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`}
            />
          </button>
        </div>

        {/* 페르소나 필터 칩 */}
        <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800/80">
          {(
            [
              { id: "ALL", label: "전체" },
              { id: "FAN", label: "💙 열혈 팬" },
              { id: "HATER", label: "🔥 쓴소리" },
              { id: "MEDIA", label: "🎙️ 미디어" },
            ] as const
          ).map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`py-1 px-1.5 rounded-xl text-[11px] font-bold tracking-tight transition-all cursor-pointer touch-manipulation border text-center ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/70 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                    : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 2. 트위터(X) 스타일 피드 리스트 ================= */}
      <div className="flex flex-col gap-2">
        {filteredPosts.map((post) => {
          const isLiked = !!likedMap[post.id];
          const isRetweeted = !!retweetedMap[post.id];

          return (
            <div
              key={post.id}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-slate-950/90 border border-slate-800/80 hover:border-slate-700/90 transition-all flex items-start gap-3 shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            >
              {/* 좌측: 페르소나 프로필 아바타 */}
              {renderPersonaAvatar(post)}

              {/* 우측: 포스트 내용 */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                {/* 1열: 작성자 정보 및 작성 시간 */}
                <div className="flex items-center justify-between gap-1 leading-tight">
                  <div className="flex items-center gap-1 min-w-0 flex-wrap">
                    <span className="text-xs font-bold text-white tracking-tight truncate max-w-[150px]">
                      {post.authorName}
                    </span>

                    {/* 인증 뱃지 (기자: 파란색, 분석가: 보라색) */}
                    {post.isVerified && (
                      <BadgeCheck
                        className={`w-3.5 h-3.5 shrink-0 ${
                          post.authorType === "REPORTER"
                            ? "text-blue-400 fill-blue-500/20"
                            : "text-purple-400 fill-purple-500/20"
                        }`}
                      />
                    )}

                    <span className="text-[11px] text-slate-400 font-mono truncate max-w-[120px]">
                      {post.authorHandle}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                    {post.timeAgo}
                  </span>
                </div>

                {/* 2열: 본문 텍스트 (반드시 1~2줄 엄격 제한: line-clamp-2) */}
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-snug break-keep font-sans selection:bg-cyan-500/30">
                  {post.content}
                </p>

                {/* 3열: 하단 반응 인디케이터 (좋아요, 리트윗, 댓글) */}
                <div className="flex items-center gap-5 pt-1 mt-0.5 text-slate-400 text-[11px] font-mono">
                  {/* 댓글 */}
                  <div className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer group">
                    <MessageCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>{Math.floor(post.likes / 15)}</span>
                  </div>

                  {/* 리트윗 */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleRetweet(post.id, e)}
                    className={`flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      isRetweeted
                        ? "text-emerald-400 font-bold"
                        : "hover:text-emerald-400"
                    }`}
                  >
                    <Repeat2
                      className={`w-3.5 h-3.5 ${
                        isRetweeted ? "scale-110" : ""
                      }`}
                    />
                    <span>{post.retweets.toLocaleString()}</span>
                  </button>

                  {/* 좋아요 */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleLike(post.id, e)}
                    className={`flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      isLiked
                        ? "text-rose-400 font-bold"
                        : "hover:text-rose-400"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked ? "fill-rose-500 scale-110 text-rose-500" : ""
                      }`}
                    />
                    <span>{post.likes.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 토스트 알림 (Portal로 중앙 정렬) */}
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
