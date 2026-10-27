// Avatar System Type Definitions for League Management: Champions

export interface AvatarDna {
  skinToneIndex: number;        // 0 ~ 7 (8종 피부톤)
  faceShapeIndex: number;       // 0 ~ 3 (4종 얼굴형)
  bodyTypeIndex: number;        // 0 ~ 3 (4종 체형: 슬림, 스탠다드, 브로드, 릴랙스)
  hairStyleIndex: number;       // 0 ~ 19 (20종 성별공용 헤어스타일)
  hairColorIndex: number;       // 0 ~ 11 (12종 헤어 컬러)
  eyeStyleIndex: number;        // 0 ~ 11 (12종 눈매 스타일)
  eyeColorIndex: number;        // 0 ~ 7 (8종 눈동자 컬러)
  eyebrowIndex: number;         // 0 ~ 5 (6종 눈썹)
  noseStyleIndex: number;       // 0 ~ 5 (6종 코)
  mouthStyleIndex: number;      // 0 ~ 5 (6종 입 & 표정)
  lipColorIndex: number;        // 0 ~ 7 (8종 입술 컬러)
  eyeAccessoryIndex: number;    // 0 ~ 5 (6종 눈 액세서리: 없음, 안경3종, 선글라스, 뺨 반창고)
  mouthAccessoryIndex: number;  // 0 ~ 5 (6종 입 액세서리: 없음, 깔끔한 콧수염, 소울패치, 친고티, 트리밍 쇼트, 와이드러프)
  earAccessoryIndex: number;    // 0 ~ 3 (4종 귀 액세서리: 없음, 헤드셋, 이어셋, 링 피어싱)
  wrinkleIndex?: number;        // 0 ~ 3 (4종 주름: 없음, 이마주름, 팔자주름, 종합주름)
  outfitIndex?: number;         // 0 ~ 2 (3종 의상: 0=수트[감독], 1=자켓[코치], 2=저지[선수])
}

// 3종 의상 (감독 수트 / 코치 자켓 / 선수 저지)
export interface OutfitOption {
  id: string;
  name: string;
  roleLabel: string;
  description: string;
}

export const OUTFIT_TYPES: OutfitOption[] = [
  {
    id: "outfit_suit",
    name: "정장 수트 (Suit)",
    roleLabel: "감독 표준",
    description: "다크 네이비 블레이저 카라 + 화이트 셔츠 + 팀 고유상징색 투톤 스트라이프 넥타이 + 팀 금속 라펠 핀",
  },
  {
    id: "outfit_jacket",
    name: "유니폼 자켓 (Jacket)",
    roleLabel: "코치 표준",
    description: "목까지 올라오는 하이넥 지퍼 라인 + 팀 엠블럼 패치 + 어깨/측면 팀 보조색 스트라이프",
  },
  {
    id: "outfit_jersey",
    name: "유니폼 저지 (Jersey)",
    roleLabel: "선수 표준",
    description: "팀 대표색과 보조색이 적용된 공식 스포티 반팔 유니폼 저지",
  },
];

// 8가지 피부톤 팔레트
export interface SkinTonePalette {
  id: string;
  name: string;
  base: string;
  shadow: string;
  highlight: string;
}

export const SKIN_TONES: SkinTonePalette[] = [
  { id: "skin_fair_warm", name: "페어 웜톤", base: "#FFE0BD", shadow: "#F3C59A", highlight: "#FFF2E2" },
  { id: "skin_fair_cool", name: "페어 쿨톤", base: "#FCD8D4", shadow: "#EDB5AF", highlight: "#FFF0EE" },
  { id: "skin_natural_ivory", name: "내추럴 아이보리", base: "#F7D3A6", shadow: "#E0B380", highlight: "#FFECD6" },
  { id: "skin_warm_beige", name: "웜 베이지", base: "#E8BA88", shadow: "#CE9A65", highlight: "#F7D6B0" },
  { id: "skin_olive_tan", name: "올리브 탠", base: "#D69F6E", shadow: "#B87E4E", highlight: "#E5BA90" },
  { id: "skin_warm_honey", name: "허니 골드", base: "#C68642", shadow: "#A66627", highlight: "#DBA368" },
  { id: "skin_rich_bronze", name: "리치 브론즈", base: "#8D5524", shadow: "#6D3B11", highlight: "#A66E3C" },
  { id: "skin_deep_espresso", name: "딥 에스프레소", base: "#593116", shadow: "#3D1E09", highlight: "#784624" },
];

