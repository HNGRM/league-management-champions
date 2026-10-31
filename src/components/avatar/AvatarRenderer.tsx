"use client";

import React from "react";
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
} from "@/types/avatar";
import { getTeamColors } from "@/data/teamColors";

interface AvatarRendererProps {
  dna: AvatarDna;
  teamId?: string | null;
  league?: string | null;
  size?: number | string;
  className?: string;
  showBackground?: boolean;
}

export default function AvatarRenderer({
  dna,
  teamId,
  league,
  size = "100%",
  className = "",
  showBackground = true,
}: AvatarRendererProps) {
  // Safe palette retrieval with fallbacks
  const skin = SKIN_TONES[dna.skinToneIndex] || SKIN_TONES[0];
  const hairColor = HAIR_COLORS[dna.hairColorIndex] || HAIR_COLORS[0];
  const eyeColor = EYE_COLORS[dna.eyeColorIndex] || EYE_COLORS[0];
  const lipColor = LIP_COLORS[dna.lipColorIndex ?? 0] || LIP_COLORS[0];
  const teamColors = getTeamColors(teamId, league);

  const hairStyle = dna.hairStyleIndex % HAIR_STYLES.length;
  const eyeStyle = dna.eyeStyleIndex % EYE_STYLES.length;
  const eyebrowStyle = dna.eyebrowIndex % EYEBROW_STYLES.length;
  const noseStyle = dna.noseStyleIndex % NOSE_STYLES.length;
  const mouthStyle = dna.mouthStyleIndex % MOUTH_STYLES.length;
  const faceShape = dna.faceShapeIndex % FACE_SHAPES.length;
  const bodyIndex = dna.bodyTypeIndex ?? 1;
  const eyeAccessory = (dna.eyeAccessoryIndex ?? 0) % EYE_ACCESSORIES.length;
  const mouthAccessory = (dna.mouthAccessoryIndex ?? 0) % MOUTH_ACCESSORIES.length;
  const earAccessory = (dna.earAccessoryIndex ?? 0) % EAR_ACCESSORIES.length;
  const wrinkle = (dna.wrinkleIndex ?? 0) % WRINKLE_OPTIONS.length;
  const outfit = (dna.outfitIndex ?? 0) % OUTFIT_TYPES.length;

  // 1. 후면 머리카락 (Back Hair)
  const renderBackHair = () => {
    switch (hairStyle) {
      case 6: // 울프 컷 (Wolf Cut)
        return (
          <path
            d="M 60 90 C 50 120 40 145 60 165 C 75 155 80 140 85 130 L 115 130 C 120 140 125 155 140 165 C 160 145 150 120 140 90 Z"
            fill={hairColor.hex}
          />
        );
      case 7: // 태슬 밥 단발 (Tassel Bob)
        return (
          <path
            d="M 52 85 C 48 115 50 140 64 156 L 136 156 C 150 140 152 115 148 85 Z"
            fill={hairColor.hex}
          />
        );
      case 8: // 미디엄 레이어드
        return (
          <path
            d="M 50 85 C 44 125 50 160 70 175 L 130 175 C 150 160 156 125 150 85 Z"
            fill={hairColor.hex}
          />
        );
      case 15: // 하이 포니테일 (High Ponytail)
        return (
          <g>
            <path
              d="M 125 45 C 150 30 175 60 165 110 C 158 135 145 145 140 150 C 145 125 155 80 130 60 Z"
              fill={hairColor.hex}
            />
            <ellipse cx="128" cy="50" rx="6" ry="4" fill={teamColors.secondary} />
          </g>
        );
      case 16: // 탑 번 (Top Bun)
        return (
          <circle cx="100" cy="24" r="16" fill={hairColor.hex} />
        );
      case 19: // 롱 스트레이트 (Long Straight)
        return (
          <path
            d="M 48 80 C 42 120 45 170 65 190 L 135 190 C 155 170 158 120 152 80 Z"
            fill={hairColor.hex}
          />
        );
      default:
        return null;
    }
  };

  // 2. 목 & 의상 (4종 체형 및 3종 의상: 수트 / 자켓 / 저지 동적 렌더링)
  const renderBodyAndUniform = () => {
    // 체형별 좌표 설정
    // bodyIndex 0: 슬림(Slim) - 좁은 목(폭 28), 슬림한 어깨선, 쇄골 실루엣
    // bodyIndex 1: 스탠다드(Standard) - 균형 잡힌 스포츠 표준 체형 (폭 36)
    // bodyIndex 2: 브로드(Broad) - 다부진 목선과 떡 벌어진 당당한 어깨 (폭 44)
    // bodyIndex 3: 벌크(Bulk) - 두터운 승모근과 압도적인 프레임의 헤비급 근육질 체형 (폭 54)

    let neckPath = "";
    let neckShadowPath = "";
    let jerseyPath = "";
    let collarPath = "";
    let leftStripePath = "";
    let rightStripePath = "";
    let badgeX = 120;
    let badgeY = 168;
    let neckLeft = 82;
    let neckRight = 118;
    let shoulderY = 142;
    let lapelPinX = 114;
    let lapelPinY = 166;

    if (bodyIndex === 0) {
      // 0: 슬림 핏 (여성적/슬림 체형)
      neckLeft = 86;
      neckRight = 114;
      shoulderY = 144;
      neckPath = "M 86 115 L 86 146 C 86 152 114 152 114 146 L 114 115 Z";
      neckShadowPath = "M 86 115 Q 100 126 114 115 Q 100 119 86 115 Z";
      jerseyPath = "M 52 200 L 56 168 C 62 152 74 144 86 144 L 114 144 C 126 144 138 152 144 168 L 148 200 Z";
      collarPath = "M 86 144 L 100 162 L 114 144 L 109 144 L 100 155 L 91 144 Z";
      leftStripePath = "M 58 172 L 66 160 C 74 152 82 148 86 148 L 84 152 C 80 152 70 156 62 174 Z";
      rightStripePath = "M 142 172 L 134 160 C 126 152 118 148 114 148 L 116 152 C 120 152 130 156 138 174 Z";
      badgeX = 116;
      badgeY = 168;
      lapelPinX = 111;
      lapelPinY = 167;
    } else if (bodyIndex === 2) {
      // 2: 브로드 핏 (다부진 목선과 떡 벌어진 당당한 어깨)
      neckLeft = 78;
      neckRight = 122;
      shoulderY = 138;
      neckPath = "M 78 115 L 78 140 C 78 150 122 150 122 140 L 122 115 Z";
      neckShadowPath = "M 78 115 Q 100 132 122 115 Q 100 122 78 115 Z";
      jerseyPath = "M 28 200 L 32 152 C 38 138 60 136 78 138 L 122 138 C 140 136 162 138 168 152 L 172 200 Z";
      collarPath = "M 78 138 L 100 166 L 122 138 L 116 138 L 100 157 L 84 138 Z";
      leftStripePath = "M 36 158 L 48 148 C 62 140 74 138 78 138 L 76 144 C 70 144 56 147 42 163 Z";
      rightStripePath = "M 164 158 L 152 148 C 138 140 126 138 122 138 L 124 144 C 130 144 144 147 158 163 Z";
      badgeX = 126;
      badgeY = 166;
      lapelPinX = 116;
      lapelPinY = 164;
    } else if (bodyIndex === 3) {
      // 3: 벌크 핏 (두터운 승모근과 압도적인 프레임의 헤비급 근육질 체형)
      neckLeft = 73;
      neckRight = 127;
      shoulderY = 134;
      neckPath = "M 73 115 L 73 134 C 73 146 127 146 127 134 L 127 115 Z";
      neckShadowPath = "M 73 115 Q 100 134 127 115 Q 100 123 73 115 Z";
      jerseyPath = "M 14 200 L 18 144 C 24 130 50 128 73 134 L 127 134 C 150 128 176 130 182 144 L 186 200 Z";
      collarPath = "M 73 134 L 100 166 L 127 134 L 120 134 L 100 156 L 80 134 Z";
      leftStripePath = "M 22 152 L 38 138 C 52 130 68 132 73 134 L 71 141 C 65 140 48 140 30 159 Z";
      rightStripePath = "M 178 152 L 162 138 C 148 130 132 132 127 134 L 129 141 C 135 140 152 140 170 159 Z";
      badgeX = 132;
      badgeY = 164;
      lapelPinX = 119;
      lapelPinY = 161;
    } else {
      // 1: 스탠다드 핏 (표준 균형 핏)
      neckLeft = 82;
      neckRight = 118;
      shoulderY = 142;
      neckPath = "M 82 115 L 82 145 C 82 152 118 152 118 145 L 118 115 Z";
      neckShadowPath = "M 82 115 Q 100 130 118 115 Q 100 120 82 115 Z";
      jerseyPath = "M 40 200 L 45 160 C 50 148 68 142 82 142 L 118 142 C 132 142 150 148 155 160 L 160 200 Z";
      collarPath = "M 82 142 L 100 164 L 118 142 L 112 142 L 100 156 L 88 142 Z";
      leftStripePath = "M 48 165 L 56 155 C 68 148 80 145 84 145 L 82 150 C 76 150 64 154 54 168 Z";
      rightStripePath = "M 152 165 L 144 155 C 132 148 120 145 116 145 L 118 150 C 124 150 136 154 146 168 Z";
      badgeX = 120;
      badgeY = 168;
      lapelPinX = 114;
      lapelPinY = 166;
    }

    const tieClipId = `tie-clip-${bodyIndex}-${teamId || "default"}`;

    return (
      <g id="body-and-uniform">
        {/* 목 (Neck) */}
        <path d={neckPath} fill={skin.base} />
        {/* 목 그림자 */}
        <path d={neckShadowPath} fill={skin.shadow} />

        {/* 슬림형 쇄골 실루엣 힌트 (저지 착용 시에만 노출) */}
        {bodyIndex === 0 && outfit === 2 && (
          <path d="M 90 140 Q 100 143 110 140" stroke={skin.shadow} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
        )}

        {/* 벌크형 승모근 근육 라인 힌트 */}
        {bodyIndex === 3 && (
          <g opacity="0.35" stroke={skin.shadow} strokeWidth="1.5" strokeLinecap="round" fill="none">
            <path d="M 68 133 Q 77 142 83 151" />
            <path d="M 132 133 Q 123 142 117 151" />
          </g>
        )}

        {/* ================= OUTFIT 0: 정장 수트 (감독 표준) ================= */}
        {outfit === 0 && (
          <g id="outfit-suit">
            <defs>
              <clipPath id={tieClipId}>
                <path
                  d={`M 94 ${shoulderY + 2} L 106 ${shoulderY + 2} L 103.5 ${shoulderY + 13} L 106.5 194 L 100 199 L 93.5 194 L 96.5 ${shoulderY + 13} Z`}
                />
              </clipPath>
            </defs>

            {/* 1. 다크 네이비 수트 블레이저 몸판 */}
            <path d={jerseyPath} fill="#131E35" />

            {/* 2. 화이트 드레스 셔츠 V존 */}
            <polygon
              points={`${neckLeft},${shoulderY - 3} ${neckRight},${shoulderY - 3} 100,196`}
              fill="#F8FAFC"
            />
            <polygon
              points={`${neckLeft + 1},${shoulderY - 1} ${neckRight - 1},${shoulderY - 1} 100,${shoulderY + 15}`}
              fill="#E2E8F0"
            />

            {/* 3. 팀 고유상징색 두 개(Primary & Secondary)가 들어간 스트라이프 넥타이 */}
            <g clipPath={`url(#${tieClipId})`}>
              {/* 넥타이 바탕 (팀 1차 대표색) */}
              <rect x="88" y={shoulderY} width="24" height="68" fill={teamColors.primary} />
              {/* 넥타이 사선 스트라이프 (팀 2차 보조색) */}
              <g stroke={teamColors.secondary} strokeWidth="4">
                <line x1="88" y1={shoulderY + 8} x2="112" y2={shoulderY - 4} />
                <line x1="88" y1={shoulderY + 18} x2="112" y2={shoulderY + 6} />
                <line x1="88" y1={shoulderY + 28} x2="112" y2={shoulderY + 16} />
                <line x1="88" y1={shoulderY + 38} x2="112" y2={shoulderY + 26} />
                <line x1="88" y1={shoulderY + 48} x2="112" y2={shoulderY + 36} />
                <line x1="88" y1={shoulderY + 58} x2="112" y2={shoulderY + 46} />
                <line x1="88" y1={shoulderY + 68} x2="112" y2={shoulderY + 56} />
              </g>
              {/* 매듭(Knot) 입체 그림자 */}
              <line
                x1="95"
                y1={shoulderY + 13}
                x2="105"
                y2={shoulderY + 13}
                stroke="#09090B"
                strokeWidth="1.4"
                opacity="0.45"
              />
            </g>

            {/* 4. 화이트 셔츠 깃 (Pointed Dress Collar) */}
            <path
              d={`M ${neckLeft} ${shoulderY - 5} L 100 ${shoulderY + 4} L 91 ${shoulderY + 13} L ${neckLeft - 2} ${shoulderY + 3} Z`}
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="0.9"
            />
            <path
              d={`M ${neckRight} ${shoulderY - 5} L 100 ${shoulderY + 4} L 109 ${shoulderY + 13} L ${neckRight + 2} ${shoulderY + 3} Z`}
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="0.9"
            />

            {/* 5. 다크 네이비 블레이저 노치드 라펠 카라 (Notched Lapel) */}
            <path
              d={`M ${neckLeft} ${shoulderY - 4} L ${neckLeft - 11} ${shoulderY + 5} L ${neckLeft - 5} ${shoulderY + 16} L ${neckLeft - 10} ${shoulderY + 19} L 100 196 L 100 187 L ${neckLeft + 2} ${shoulderY + 3} Z`}
              fill="#1E2F4F"
              stroke="#0B1324"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d={`M ${neckRight} ${shoulderY - 4} L ${neckRight + 11} ${shoulderY + 5} L ${neckRight + 5} ${shoulderY + 16} L ${neckRight + 10} ${shoulderY + 19} L 100 196 L 100 187 L ${neckRight - 2} ${shoulderY + 3} Z`}
              fill="#1E2F4F"
              stroke="#0B1324"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* 6. 팀 금속 라펠 핀 (Team Metallic Lapel Pin) */}
            <g transform={`translate(${lapelPinX}, ${lapelPinY})`}>
              <polygon points="0,-5.2 5.2,0 0,5.2 -5.2,0" fill="#FBBF24" stroke="#78350F" strokeWidth="0.8" />
              <polygon points="0,-3.4 3.4,0 0,3.4 -3.4,0" fill={teamColors.primary} />
              <circle cx="0" cy="0" r="1.4" fill={teamColors.secondary} />
              <circle cx="-1.3" cy="-1.3" r="0.7" fill="#FEF9C3" />
            </g>
          </g>
        )}

        {/* ================= OUTFIT 1: 유니폼 자켓 (코치 표준) ================= */}
        {outfit === 1 && (
          <g id="outfit-jacket">
            {/* 1. 자켓 바디 */}
            <path d={jerseyPath} fill={teamColors.primary} />

            {/* 2. 어깨 및 측면 팀 보조색 스트라이프 */}
            <path d={leftStripePath} fill={teamColors.secondary} opacity="0.95" />
            <path d={rightStripePath} fill={teamColors.secondary} opacity="0.95" />
            <path
              d={`M ${neckLeft - 13} ${shoulderY + 15} L ${neckLeft - 9} 200`}
              stroke={teamColors.secondary}
              strokeWidth="3.5"
              opacity="0.85"
            />
            <path
              d={`M ${neckRight + 13} ${shoulderY + 15} L ${neckRight + 9} 200`}
              stroke={teamColors.secondary}
              strokeWidth="3.5"
              opacity="0.85"
            />

            {/* 3. 목까지 올라오는 하이넥 스탠드 카라 */}
            {(() => {
              const collarSideY = shoulderY - 9;
              const collarCenterY = Math.max(shoulderY - 5, 133);
              const collarBottomY = shoulderY + 6;
              return (
                <>
                  <path
                    d={`M ${neckLeft - 2} ${collarSideY} Q 100 ${collarSideY - 3} ${neckRight + 2} ${collarSideY} L ${neckRight + 4} ${collarBottomY} L ${neckLeft - 4} ${collarBottomY} Z`}
                    fill="#0F172A"
                  />
                  <path
                    d={`M ${neckLeft - 4} ${collarBottomY} L ${neckLeft - 2} ${collarSideY} Q 100 ${collarCenterY} ${neckRight + 2} ${collarSideY} L ${neckRight + 4} ${collarBottomY} Q 100 ${collarBottomY + 6} ${neckLeft - 4} ${collarBottomY} Z`}
                    fill={teamColors.primary}
                    stroke="#0F172A"
                    strokeWidth="1.2"
                  />
                  <path
                    d={`M ${neckLeft - 2} ${collarSideY} Q 100 ${collarCenterY} ${neckRight + 2} ${collarSideY}`}
                    fill="none"
                    stroke={teamColors.secondary}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* 4. 하이넥 중앙 지퍼 라인 & 메탈 슬라이더 */}
                  <line x1="100" y1={collarCenterY - 1} x2="100" y2="200" stroke="#09090B" strokeWidth="3.2" />
                  <line
                    x1="100"
                    y1={collarCenterY}
                    x2="100"
                    y2="200"
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                    strokeDasharray="1.8 1.8"
                  />
                  <rect
                    x="98"
                    y={collarCenterY + 1}
                    width="4"
                    height="7"
                    rx="1.5"
                    fill="#E2E8F0"
                    stroke="#1E293B"
                    strokeWidth="0.8"
                  />
                </>
              );
            })()}

            {/* 5. 가슴 팀 엠블럼 패치 */}
            <g transform={`translate(${badgeX}, ${badgeY})`}>
              <path d="M 0 0 L 10 0 L 10 8 L 5 12 L 0 8 Z" fill={teamColors.secondary} />
              <path d="M 2 2 L 8 2 L 8 7 L 5 10 L 2 7 Z" fill={teamColors.accent} />
            </g>
          </g>
        )}

        {/* ================= OUTFIT 2: 유니폼 반팔 저지 (선수 표준) ================= */}
        {outfit === 2 && (
          <g id="outfit-jersey">
            {/* 유니폼 바디 (Jersey Shoulders) */}
            <path d={jerseyPath} fill={teamColors.primary} />

            {/* 유니폼 카라 & 악센트 라인 */}
            <path d={collarPath} fill={teamColors.secondary} />
            <path d={leftStripePath} fill={teamColors.secondary} opacity="0.9" />
            <path d={rightStripePath} fill={teamColors.secondary} opacity="0.9" />

            {/* 가슴 팀 엠블럼 패치 */}
            <g transform={`translate(${badgeX}, ${badgeY})`}>
              <path d="M 0 0 L 10 0 L 10 8 L 5 12 L 0 8 Z" fill={teamColors.secondary} />
              <path d="M 2 2 L 8 2 L 8 7 L 5 10 L 2 7 Z" fill={teamColors.accent} />
            </g>
          </g>
        )}
      </g>
    );
  };

  // 3. 얼굴형 & 귀 (4종: 테이퍼드 -> 샤프 오벌 -> 라운드 -> 볼드 와이드)
  const renderFaceBase = () => {
    let facePath = "";
    let earLeftX = 63;
    let earRightX = 137;
    let cheekLeftX = 76;
    let cheekRightX = 124;

    switch (faceShape) {
      case 0: // 테이퍼드 (날렵한 역삼각형 V라인)
        facePath = "M 65 68 C 65 96 83 130 100 130 C 117 130 135 96 135 68 C 135 44 124 38 100 38 C 76 38 65 44 65 68 Z";
        earLeftX = 64;
        earRightX = 136;
        break;
      case 1: // 샤프 오벌 (갸름한 달걀형)
        facePath = "M 64 70 C 64 100 75 130 100 130 C 125 130 136 100 136 70 C 136 45 124 38 100 38 C 76 38 64 45 64 70 Z";
        earLeftX = 63;
        earRightX = 137;
        break;
      case 2: // 라운드 (부드러운 원형)
        facePath = "M 61 72 C 61 106 75 133 100 133 C 125 133 139 106 139 72 C 139 46 124 38 100 38 C 76 38 61 46 61 72 Z";
        earLeftX = 61;
        earRightX = 139;
        cheekLeftX = 75;
        cheekRightX = 125;
        break;
      case 3: // 볼드 와이드 (넓고 듬직한 큰얼굴)
        facePath = "M 58 68 C 58 104 68 126 82 134 L 118 134 C 132 126 142 104 142 68 C 142 42 125 36 100 36 C 75 36 58 42 58 68 Z";
        earLeftX = 58;
        earRightX = 142;
        cheekLeftX = 73;
        cheekRightX = 127;
        break;
      default:
        facePath = "M 64 70 C 64 100 75 130 100 130 C 125 130 136 100 136 70 C 136 45 124 38 100 38 C 76 38 64 45 64 70 Z";
    }

    return (
      <g id="face-and-ears">
        {/* 귀 (Ears) */}
        <ellipse cx={earLeftX} cy="85" rx="7" ry="12" fill={skin.base} />
        <ellipse cx={earLeftX} cy="85" rx="4" ry="7" fill={skin.shadow} />

        <ellipse cx={earRightX} cy="85" rx="7" ry="12" fill={skin.base} />
        <ellipse cx={earRightX} cy="85" rx="4" ry="7" fill={skin.shadow} />

        {/* 얼굴 베이스 (Face Base) */}
        <path d={facePath} fill={skin.base} />

        {/* 볼 음영/블러셔 */}
        <ellipse cx={cheekLeftX} cy="94" rx="7" ry="4" fill={skin.shadow} opacity="0.4" />
        <ellipse cx={cheekRightX} cy="94" rx="7" ry="4" fill={skin.shadow} opacity="0.4" />
      </g>
    );
  };

  // 3.4. 주름 (Forehead, Smile Lines, Full)
  const renderWrinkles = () => {
    switch (wrinkle) {
      case 1: // 이마주름 (이마 & 미간 라인)
        return (
          <g id="wrinkle-forehead">
            <path d="M 83 55 Q 100 53 117 55" stroke={skin.shadow} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 86 60 Q 100 58 114 60" stroke={skin.shadow} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.75" />
            <line x1="98" y1="70" x2="98" y2="76" stroke={skin.shadow} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            <line x1="102" y1="70" x2="102" y2="76" stroke={skin.shadow} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          </g>
        );
      case 2: // 팔자주름 (입가 연륜 라인)
        return (
          <g id="wrinkle-smile">
            <path d="M 93 101 Q 89 108 90 117" stroke={skin.shadow} strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.82" />
            <path d="M 107 101 Q 111 108 110 117" stroke={skin.shadow} strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.82" />
            <path d="M 92 105 Q 88 110 89 114" stroke={skin.shadow} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
            <path d="M 108 105 Q 112 110 111 114" stroke={skin.shadow} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
          </g>
        );
      case 3: // 종합주름 (이마 + 미간 + 팔자 종합)
        return (
          <g id="wrinkle-full">
            <path d="M 83 55 Q 100 53 117 55" stroke={skin.shadow} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 86 60 Q 100 58 114 60" stroke={skin.shadow} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.75" />
            <line x1="98" y1="70" x2="98" y2="76" stroke={skin.shadow} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            <line x1="102" y1="70" x2="102" y2="76" stroke={skin.shadow} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            <path d="M 93 101 Q 89 108 90 117" stroke={skin.shadow} strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.82" />
            <path d="M 107 101 Q 111 108 110 117" stroke={skin.shadow} strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.82" />
            <path d="M 92 105 Q 88 110 89 114" stroke={skin.shadow} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
            <path d="M 108 105 Q 112 110 111 114" stroke={skin.shadow} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.45" />
          </g>
        );
      default:
        return null;
    }
  };

  // 3.5. 눈 액세서리 (하단 피부 디테일: 뺨 반창고)
  const renderEyeAccessoryUnder = () => {
    switch (eyeAccessory) {
      case 5: // 뺨 반창고
        return (
          <g id="eye-acc-bandage" transform="translate(118, 93) rotate(-15)">
            <rect x="-7" y="-3" width="14" height="6" rx="1.5" fill="#E2B183" stroke="#C59367" strokeWidth="0.8" />
            <rect x="-2" y="-3" width="4" height="6" fill="#D4A173" opacity="0.6" />
          </g>
        );
      default:
        return null;
    }
  };

  // 3.6. 입 액세서리 (콧수염, 소울패치, 친고티, 트리밍 쇼트, 와이드러프)
  const renderMouthAccessory = () => {
    switch (mouthAccessory) {
      case 1: // 깔끔한 콧수염 (단정한 클래식)
        return (
          <g id="mouth-acc-mustache">
            <path
              d="M 91 107 C 93 103 97 104 100 106 C 103 104 107 103 109 107 C 106 109 101 109 100 108 C 99 109 94 109 91 107 Z"
              fill={hairColor.hex}
            />
          </g>
        );
      case 2: // 소울패치 (아랫입술 밑 포인트)
        return (
          <g id="mouth-acc-soul-patch">
            <polygon points="98,114 102,114 100.5,120 99.5,120" fill={hairColor.hex} />
            <ellipse cx="100" cy="117" rx="3" ry="1.5" fill={skin.shadow} opacity="0.3" />
          </g>
        );
      case 3: // 친고티 (턱 끝 포인트 수염)
        return (
          <g id="mouth-acc-goatee">
            <polygon points="98.5,114 101.5,114 100.5,118 99.5,118" fill={hairColor.hex} />
            <path d="M 94 121 Q 100 119 106 121 L 103 131 Q 100 133 97 131 Z" fill={hairColor.hex} />
          </g>
        );
      case 4: // 트리밍 쇼트 (정돈된 쇼트 비어드)
        return (
          <g id="mouth-acc-trimmed-short">
            <path
              d="M 68 96 C 68 116 80 131 100 131 C 120 131 132 116 132 96 C 130 106 125 116 112 120 C 108 121 104 121 100 121 C 96 121 92 121 88 120 C 75 116 70 106 68 96 Z"
              fill={hairColor.hex}
            />
            <path
              d="M 90 107 C 93 103 97 104 100 106 C 103 104 107 103 110 107 C 106 109 101 109 100 108 C 99 109 94 109 90 107 Z"
              fill={hairColor.hex}
            />
            <polygon points="98,114 102,114 100.5,119 99.5,119" fill={hairColor.hex} />
          </g>
        );
      case 5: // 와이드러프 (마초적 러프 비어드)
        return (
          <g id="mouth-acc-wide-rough">
            <path
              d="M 66 92 C 66 118 78 132 100 132 C 122 132 134 118 134 92 C 131 104 124 115 112 119 C 108 120 104 120.5 100 120.5 C 96 120.5 92 120 88 119 C 76 115 69 104 66 92 Z"
              fill={hairColor.hex}
            />
            <path
              d="M 70 96 C 70 114 80 126 100 126 C 120 126 130 114 130 96 C 128 103 124 112 112 116 C 100 118 88 116 70 96 Z"
              fill={hairColor.hex}
              opacity="0.3"
            />
            <path
              d="M 89 107 C 92 102 96 103 100 105 C 104 103 108 102 111 107 C 107 110 101 110 100 109 C 99 110 93 110 89 107 Z"
              fill={hairColor.hex}
            />
            <polygon points="97,113 103,113 101,120 99,120" fill={hairColor.hex} />
          </g>
        );
      default:
        return null;
    }
  };

  // 4. 눈썹 (Eyebrows)
  const renderEyebrows = () => {
    switch (eyebrowStyle) {
      case 0:
        return (
          <g fill={hairColor.hex}>
            <path d="M 72 71 L 91 71 L 90 75 L 72 74 Z" />
            <path d="M 128 71 L 109 71 L 110 75 L 128 74 Z" />
          </g>
        );
      case 1:
        return (
          <g stroke={hairColor.hex} strokeWidth="3.2" strokeLinecap="round" fill="none">
            <path d="M 73 73 Q 82 69 90 72" />
            <path d="M 127 73 Q 118 69 110 72" />
          </g>
        );
      case 2:
        return (
          <g fill={hairColor.hex}>
            <polygon points="72,74 84,69 91,73 89,75 83,72 72,76" />
            <polygon points="128,74 116,69 109,73 111,75 117,72 128,76" />
          </g>
        );
      case 3:
        return (
          <g stroke={hairColor.hex} strokeWidth="2.2" strokeLinecap="round" fill="none">
            <path d="M 73 73 Q 82 71 90 73" />
            <path d="M 127 73 Q 118 71 110 73" />
          </g>
        );
      case 4:
        return (
          <g fill={hairColor.hex}>
            <path d="M 71 73 L 84 69 L 91 72 L 90 76 L 82 74 L 71 77 Z" />
            <path d="M 129 73 L 116 69 L 109 72 L 110 76 L 118 74 L 129 77 Z" />
          </g>
        );
      case 5:
        return (
          <g stroke={hairColor.hex} strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 72 73.5 Q 82 71.5 91 70" />
            <path d="M 128 73.5 Q 118 71.5 109 70" />
          </g>
        );
      default:
        return null;
    }
  };

  // 5. 눈매 (Eyes)
  const renderEyes = () => {
    const renderPupil = (cx: number, cy: number, r: number = 3.5) => (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={eyeColor.hex} />
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#09090B" />
        <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.32} fill="#FFFFFF" />
      </g>
    );

    switch (eyeStyle) {
      case 0:
        return (
          <g>
            <path d="M 73 83 Q 82 78 90 83 Q 82 87 73 83 Z" fill="#FFFFFF" />
            {renderPupil(82, 82.5, 3.2)}
            <path d="M 72 82 Q 82 77 91 82" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            <path d="M 127 83 Q 118 78 110 83 Q 118 87 127 83 Z" fill="#FFFFFF" />
            {renderPupil(118, 82.5, 3.2)}
            <path d="M 128 82 Q 118 77 109 82" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 1:
        return (
          <g>
            <ellipse cx="82" cy="83" rx="8" ry="5.5" fill="#FFFFFF" />
            {renderPupil(82, 83, 3.6)}
            <path d="M 73 81 Q 82 76 91 81" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 76 88 Q 82 90 89 88" stroke="#71717A" strokeWidth="1" strokeLinecap="round" fill="none" />

            <ellipse cx="118" cy="83" rx="8" ry="5.5" fill="#FFFFFF" />
            {renderPupil(118, 83, 3.6)}
            <path d="M 127 81 Q 118 76 109 81" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 124 88 Q 118 90 111 88" stroke="#71717A" strokeWidth="1" strokeLinecap="round" fill="none" />
          </g>
        );
      case 2:
        return (
          <g>
            <ellipse cx="82" cy="83" rx="8.5" ry="7" fill="#FFFFFF" />
            {renderPupil(82, 83, 4.2)}
            <path d="M 73 80 Q 82 75 91 80" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" fill="none" />

            <ellipse cx="118" cy="83" rx="8.5" ry="7" fill="#FFFFFF" />
            {renderPupil(118, 83, 4.2)}
            <path d="M 127 80 Q 118 75 109 80" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          </g>
        );
      case 3:
        return (
          <g>
            <path d="M 73 84 Q 82 79 91 84" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 74 85 Q 82 89 90 85" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="82" cy="83.5" r="2.2" fill={eyeColor.hex} />

            <path d="M 127 84 Q 118 79 109 84" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M 126 85 Q 118 89 110 85" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="118" cy="83.5" r="2.2" fill={eyeColor.hex} />
          </g>
        );
      case 4:
        return (
          <g>
            <path d="M 74 81 Q 82 79 91 84" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <ellipse cx="82" cy="84" rx="7" ry="5" fill="#FFFFFF" />
            {renderPupil(82, 84, 3.2)}

            <path d="M 126 81 Q 118 79 109 84" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <ellipse cx="118" cy="84" rx="7" ry="5" fill="#FFFFFF" />
            {renderPupil(118, 84, 3.2)}
          </g>
        );
      case 5:
        return (
          <g>
            <polygon points="73,81 83,78 91,81 89,86 75,86" fill="#FFFFFF" />
            {renderPupil(82, 82, 3.5)}
            <path d="M 72 80 L 92 80" stroke="#18181B" strokeWidth="3" strokeLinecap="square" fill="none" />

            <polygon points="127,81 117,78 109,81 111,86 125,86" fill="#FFFFFF" />
            {renderPupil(118, 82, 3.5)}
            <path d="M 128 80 L 108 80" stroke="#18181B" strokeWidth="3" strokeLinecap="square" fill="none" />
          </g>
        );
      case 6:
        return (
          <g>
            <path d="M 73 83 Q 82 79 90 82" stroke="#09090B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <ellipse cx="81.5" cy="84" rx="6.5" ry="4" fill="#FFFFFF" />
            {renderPupil(81.5, 84, 2.8)}

            <path d="M 127 83 Q 118 79 110 82" stroke="#09090B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <ellipse cx="118.5" cy="84" rx="6.5" ry="4" fill="#FFFFFF" />
            {renderPupil(118.5, 84, 2.8)}
          </g>
        );
      case 7:
        return (
          <g>
            <path d="M 73 84 Q 82 78 92 80" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <ellipse cx="83" cy="83" rx="7.5" ry="4.5" fill="#FFFFFF" />
            {renderPupil(83, 83, 3.2)}

            <path d="M 127 84 Q 118 78 108 80" stroke="#18181B" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <ellipse cx="117" cy="83" rx="7.5" ry="4.5" fill="#FFFFFF" />
            {renderPupil(117, 83, 3.2)}
          </g>
        );
      case 8:
        return (
          <g>
            <rect x="75" y="80" width="14" height="7" rx="3.5" fill="#FFFFFF" />
            {renderPupil(82, 83.5, 3)}
            <line x1="74" y1="79" x2="90" y2="79" stroke="#18181B" strokeWidth="2.2" />

            <rect x="111" y="80" width="14" height="7" rx="3.5" fill="#FFFFFF" />
            {renderPupil(118, 83.5, 3)}
            <line x1="110" y1="79" x2="126" y2="79" stroke="#18181B" strokeWidth="2.2" />
          </g>
        );
      case 9:
        return (
          <g>
            <path d="M 72 81 Q 82 76 91 81 Q 82 89 72 81 Z" fill="#FFFFFF" />
            {renderPupil(82, 82.5, 3.8)}
            <path d="M 71 80 Q 82 75 92 80" stroke="#000000" strokeWidth="3" strokeLinecap="round" fill="none" />

            <path d="M 128 81 Q 118 76 109 81 Q 118 89 128 81 Z" fill="#FFFFFF" />
            {renderPupil(118, 82.5, 3.8)}
            <path d="M 129 80 Q 118 75 108 80" stroke="#000000" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      case 10:
        return (
          <g>
            <path d="M 74 82 L 90 82" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 75 83 Q 82 86 89 83" fill="#FFFFFF" />
            {renderPupil(82, 83, 2.5)}

            <path d="M 126 82 L 110 82" stroke="#18181B" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 125 83 Q 118 86 111 83" fill="#FFFFFF" />
            {renderPupil(118, 83, 2.5)}
          </g>
        );
      case 11:
        return (
          <g>
            <ellipse cx="82" cy="83" rx="8" ry="6" fill="#FFFFFF" />
            {renderPupil(82, 83, 3.5)}
            <path d="M 74 81 Q 82 77 90 81" stroke="#27272A" strokeWidth="2.2" strokeLinecap="round" fill="none" />

            <ellipse cx="118" cy="83" rx="8" ry="6" fill="#FFFFFF" />
            {renderPupil(118, 83, 3.5)}
            <path d="M 126 81 Q 118 77 110 81" stroke="#27272A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        );
      default:
        return null;
    }
  };

  // 6. 코 (Nose)
  const renderNose = () => {
    switch (noseStyle) {
      case 0:
        return <ellipse cx="100" cy="98" rx="2" ry="1.5" fill={skin.shadow} />;
      case 1:
        return <path d="M 99 90 L 98 97 L 102 98" stroke={skin.shadow} strokeWidth="1.8" strokeLinecap="round" fill="none" />;
      case 2:
        return <path d="M 97 97 Q 100 100 103 97" stroke={skin.shadow} strokeWidth="2" strokeLinecap="round" fill="none" />;
      case 3:
        return <polygon points="98,90 97,98 102,98" fill={skin.shadow} opacity="0.8" />;
      case 4:
        return (
          <g>
            <circle cx="98" cy="97" r="1.2" fill={skin.shadow} />
            <circle cx="102" cy="97" r="1.2" fill={skin.shadow} />
            <path d="M 96 96 Q 100 98 104 96" stroke={skin.shadow} strokeWidth="1.2" fill="none" />
          </g>
        );
      case 5: // 하이 브릿지 (미간부터 시원하게 뻗은 강렬한 입체 콧대)
        return (
          <g id="nose-high-bridge">
            {/* 미간에서부터 쭉 뻗어 내려오는 높은 콧대 메인 라인 */}
            <path
              d="M 98 80 L 97 94 L 101 98"
              stroke={skin.shadow}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* 콧대 우측 은은한 입체 하이라이트 */}
            <path
              d="M 100 82 L 99 94"
              stroke={skin.highlight || "#FFFFFF"}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.65"
              fill="none"
            />
            {/* 좌/우 또렷한 콧망울 날개 라인 */}
            <path
              d="M 94 97 Q 96 94 99 97"
              stroke={skin.shadow}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 106 97 Q 104 94 101 97"
              stroke={skin.shadow}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            {/* 코끝 하단 입체 음영 */}
            <polygon points="98,97 102,97 100,99" fill={skin.shadow} opacity="0.8" />
          </g>
        );
      default:
        return null;
    }
  };

  // 7. 입 & 표정 (선택된 입술 컬러 `lipColor` 동적 반영)
  const renderMouth = () => {
    const lipMain = lipColor.hex;
    const lipDark = lipColor.shadowHex;

    switch (mouthStyle) {
      case 0: // 은은한 미소
        return (
          <g>
            <path d="M 93 110 Q 100 115 107 110" stroke={lipDark} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M 95 111 Q 100 114 105 111" stroke={lipMain} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        );
      case 1: // 자신만만한 입꼬리 (당당한 썩소)
        return (
          <g>
            <path d="M 93 111 Q 99 112 108 107" stroke={lipDark} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 96 111 Q 101 111 107 108" stroke={lipMain} strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        );
      case 2: // 단호한 앙다문 입
        return (
          <g>
            <line x1="93" y1="111" x2="107" y2="111" stroke={lipDark} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="95" y1="111" x2="105" y2="111" stroke={lipMain} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        );
      case 3: // 활짝 웃는 입 (미소 + 치아)
        return (
          <g>
            <path d="M 92 109 Q 100 120 108 109 Z" fill={lipDark} />
            <path d="M 94 110 Q 100 114 106 110 Z" fill="#FFFFFF" />
            <path d="M 92 109 Q 100 114 108 109" stroke={lipMain} strokeWidth="1.5" fill="none" />
          </g>
        );
      case 4: // 살짝 벌린 입
        return (
          <g>
            <ellipse cx="100" cy="111" rx="4.5" ry="3" fill="#2E0A12" stroke={lipDark} strokeWidth="1.2" />
            <path d="M 96 109 Q 100 108 104 109" stroke={lipMain} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 5: // 냉철한 찌푸림 (완만하고 엄격한 카리스마 입매)
        return (
          <g>
            <path d="M 93 112.2 Q 100 110.5 107 112.2" stroke={lipDark} strokeWidth="2.3" strokeLinecap="round" fill="none" />
            <path d="M 95 111.8 Q 100 110.8 105 111.8" stroke={lipMain} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        );
      default:
        return null;
    }
  };

  // 8. 전면 머리카락 (Front Hair)
  const renderFrontHair = () => {
    const col = hairColor.hex;
    const hi = hairColor.highlightHex || "#FFFFFF";

    switch (hairStyle) {
      case 0:
        return (
          <g>
            <path d="M 60 75 C 58 45 75 30 100 30 C 125 30 142 45 140 75 C 135 60 120 52 100 52 C 80 52 65 60 60 75 Z" fill={col} />
            <path d="M 64 65 Q 100 68 136 65 Q 100 52 64 65 Z" fill={col} />
            <path d="M 78 40 Q 100 36 122 40" stroke={hi} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          </g>
        );
      case 1:
        return (
          <g>
            <path d="M 58 75 C 56 42 75 28 100 28 C 126 28 144 42 142 75 C 138 55 125 45 106 45 C 96 45 90 50 88 56 C 86 63 92 68 94 72 C 88 72 75 68 72 58 C 65 60 60 68 58 75 Z" fill={col} />
            <path d="M 94 72 Q 86 70 88 60 Q 94 54 102 54" stroke={col} strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 75 36 Q 100 33 125 36" stroke={hi} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          </g>
        );
      case 2:
        return (
          <g>
            <rect x="58" y="65" width="8" height="20" fill={col} opacity="0.5" />
            <rect x="134" y="65" width="8" height="20" fill={col} opacity="0.5" />
            <path d="M 62 70 C 60 38 78 28 100 28 C 122 28 140 38 138 70 C 132 55 120 48 100 48 C 80 48 68 55 62 70 Z" fill={col} />
            <path d="M 75 38 Q 100 34 125 38" stroke={hi} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
          </g>
        );
      case 3:
        return (
          <g>
            <path d="M 64 68 C 62 38 80 26 100 26 C 120 26 138 38 136 68 C 130 52 118 42 100 42 C 82 42 70 52 64 68 Z" fill={col} />
            <path d="M 85 45 Q 85 30 100 30 Q 115 30 115 45" stroke={hi} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5" />
          </g>
        );
      case 4:
        return (
          <g>
            <path d="M 58 75 C 56 40 76 28 100 28 C 124 28 144 40 142 75 C 135 56 122 48 106 50 L 102 62 L 98 50 C 82 48 65 56 58 75 Z" fill={col} />
            <path d="M 70 65 Q 85 55 98 60" stroke={col} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 130 65 Q 115 55 102 60" stroke={col} strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        );
      case 5:
        return (
          <g>
            <path d="M 58 78 C 56 42 75 30 100 30 C 125 30 144 42 142 78 C 138 60 125 50 100 50 C 75 50 62 60 58 78 Z" fill={col} />
            <line x1="88" y1="52" x2="86" y2="68" stroke={col} strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="52" x2="100" y2="70" stroke={col} strokeWidth="3" strokeLinecap="round" />
            <line x1="112" y1="52" x2="114" y2="68" stroke={col} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case 6:
        return (
          <g>
            <path d="M 58 75 C 56 40 76 28 100 28 C 124 28 144 40 142 75 C 132 55 118 48 100 48 C 82 48 68 55 58 75 Z" fill={col} />
            <polygon points="68,60 60,68 72,68" fill={col} />
            <polygon points="132,60 140,68 128,68" fill={col} />
            <polygon points="90,48 100,58 110,48" fill={col} />
          </g>
        );
      case 7:
        return (
          <path d="M 56 95 C 54 45 74 30 100 30 C 126 30 146 45 144 95 L 138 95 C 138 60 125 48 100 48 C 75 48 62 60 62 95 Z" fill={col} />
        );
      case 8:
        return (
          <path d="M 56 100 C 54 42 75 28 100 28 C 125 28 146 42 144 100 C 138 70 126 50 100 50 C 74 50 62 70 56 100 Z" fill={col} />
        );
      case 9:
        return (
          <g>
            <path d="M 64 68 C 62 42 78 32 100 32 C 122 32 138 42 136 68 C 132 58 120 54 100 54 C 80 54 68 58 64 68 Z" fill={col} />
            <line x1="72" y1="56" x2="128" y2="56" stroke={col} strokeWidth="4" strokeLinecap="square" />
          </g>
        );
      case 10:
        return (
          <g>
            <path d="M 58 75 C 56 40 76 28 100 28 C 124 28 144 40 142 75 C 136 58 124 48 100 48 C 76 48 64 58 58 75 Z" fill={col} />
            <polygon points="78,52 82,64 88,52" fill={col} />
            <polygon points="95,50 100,66 105,50" fill={col} />
            <polygon points="112,52 118,64 122,52" fill={col} />
          </g>
        );
      case 11:
        return (
          <g>
            <path d="M 60 75 C 58 40 78 28 100 28 C 122 28 142 40 140 75 C 134 56 122 45 104 46 L 102 58 L 96 46 C 76 45 66 58 60 75 Z" fill={col} />
            <path d="M 104 46 Q 118 40 134 52" stroke={col} strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 66 70 Q 78 52 96 46" stroke={col} strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 12:
        return (
          <path d="M 68 62 L 68 34 C 68 28 80 24 100 24 C 120 24 132 28 132 34 L 132 62 C 125 56 115 54 100 54 C 85 54 75 56 68 62 Z" fill={col} />
        );
      case 13:
        return (
          <g>
            <path d="M 58 74 C 56 38 76 26 100 26 C 124 26 144 38 142 74 C 135 56 122 46 100 46 C 78 46 65 56 58 74 Z" fill={col} />
            <circle cx="76" cy="48" r="6" fill={col} />
            <circle cx="92" cy="44" r="7" fill={col} />
            <circle cx="108" cy="44" r="7" fill={col} />
            <circle cx="124" cy="48" r="6" fill={col} />
          </g>
        );
      case 14:
        return (
          <g>
            <path d="M 58 78 C 56 42 76 28 100 28 C 124 28 144 42 142 78 C 136 60 120 48 100 48 C 80 48 64 60 58 78 Z" fill={col} />
            <path d="M 65 72 Q 80 50 100 56 Q 120 50 135 72" stroke={col} strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>
        );
      case 15:
        return (
          <g>
            <path d="M 62 72 C 60 40 78 30 100 30 C 122 30 140 40 138 72 C 132 54 118 46 100 46 C 82 46 68 54 62 72 Z" fill={col} />
            <path d="M 62 74 Q 60 88 64 96" stroke={col} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 138 74 Q 140 88 136 96" stroke={col} strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        );
      case 16:
        return (
          <g>
            <path d="M 62 72 C 60 40 78 30 100 30 C 122 30 140 40 138 72 C 132 54 118 46 100 46 C 82 46 68 54 62 72 Z" fill={col} />
            <path d="M 64 68 Q 100 62 136 68" stroke={col} strokeWidth="3" fill="none" />
          </g>
        );
      case 17:
        return (
          <g>
            <path d="M 62 70 C 60 38 78 28 100 28 C 122 28 140 38 138 70 C 132 52 115 42 90 44 L 86 54 L 80 44 C 70 44 65 54 62 70 Z" fill={col} />
            <path d="M 88 44 Q 115 42 134 56" stroke={col} strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 18:
        return (
          <g>
            <path d="M 64 68 C 62 40 78 28 100 28 C 122 28 138 40 136 68 C 130 52 118 46 100 46 C 82 46 70 52 64 68 Z" fill={col} />
            <polygon points="76,38 82,24 88,38" fill={col} />
            <polygon points="94,36 100,20 106,36" fill={col} />
            <polygon points="112,38 118,24 124,38" fill={col} />
          </g>
        );
      case 19:
        return (
          <g>
            <path d="M 58 75 C 56 42 75 30 100 30 C 125 30 144 42 142 75 C 136 56 120 48 100 48 C 80 48 64 56 58 75 Z" fill={col} />
            <path d="M 60 75 L 56 110" stroke={col} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 140 75 L 144 110" stroke={col} strokeWidth="3.5" strokeLinecap="round" />
          </g>
        );
      default:
        return null;
    }
  };

  // 9. 눈 액세서리 (상단 착용물: 안경 3종, 선글라스)
  const renderEyeAccessoryOver = () => {
    switch (eyeAccessory) {
      case 1: // 블랙 뿔테 안경
        return (
          <g id="eye-acc-horn-rim" stroke="#18181B" strokeWidth="2.6" fill="rgba(255, 255, 255, 0.15)">
            <rect x="71" y="77" width="22" height="13" rx="3.5" />
            <rect x="107" y="77" width="22" height="13" rx="3.5" />
            <line x1="93" y1="83" x2="107" y2="83" strokeWidth="2.5" />
            <line x1="71" y1="81" x2="63" y2="81" strokeWidth="2" />
            <line x1="129" y1="81" x2="137" y2="81" strokeWidth="2" />
          </g>
        );
      case 2: // 실버 메탈 라운드 안경
        return (
          <g id="eye-acc-round-metal" stroke="#94A3B8" strokeWidth="1.8" fill="rgba(255, 255, 255, 0.2)">
            <circle cx="82" cy="83" r="10" />
            <circle cx="118" cy="83" r="10" />
            <path d="M 92 83 Q 100 80 108 83" fill="none" strokeWidth="1.6" />
            <line x1="72" y1="83" x2="63" y2="83" strokeWidth="1.4" />
            <line x1="128" y1="83" x2="137" y2="83" strokeWidth="1.4" />
          </g>
        );
      case 3: // 하금테 안경
        return (
          <g id="eye-acc-clubmaster">
            <path d="M 70 77 L 94 77" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 106 77 L 130 77" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="94" y1="79" x2="106" y2="79" stroke="#D4AF37" strokeWidth="1.8" />
            <path d="M 72 78 Q 72 90 82 90 Q 92 90 92 78" stroke="#D4AF37" strokeWidth="1.4" fill="rgba(255,255,255,0.15)" />
            <path d="M 108 78 Q 108 90 118 90 Q 128 90 128 78" stroke="#D4AF37" strokeWidth="1.4" fill="rgba(255,255,255,0.15)" />
          </g>
        );
      case 4: // 스포티 선글라스
        return (
          <g id="eye-acc-shades" fill="#0F172A" stroke="#334155" strokeWidth="1.5">
            <polygon points="70,76 93,76 91,89 73,88" />
            <polygon points="107,76 130,76 127,88 109,89" />
            <line x1="93" y1="78" x2="107" y2="78" stroke="#334155" strokeWidth="2.5" />
            <line x1="74" y1="79" x2="84" y2="87" stroke="#38BDF8" strokeWidth="1.2" opacity="0.6" />
            <line x1="111" y1="79" x2="121" y2="87" stroke="#38BDF8" strokeWidth="1.2" opacity="0.6" />
          </g>
        );
      default:
        return null;
    }
  };

  // 10. 귀 액세서리 (헤드셋, 이어셋, 링 피어싱)
  const renderEarAccessory = () => {
    switch (earAccessory) {
      case 1: // 헤드셋 (프로게이머 보이스챗)
        return (
          <g id="ear-acc-headset">
            <path d="M 52 82 C 48 35 70 20 100 20 C 130 20 152 35 148 82" stroke="#09090B" strokeWidth="6" strokeLinecap="round" fill="none" />
            <rect x="49" y="74" width="10" height="22" rx="5" fill="#18181B" stroke={teamColors.secondary} strokeWidth="2" />
            <rect x="141" y="74" width="10" height="22" rx="5" fill="#18181B" stroke={teamColors.secondary} strokeWidth="2" />
            <path d="M 55 90 Q 60 105 78 106" stroke="#27272A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="78" cy="106" r="3.2" fill={teamColors.accent} />
          </g>
        );
      case 2: // 이어셋 (코칭 싱글 무전기)
        return (
          <g id="ear-acc-earpiece">
            <circle cx="61" cy="86" r="3.5" fill="#18181B" stroke={teamColors.secondary} strokeWidth="1.2" />
            <path d="M 61 88 Q 66 102 76 103" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <circle cx="76" cy="103" r="2" fill={teamColors.accent} />
          </g>
        );
      case 3: // 링 피어싱 (실버 링 & 피어싱)
        return (
          <g id="ear-acc-piercing">
            <circle cx="62" cy="94" r="2.8" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
            <circle cx="61" cy="78" r="1.5" fill="#E2E8F0" />
            <circle cx="62" cy="81" r="1.5" fill="#E2E8F0" />
            <circle cx="138" cy="94" r="2.8" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative inline-block select-none overflow-hidden rounded-2xl ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`bg-grad-${teamId || "default"}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor={teamColors.secondary} stopOpacity="0.35" />
            <stop offset="70%" stopColor={teamColors.primary} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0B0F19" stopOpacity="1" />
          </radialGradient>
        </defs>

        {showBackground && (
          <rect width="200" height="200" fill={`url(#bg-grad-${teamId || "default"})`} />
        )}

        {renderBackHair()}
        {renderBodyAndUniform()}
        {renderFaceBase()}
        {renderWrinkles()}
        {renderEyeAccessoryUnder()}
        {renderMouthAccessory()}
        {renderNose()}
        {renderMouth()}
        {renderEyes()}
        {renderEyebrows()}
        {renderFrontHair()}
        {renderEyeAccessoryOver()}
        {renderEarAccessory()}
      </svg>
    </div>
  );
}