// 4종 체형 (슬림 -> 스탠다드 -> 브로드 -> 벌크)
export interface BodyTypeOption {
  id: string;
  name: string;
  description: string;
  neckWidth: number;
  shoulderWidth: number;
}

export const BODY_TYPES: BodyTypeOption[] = [
  {
    id: "body_slim",
    name: "슬림 핏 (Slim)",
    description: "가녀린 목선과 좁은 어깨선의 슬림한 실루엣 (여성적 핏에 최적)",
    neckWidth: 28,
    shoulderWidth: 120,
  },
  {
    id: "body_athletic",
    name: "스탠다드 핏 (Standard)",
    description: "균형 잡힌 깔끔한 프로선수 표준 체형",
    neckWidth: 36,
    shoulderWidth: 145,
  },
  {
    id: "body_broad",
    name: "브로드 핏 (Broad)",
    description: "다부진 목선과 떡 벌어진 당당한 어깨 체격",
    neckWidth: 44,
    shoulderWidth: 168,
  },
  {
    id: "body_bulk",
    name: "벌크 핏 (Bulk)",
    description: "두터운 승모근과 압도적인 프레임의 헤비급 근육질 체형",
    neckWidth: 54,
    shoulderWidth: 192,
  },
];

// 8가지 입술 컬러 팔레트
export interface LipColorOption {
  id: string;
  name: string;
  hex: string;
  shadowHex: string;
}

export const LIP_COLORS: LipColorOption[] = [
  { id: "lip_natural_nude", name: "내추럴 누드", hex: "#D68D7D", shadowHex: "#B86B5A" },
  { id: "lip_soft_rose", name: "소프트 로즈 핑크", hex: "#DE6B7E", shadowHex: "#BE4C5F" },
  { id: "lip_warm_coral", name: "웜 코랄", hex: "#E06D53", shadowHex: "#C04D33" },
  { id: "lip_peach_blossom", name: "피치 블러썸", hex: "#E88574", shadowHex: "#C86554" },
  { id: "lip_classic_red", name: "클래식 레드", hex: "#C92A42", shadowHex: "#9B1A2E" },
  { id: "lip_deep_burgundy", name: "딥 버건디 와인", hex: "#8A1C34", shadowHex: "#5E0F21" },
  { id: "lip_warm_brick", name: "웜 칠리 브릭", hex: "#AF4331", shadowHex: "#822B1C" },
  { id: "lip_cool_plum", name: "쿨 플럼 바이올렛", hex: "#A63A6E", shadowHex: "#77214B" },
];

// 12가지 헤어 컬러 팔레트
export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  highlightHex?: string;
}

export const HAIR_COLORS: ColorOption[] = [
  { id: "hair_midnight_black", name: "미드나잇 블랙", hex: "#1C1C24", highlightHex: "#38384D" },
  { id: "hair_dark_espresso", name: "다크 에스프레소", hex: "#2E1C14", highlightHex: "#4F3327" },
  { id: "hair_chestnut_brown", name: "체스넛 브라운", hex: "#4A2E1B", highlightHex: "#70482E" },
  { id: "hair_milk_tea", name: "밀크티 브라운", hex: "#8A664A", highlightHex: "#B38C6D" },
  { id: "hair_ash_gray", name: "애쉬 그레이", hex: "#6E727A", highlightHex: "#999EA8" },
  { id: "hair_platinum_silver", name: "플래티넘 실버", hex: "#CFD6DF", highlightHex: "#FFFFFF" },
  { id: "hair_champagne_blonde", name: "샴페인 블론드", hex: "#E8C882", highlightHex: "#FFF0B8" },
  { id: "hair_deep_navy", name: "딥 네이비", hex: "#1A2E4C", highlightHex: "#33558A" },
  { id: "hair_cyber_cyan", name: "사이버 사이언", hex: "#0E7490", highlightHex: "#22D3EE" },
  { id: "hair_electric_purple", name: "일렉트릭 퍼플", hex: "#581C87", highlightHex: "#A855F7" },
  { id: "hair_burgundy_crimson", name: "버건디 크림슨", hex: "#6B1D2F", highlightHex: "#B92B48" },
  { id: "hair_sunset_coral", name: "선셋 코랄", hex: "#C2410C", highlightHex: "#FB923C" },
];

// 8가지 눈동자 컬러
export const EYE_COLORS: ColorOption[] = [
  { id: "eye_obsidian", name: "흑요석 블랙", hex: "#18181B" },
  { id: "eye_dark_brown", name: "다크 브라운", hex: "#3B2219" },
  { id: "eye_hazel_amber", name: "헤이즐 앰버", hex: "#8C5824" },
  { id: "eye_sapphire_blue", name: "사파이어 블루", hex: "#2563EB" },
  { id: "eye_emerald_green", name: "에메랄드 그린", hex: "#059669" },
  { id: "eye_amethyst_violet", name: "자수정 바이올렛", hex: "#7C3AED" },
  { id: "eye_cool_gray", name: "쿨 그레이", hex: "#64748B" },
  { id: "eye_golden_sun", name: "골든 썬", hex: "#D97706" },
];

// 4종 얼굴형 (테이퍼드 -> 샤프 오벌 -> 라운드 -> 볼드 와이드)
export const FACE_SHAPES = [
  { id: "face_tapered", name: "테이퍼드 (날렵한 역삼각형)" },
  { id: "face_sharp_oval", name: "샤프 오벌 (갸름한 달걀형)" },
  { id: "face_rounded", name: "라운드 (부드러운 원형)" },
  { id: "face_bold_wide", name: "볼드 와이드 (듬직한 큰얼굴)" },
];

// 20종 성별 공용 헤어스타일
export const HAIR_STYLES = [
  { id: "hair_dandy", name: "댄디 컷 (정돈된 앞머리)" },
  { id: "hair_comma", name: "쉼표 머리 (e스포츠 시그니처)" },
  { id: "hair_two_block", name: "투블럭 숏 (깔끔한 숏컷)" },
  { id: "hair_undercut_slick", name: "언더컷 슬릭백 (올백형)" },
  { id: "hair_parted_perm", name: "가르마 펌 (자연스러운 웨이브)" },
  { id: "hair_see_through", name: "시스루 뱅 (가벼운 앞머리)" },
  { id: "hair_wolf_cut", name: "울프 컷 (힙한 텍스처)" },
  { id: "hair_tassel_bob", name: "태슬 밥 (칼단발)" },
  { id: "hair_medium_layered", name: "미디엄 레이어드 (중단발)" },
  { id: "hair_clean_crop", name: "크롭 컷 (짧고 스포티)" },
  { id: "hair_shaggy", name: "섀기 텍스처 (자유로운 결)" },
  { id: "hair_guile", name: "가일 컷 (반만 올린 스타일)" },
  { id: "hair_high_fade", name: "하이 탑 페이드 (모던 페이드)" },
  { id: "hair_short_waves", name: "숏 웨이브 펌 (컬감 있는 숏)" },
  { id: "hair_leaf_cut", name: "리프 컷 (자연스럽게 넘긴 머리)" },
  { id: "hair_high_ponytail", name: "하이 포니테일 (뒤로 묶음)" },
  { id: "hair_top_bun", name: "탑 번 (만두머리/상투)" },
  { id: "hair_side_part_formal", name: "사이드 파트 (신사적 가르마)" },
  { id: "hair_sporty_spiky", name: "스파이키 숏 (역동적인 헤어)" },
  { id: "hair_long_straight", name: "롱 스트레이트 (귀 뒤로 넘김)" },
];

// 12종 눈매 스타일
export const EYE_STYLES = [
  { id: "eye_sharp_almond", name: "샤프 아몬드 (날카로운 눈매)" },
  { id: "eye_confident_crisp", name: "컨피던트 (자신감 넘치는 또렷한 눈)" },
  { id: "eye_big_round", name: "빅 라운드 (크고 둥근 눈)" },
  { id: "eye_calm_crescent", name: "캄 크레센트 (차분한 반달눈)" },
  { id: "eye_gentle_droop", name: "젠틀 드룹 (처진 부드러운 눈)" },
  { id: "eye_charismatic_deep", name: "카리스마 딥 (짙고 강렬한 눈매)" },
  { id: "eye_focused_gamer", name: "포커스드 게이머 (집중하는 승부사 눈)" },
  { id: "eye_sleek_cat", name: "슬릭 캣츠아이 (도도하고 날렵한 눈)" },
  { id: "eye_intellectual", name: "인텔렉추얼 (지적이고 냉철한 눈)" },
  { id: "eye_champion_bold", name: "챔피언 볼드 (패기 넘치는 당당한 눈)" },
  { id: "eye_cool_chic", name: "쿨 시크 (무심한 듯 감각적인 눈)" },
  { id: "eye_artistic_soft", name: "아티스틱 (섬세한 눈매)" },
];

// 6종 눈썹 스타일
export const EYEBROW_STYLES = [
  { id: "brow_straight_bold", name: "직선 볼드 (짙은 일자 눈썹)" },
  { id: "brow_neat_arch", name: "니트 아치 (정돈된 부드러운 아치형)" },
  { id: "brow_sharp_angle", name: "샤프 앵글 (날렵한 각진 눈썹)" },
  { id: "brow_fine_soft", name: "파인 소프트 (자연스러운 얇은 눈썹)" },
  { id: "brow_heavy_intense", name: "헤비 인텐스 (강인하고 두꺼운 눈썹)" },
  { id: "brow_lifted_fierce", name: "업리프트 (끝이 올라간 패기 있는 눈썹)" },
];

// 6종 코 스타일
export const NOSE_STYLES = [
  { id: "nose_minimal_dot", name: "미니멀 도트 (심플한 점/그림자)" },
  { id: "nose_sharp_bridge", name: "샤프 브릿지 (오뚝한 직선)" },
  { id: "nose_soft_round", name: "소프트 라운드 (둥글고 귀여운 코)" },
  { id: "nose_sculpted_shadow", name: "스컬프티드 (입체 음영 코)" },
  { id: "nose_upturned", name: "업턴드 (살짝 들린 세련된 코)" },
  { id: "nose_prominent_high", name: "하이 브릿지 (강렬한 입체 콧대)" },
];

// 6종 입 스타일 / 표정
export const MOUTH_STYLES = [
  { id: "mouth_subtle_smile", name: "은은한 미소 (차분하고 긍정적인)" },
  { id: "mouth_confident_smirk", name: "자신만만한 입꼬리 (당당한 썩소)" },
  { id: "mouth_determined_closed", name: "단호한 앙다문 입 (진지한 결의)" },
  { id: "mouth_warm_grin", name: "활짝 웃는 입 (친근하고 밝은)" },
  { id: "mouth_focused_parted", name: "살짝 벌린 입 (게임에 몰입한)" },
  { id: "mouth_stern_frown", name: "냉철한 찌푸림 (엄격한 피드백 입매)" },
];

// 1. 눈 액세서리 (6종: 없음, 안경 3종, 선글라스, 뺨 반창고)
export const EYE_ACCESSORIES = [
  { id: "eye_acc_none", name: "없음 (None)" },
  { id: "eye_acc_horn_rim", name: "블랙 뿔테 안경 (스마트한 클래식)" },
  { id: "eye_acc_round_metal", name: "실버 메탈 라운드 안경 (트렌디 미니멀)" },
  { id: "eye_acc_clubmaster", name: "하금테 안경 (신뢰감 넘치는 전략가)" },
  { id: "eye_acc_sporty_shades", name: "스포티 선글라스 (스타일리시한)" },
  { id: "eye_acc_cheek_bandage", name: "뺨 반창고 (불굴의 승부사)" },
];

// 2. 입 액세서리 (6종: 없음, 깔끔한 콧수염, 소울패치, 친고티, 트리밍 쇼트, 와이드러프)
export const MOUTH_ACCESSORIES = [
  { id: "mouth_acc_none", name: "없음 (None)" },
  { id: "mouth_acc_neat_mustache", name: "깔끔한 콧수염 (단정한 클래식)" },
  { id: "mouth_acc_soul_patch", name: "소울패치 (아랫입술 밑 포인트)" },
  { id: "mouth_acc_chin_goatee", name: "친고티 (턱 끝 포인트 수염)" },
  { id: "mouth_acc_trimmed_short", name: "트리밍 쇼트 (정돈된 쇼트 비어드)" },
  { id: "mouth_acc_wide_rough", name: "와이드러프 (마초적 러프 비어드)" },
];

// 3. 귀 액세서리 (4종: 없음, 헤드셋, 이어셋, 링 피어싱)
export const EAR_ACCESSORIES = [
  { id: "ear_acc_none", name: "없음 (None)" },
  { id: "ear_acc_pro_headset", name: "헤드셋 (프로게이머 보이스챗)" },
  { id: "ear_acc_single_earpiece", name: "이어셋 (코칭 싱글 무전기)" },
  { id: "ear_acc_ring_piercing", name: "링 피어싱 (실버 링 & 피어싱)" },
];

// 4. 주름 (4종: 없음, 이마주름, 팔자주름, 종합주름)
export const WRINKLE_OPTIONS = [
  { id: "wrinkle_none", name: "없음 (매끈한 청년 피부)" },
  { id: "wrinkle_forehead", name: "이마주름 (이마 & 미간 라인)" },
  { id: "wrinkle_smile", name: "팔자주름 (입가 연륜 라인)" },
  { id: "wrinkle_full", name: "종합주름 (이마 + 미간 + 팔자 종합)" },
];

// 기본 아바타 생성 헬퍼
export function createDefaultAvatarDna(): AvatarDna {
  return {
    skinToneIndex: 2,          // 내추럴 아이보리
    faceShapeIndex: 0,         // 테이퍼드
    bodyTypeIndex: 1,          // 스탠다드 핏
    hairStyleIndex: 1,         // 쉼표 머리
    hairColorIndex: 0,         // 미드나잇 블랙
    eyeStyleIndex: 1,          // 컨피던트 눈
    eyeColorIndex: 1,          // 다크 브라운
    eyebrowIndex: 0,           // 짙은 일자
    noseStyleIndex: 0,         // 미니멀 도트
    mouthStyleIndex: 0,        // 은은한 미소
    lipColorIndex: 0,          // 내추럴 누드
    eyeAccessoryIndex: 0,      // 없음
    mouthAccessoryIndex: 0,    // 없음
    earAccessoryIndex: 0,      // 없음
    wrinkleIndex: 0,           // 없음
    outfitIndex: 0,            // 정장 수트 (감독 표준)
  };
}

// 랜덤 아바타 생성 헬퍼 (자연스러운 가중치 적용)
export function createRandomAvatarDna(): AvatarDna {
  const randInt = (max: number) => Math.floor(Math.random() * max);
  // 액세서리는 과도하게 겹치지 않도록 50% 확률로 '없음(0)'을 부여하고, 50% 확률로 1~(N-1) 중 선택
  const randAccessory = (max: number) =>
    Math.random() < 0.5 ? 0 : 1 + Math.floor(Math.random() * (max - 1));

  return {
    skinToneIndex: randInt(SKIN_TONES.length),
    faceShapeIndex: randInt(FACE_SHAPES.length),
    bodyTypeIndex: randInt(BODY_TYPES.length),
    hairStyleIndex: randInt(HAIR_STYLES.length),
    hairColorIndex: randInt(HAIR_COLORS.length),
    eyeStyleIndex: randInt(EYE_STYLES.length),
    eyeColorIndex: randInt(EYE_COLORS.length),
    eyebrowIndex: randInt(EYEBROW_STYLES.length),
    noseStyleIndex: randInt(NOSE_STYLES.length),
    mouthStyleIndex: randInt(MOUTH_STYLES.length),
    lipColorIndex: randInt(LIP_COLORS.length),
    eyeAccessoryIndex: randAccessory(EYE_ACCESSORIES.length),
    mouthAccessoryIndex: randAccessory(MOUTH_ACCESSORIES.length),
    earAccessoryIndex: randAccessory(EAR_ACCESSORIES.length),
    wrinkleIndex: randAccessory(WRINKLE_OPTIONS.length),
    outfitIndex: 0,
  };
}
