// Team Uniform Color Palettes for League Management: Champions
// Full 150 Teams Signature Color Mapping (v7.4)

export interface TeamColorPalette {
  primary: string;    // 메인 유니폼 바디 컬러
  secondary: string;  // 카라, 어깨선, 악센트 라인 컬러
  accent: string;     // 엠블럼 / 포인트 하이라이트
}

// 5대 리그별 기본 디폴트 컬러
const LEAGUE_DEFAULT_COLORS: Record<string, TeamColorPalette> = {
  KCL: { primary: "#0F172A", secondary: "#0284C7", accent: "#38BDF8" }, // 딥 슬레이트 & 스카이블루
  CCL: { primary: "#18181B", secondary: "#DC2626", accent: "#FBBF24" }, // 오닉스 블랙 & 크림슨 레드/골드
  ECL: { primary: "#0F2027", secondary: "#203A43", accent: "#2C5364" }, // 유로 딥 청록/에메랄드
  ACL: { primary: "#1E1B4B", secondary: "#4338CA", accent: "#EC4899" }, // 아메리카 인디고 & 네온 핑크/바이올렛
  PCL: { primary: "#064E3B", secondary: "#059669", accent: "#34D399" }, // 퍼시픽 제이드 에메랄드 & 민트
};

// 150개 전 팀 시그니처 컬러 매핑
export const TEAM_COLORS: Record<string, TeamColorPalette> = {
  // =========================================================================
  // 1. KCL (한국 챔피언스 리그 — 30팀)
  // =========================================================================
    "KCL-001": { primary: "#4A0E17", secondary: "#D4AF37", accent: "#F3E5AB" }, // 서울 엠페러스 (임페리얼 버건디 & 엠페러 골드)
  "KCL-002": { primary: "#0C2340", secondary: "#0077C8", accent: "#B0D7FF" }, // 인천 그리핀즈 (하늘의 관문 네이비 & 스카이블루)
  "KCL-003": { primary: "#130A2A", secondary: "#6366F1", accent: "#38BDF8" }, // 대전 노바 (우주 초신성 코스믹 퍼플 & 일렉트릭 블루)
  "KCL-004": { primary: "#1E1B18", secondary: "#F59E0B", accent: "#FDE047" }, // 광주 라이트닝 (빛고을 썬더볼트 골드)
  "KCL-005": { primary: "#3F0A0A", secondary: "#EF4444", accent: "#F97316" }, // 대구 블레이즈 (화염의 블레이즈 레드 & 오렌지)
  "KCL-006": { primary: "#062828", secondary: "#0D9488", accent: "#2DD4BF" }, // 울산 레비아탄 (심해의 바다 레비아탄 틸)
  "KCL-007": { primary: "#0A192F", secondary: "#0284C7", accent: "#38BDF8" }, // 부산 트라이던트 (해양 수도 트라이던트 오션)
  "KCL-008": { primary: "#14213D", secondary: "#3B82F6", accent: "#F97316" }, // 제주 페가수스 (창공의 아주르 블루 & 한라봉 오렌지)
  "KCL-009": { primary: "#2E1065", secondary: "#8B5CF6", accent: "#10B981" }, // 세종 크라운 (왕실의 퍼플 크라운 & 궁중 비취)
  "KCL-010": { primary: "#14281D", secondary: "#64748B", accent: "#D97706" }, // 원주 호크스 (치악산 소나무 숲 그린 & 브론즈 골드)

    "KCL-011": { primary: "#0F2B5C", secondary: "#64748B", accent: "#F59E0B" }, // 수원 포르테 (로열 코발트 블루 & 화성 스톤 그레이)
  "KCL-012": { primary: "#18181B", secondary: "#10B981", accent: "#8B5CF6" }, // 성남 코어 (옵시디언 블랙 & 네온 민트/사이버 퍼플)
  "KCL-013": { primary: "#450A0A", secondary: "#D97706", accent: "#FDFBF7" }, // 청주 가디언즈 (딥 버건디 & 앤틱 골드)
  "KCL-014": { primary: "#1E1B4B", secondary: "#FBBF24", accent: "#F8FAFC" }, // 천안 이클립스 (딥 인디고 & 썬샤인 골드)
  "KCL-015": { primary: "#7F1D1D", secondary: "#F59E0B", accent: "#10B981" }, // 전주 피닉스 (전통 주홍 & 궁중 황금)
  "KCL-016": { primary: "#18181B", secondary: "#EA580C", accent: "#94A3B8" }, // 포항 타이탄즈 (카본 블랙 & 용광로 오렌지)
  "KCL-017": { primary: "#0F172A", secondary: "#EAB308", accent: "#64748B" }, // 창원 기어스 (하이테크 네이비 & 네온 옐로우)
  "KCL-018": { primary: "#064E3B", secondary: "#06B6D4", accent: "#F0FDFA" }, // 춘천 제이드 (옥빛 제이드 그린 & 호반 아쿠아)

    "KCL-019": { primary: "#022C22", secondary: "#D97706", accent: "#10B981" }, // 용인 드래곤즈 (에메랄드 그린 & 앤틱 골드)
  "KCL-020": { primary: "#0F172A", secondary: "#B45309", accent: "#94A3B8" }, // 아산 아머러스 (충무공 네이비 & 앤틱 브론즈)
  "KCL-021": { primary: "#2E1065", secondary: "#EC4899", accent: "#06B6D4" }, // 여수 오로라 (미드나잇 퍼플 & 네온 핑크/오션 시안)
  "KCL-022": { primary: "#09090B", secondary: "#06B6D4", accent: "#D946EF" }, // 구미 펄스 (젯 블랙 & 일렉트릭 블루/마젠타)
  "KCL-023": { primary: "#451A03", secondary: "#0284C7", accent: "#FDE68A" }, // 김해 팔콘즈 (가야 철기 브라운 & 스카이블루)
  "KCL-024": { primary: "#082F49", secondary: "#38BDF8", accent: "#FDE047" }, // 강릉 웨이브즈 (동해 딥 오션 & 서핑 폼 화이트)

    "KCL-025": { primary: "#1C1917", secondary: "#DC2626", accent: "#D97706" }, // 화성 랩터스 (챠콜 블랙 & 랩터 크림슨 레드)
  "KCL-026": { primary: "#29180C", secondary: "#DC2626", accent: "#F8FAFC" }, // 충주 아처스 (포레스트 우드 브라운 & 호국 주홍)
  "KCL-027": { primary: "#0C2340", secondary: "#D97706", accent: "#F8FAFC" }, // 군산 보야저스 (개항장 네이비 & 닻 골드)
  "KCL-028": { primary: "#3B0712", secondary: "#EAB308", accent: "#10B981" }, // 경주 나이츠 (신라 화랑 로열 크림슨 & 황금/비취)
  "KCL-029": { primary: "#0F172A", secondary: "#FACC15", accent: "#F8FAFC" }, // 진주 코멧츠 (코스믹 딥 네이비 & 스텔라 옐로우)
  "KCL-030": { primary: "#0A192F", secondary: "#0D9488", accent: "#2DD4BF" }, // 목포 노틸러스 (심해 딥 네이비 & 아쿠아 틸)

  // =========================================================================
  // 2. CCL (중국 챔피언스 리그 — 30팀)
  // =========================================================================
    "CCL-001": { primary: "#3B0808", secondary: "#D97706", accent: "#FDE68A" }, // 베이징 다이너스티 (황실 자금성 레드 & 제국 황금)
  "CCL-002": { primary: "#082F49", secondary: "#0284C7", accent: "#38BDF8" }, // 톈진 마리너스 (해양 항만 마린 블루 & 골드)
  "CCL-003": { primary: "#1E1E24", secondary: "#EC4899", accent: "#06B6D4" }, // 상하이 이터널 (미래도시 네온 핑크 & 사이버 시안)
  "CCL-004": { primary: "#18181B", secondary: "#F43F5E", accent: "#FBBF24" }, // 항저우 스파크 (일렉트릭 핑크 & 마젠타)
  "CCL-005": { primary: "#052E16", secondary: "#10B981", accent: "#38BDF8" }, // 선전 사이버 (하이테크 네온 그린 & 매트 블랙)
  "CCL-006": { primary: "#1C1917", secondary: "#D97706", accent: "#65A30D" }, // 광저우 램스 (브론즈 골드 & 올리브 그린)
  "CCL-007": { primary: "#4A0E17", secondary: "#D4AF37", accent: "#F8FAFC" }, // 우한 크레인즈 (선학 백색 & 황학루 크림슨 레드)
  "CCL-008": { primary: "#450A0A", secondary: "#EA580C", accent: "#FACC15" }, // 충칭 파이로 (마라 칠리 레드 & 마그마 오렌지)
  "CCL-009": { primary: "#18181B", secondary: "#10B981", accent: "#F8FAFC" }, // 청두 판다스 (판다 블랙/화이트 & 대나무 에메랄드)
  "CCL-010": { primary: "#1E293B", secondary: "#EAB308", accent: "#94A3B8" }, // 선양 팔라딘즈 (스틸 실버 & 임페리얼 옐로우)

    "CCL-011": { primary: "#022C22", secondary: "#10B981", accent: "#FACC15" }, // 칭다오 세일즈 (바다 에메랄드 & 칭다오 골드)
  "CCL-012": { primary: "#2E1065", secondary: "#F472B6", accent: "#A7F3D0" }, // 쑤저우 위버스 (비단 퍼플 & 실크 로즈 골드)
  "CCL-013": { primary: "#450A0A", secondary: "#D97706", accent: "#94A3B8" }, // 난징 기린즈 (주사 레드 & 황실 금색)
  "CCL-014": { primary: "#052E16", secondary: "#78350F", accent: "#F59E0B" }, // 푸저우 반얀즈 (포레스트 딥 그린 & 우드 바크 브라운)
  "CCL-015": { primary: "#0F172A", secondary: "#DC2626", accent: "#FBBF24" }, // 창사 스타즈 (미드나잇 블루 & 쇼비즈 레드/스타 골드)
  "CCL-016": { primary: "#18181B", secondary: "#EA580C", accent: "#94A3B8" }, // 정저우 센터스 (인더스트리얼 스틸 & 레일웨이 오렌지)
  "CCL-017": { primary: "#3B1A0A", secondary: "#D97706", accent: "#F59E0B" }, // 시안 레기온 (테라코타 병마용 브라운 & 황금)
  "CCL-018": { primary: "#0C2340", secondary: "#06B6D4", accent: "#38BDF8" }, // 다롄 돌핀즈 (돌핀 오션 블루 & 씨 폼 시안)

    "CCL-019": { primary: "#042F2E", secondary: "#06B6D4", accent: "#F8FAFC" }, // 지난 스프링스 (샘물 옥록색 & 스프링 시안)
  "CCL-020": { primary: "#0F172A", secondary: "#B45309", accent: "#38BDF8" }, // 닝보 앵커스 (항만 네이비 & 닻 브론즈)
  "CCL-021": { primary: "#082F49", secondary: "#38BDF8", accent: "#F8FAFC" }, // 샤먼 에그렛츠 (백로 화이트 & 아일랜드 오션 블루)
  "CCL-022": { primary: "#1E1B4B", secondary: "#6366F1", accent: "#22D3EE" }, // 허페이 퀀텀 (양자 사이버 인디고 & 퀀텀 시안)
  "CCL-023": { primary: "#064E3B", secondary: "#0284C7", accent: "#FACC15" }, // 쿤밍 피콕스 (공작 에메랄드 & 사파이어 블루)
  "CCL-024": { primary: "#0F172A", secondary: "#38BDF8", accent: "#E0F2FE" }, // 하얼빈 프로스트 (빙등제 딥 블루 & 크리스탈 프로스트)

    "CCL-025": { primary: "#1C1917", secondary: "#78716C", accent: "#EAB308" }, // 스좌장 록스 (태행산 스톤 그레이 & 철광석 브라운)
  "CCL-026": { primary: "#18181B", secondary: "#8B5CF6", accent: "#34D399" }, // 우시 젬스 (태호 보석 에메랄드 & 젬 퍼플)
  "CCL-027": { primary: "#451A03", secondary: "#D97706", accent: "#DC2626" }, // 포산 몽크스 (황비홍 무술 브론즈 & 샤오린 레드)
  "CCL-028": { primary: "#0F172A", secondary: "#EA580C", accent: "#FDE047" }, // 난창 호라이즌 (등왕각 노을 오렌지 & 강변 네이비)
  "CCL-029": { primary: "#022C22", secondary: "#06B6D4", accent: "#F8FAFC" }, // 구이양 클라우드 (빅데이터 고원 틸 & 클라우드 화이트)
  "CCL-030": { primary: "#062E1A", secondary: "#D97706", accent: "#FDE68A" }, // 창춘 타이거스 (백두산 딥그린 & 타이거 앰버 골드)

  // =========================================================================
  // 3. ECL (유럽-중동-아프리카 챔피언스 리그 — 30팀)
  // =========================================================================
    "ECL-001": { primary: "#0C1427", secondary: "#C5A059", accent: "#E5C887" }, // 런던 로열스 (로열 잉글리시 네이비 & 샴페인 골드)
  "ECL-002": { primary: "#031B4E", secondary: "#DC2626", accent: "#F8FAFC" }, // 파리 루미에르 (프렌치 트리콜로 블루/레드)
  "ECL-003": { primary: "#171717", secondary: "#525252", accent: "#DC2626" }, // 베를린 베어스 (모던 베를린 챠콜 & 크림슨)
  "ECL-004": { primary: "#7F1D1D", secondary: "#F59E0B", accent: "#FDE047" }, // 마드리드 마타도르스 (투우사의 정열 스패니시 레드/옐로)
  "ECL-005": { primary: "#052E16", secondary: "#0284C7", accent: "#EAB308" }, // 밀라노 바이퍼스 (비스콘티 독사 에메랄드 & 아주르 블루)
  "ECL-006": { primary: "#0B1E3D", secondary: "#EAB308", accent: "#38BDF8" }, // 스톡홀름 바이킹스 (스웨디시 로열 블루 & 바이킹 골드)
  "ECL-007": { primary: "#1C1917", secondary: "#B91C1C", accent: "#CBD5E1" }, // 모스크바 매머드 (시베리아 매머드 챠콜 & 루비 레드)
  "ECL-008": { primary: "#450A0A", secondary: "#0D9488", accent: "#FACC15" }, // 이스탄불 술탄즈 (오스만 크림슨 & 튀르키예 틸)
  "ECL-009": { primary: "#141E18", secondary: "#D97706", accent: "#10B981" }, // 리야드 미라지 (사막 골드 & 사우디 로열 그린)
  "ECL-010": { primary: "#1F1A12", secondary: "#EAB308", accent: "#0284C7" }, // 카이로 파라오스 (투탕카멘 황금 & 라피스라줄리 블루)

    "ECL-011": { primary: "#082F49", secondary: "#EA580C", accent: "#F8FAFC" }, // 암스테르담 어드미럴스 (더치 오렌지 & 해군 제독 네이비)
  "ECL-012": { primary: "#0A2540", secondary: "#DC2626", accent: "#F8FAFC" }, // 뮌헨 바바리안즈 (바이에른 다이아몬드 블루 & 전사 레드)
  "ECL-013": { primary: "#311042", secondary: "#D4AF37", accent: "#F8FAFC" }, // 빈 마에스트로스 (합스부르크 궁정 퍼플 & 마에스트로 골드)
  "ECL-014": { primary: "#4A0E17", secondary: "#0284C7", accent: "#FACC15" }, // 바르셀로나 아마다 (블라우그라나 버건디/블루 & 골드)
  "ECL-015": { primary: "#3B0808", secondary: "#94A3B8", accent: "#F8FAFC" }, // 바르샤바 후사르스 (윙드 후사르 크림슨 & 깃털 화이트/실버)
  "ECL-016": { primary: "#0A2540", secondary: "#FACC15", accent: "#38BDF8" }, // 키이우 발러 (우크라이나 스카이블루 & 골든 옐로우)
  "ECL-017": { primary: "#0A192F", secondary: "#D4AF37", accent: "#06B6D4" }, // 두바이 오아시스 (두바이 럭셔리 골드 & 사막 오아시스 블루)
  "ECL-018": { primary: "#18181B", secondary: "#F59E0B", accent: "#10B981" }, // 요하네스버그 골드 (남아공 황금빛 골드 & 다이아몬드 블랙)

    "ECL-019": { primary: "#18181B", secondary: "#EAB308", accent: "#FDE047" }, // 맨체스터 비즈 (산업혁명 워커비 옐로우 & 젯 블랙)
  "ECL-020": { primary: "#0F172A", secondary: "#D4AF37", accent: "#DC2626" }, // 취리히 볼트 (스위스 금고 골드 & 스위스 크로스 레드)
  "ECL-021": { primary: "#4A0E17", secondary: "#D97706", accent: "#94A3B8" }, // 로마 글래디에이터즈 (임페리얼 로만 레드 & 글래디에이터 브론즈)
  "ECL-022": { primary: "#042F2E", secondary: "#14B8A6", accent: "#F8FAFC" }, // 코펜하겐 세이렌즈 (북해 세이렌 씨그린 & 아쿠아 틸)
  "ECL-023": { primary: "#0A2540", secondary: "#38BDF8", accent: "#F8FAFC" }, // 텔아비브 비콘즈 (지중해 지온 블루 & 등대 비콘 화이트)
  "ECL-024": { primary: "#3B0712", secondary: "#059669", accent: "#D97706" }, // 카사블랑카 아틀라스 (모로칸 레드 & 아틀라스 그린)

    "ECL-025": { primary: "#022C22", secondary: "#10B981", accent: "#F59E0B" }, // 더블린 클로버스 (아일랜드 에메랄드 그린 & 클로버 골드)
  "ECL-026": { primary: "#0F172A", secondary: "#6366F1", accent: "#38BDF8" }, // 프랑크푸르트 넥서스 (금융 수도 사이버 네이비 & 넥서스 시안)
  "ECL-027": { primary: "#0A192F", secondary: "#0284C7", accent: "#D4AF37" }, // 아테네 아울즈 (아테나 올리브 골드 & 파르테논 마블 화이트)
  "ECL-028": { primary: "#082F49", secondary: "#38BDF8", accent: "#F8FAFC" }, // 헬싱키 노르드 (핀란드 극지 블루 & 백야 퓨어 화이트)
  "ECL-029": { primary: "#1C1917", secondary: "#F59E0B", accent: "#10B981" }, // 라고스 치타스 (사바나 치타 옐로우/블랙 & 그린)
  "ECL-030": { primary: "#7F1D1D", secondary: "#D4AF37", accent: "#F3E5AB" }, // 리스본 네비게이터스 (카민 와인 레드 & 로열 앤틱 골드)

  // =========================================================================
  // 4. ACL (아메리카 챔피언스 리그 — 30팀)
  // =========================================================================
    "ACL-001": { primary: "#0F172A", secondary: "#2563EB", accent: "#60A5FA" }, // 뉴욕 엠파이어 (맨해튼 엠파이어 블루 & 브로드웨이 골드)
  "ACL-002": { primary: "#1C1917", secondary: "#0284C7", accent: "#38BDF8" }, // 시카고 게일즈 (윈디 시티 스카이 블루 & 챠콜)
  "ACL-003": { primary: "#311042", secondary: "#D946EF", accent: "#F472B6" }, // LA 스타라이트 (할리우드 네온 스타라이트 & 바이올렛)
  "ACL-004": { primary: "#052E16", secondary: "#10B981", accent: "#F8FAFC" }, // 샌프란시스코 코드 (실리콘밸리 터미널 그린 & 코드 블랙)
  "ACL-005": { primary: "#0A192F", secondary: "#94A3B8", accent: "#F8FAFC" }, // 달라스 스탤리온즈 (론스타 네이비 & 카우보이 실버)
  "ACL-006": { primary: "#082F49", secondary: "#06B6D4", accent: "#F97316" }, // 마이애미 샤크스 (비스케인만 아쿠아 틸 & 선셋 오렌지)
  "ACL-007": { primary: "#450A0A", secondary: "#DC2626", accent: "#F8FAFC" }, // 토론토 메이플스 (캐나디안 메이플 레드 & 스노우 화이트)
  "ACL-008": { primary: "#022C22", secondary: "#DC2626", accent: "#EAB308" }, // 멕시코시티 이글스 (아즈텍 이글 그린 & 크림슨 레드)
  "ACL-009": { primary: "#141E18", secondary: "#F59E0B", accent: "#10B981" }, // 상파울루 재규어스 (아마존 재규어 옐로우/블랙 & 카나리아 그린)
  "ACL-010": { primary: "#082F49", secondary: "#38BDF8", accent: "#FACC15" }, // 부에노스아이레스 솔 (알비셀레스테 하늘색 & 5월의 태양 골드)

    "ACL-011": { primary: "#0C1427", secondary: "#DC2626", accent: "#D4AF37" }, // 보스턴 미닛멘 (미국 독립전쟁 네이비 & 패트리어트 레드/골드)
  "ACL-012": { primary: "#0F172A", secondary: "#B91C1C", accent: "#F8FAFC" }, // 워싱턴 센티넬스 (캐피톨 네이비 & 성조기 레드/화이트)
  "ACL-013": { primary: "#022C22", secondary: "#0D9488", accent: "#38BDF8" }, // 시애틀 스톰 (퍼시픽 노스웨스트 에메랄드 & 시애틀 틸)
  "ACL-014": { primary: "#14281D", secondary: "#D97706", accent: "#84CC16" }, // 애틀랜타 포레스트 (피치트리 딥 포레스트 그린 & 골드)
  "ACL-015": { primary: "#0B132B", secondary: "#F97316", accent: "#38BDF8" }, // 휴스턴 아폴로 (NASA 우주복 네이비 & 로켓 불꽃 오렌지)
  "ACL-016": { primary: "#082F49", secondary: "#10B981", accent: "#F8FAFC" }, // 밴쿠버 오르카스 (태평양 범고래 블랙 & 태평양 에메랄드)
  "ACL-017": { primary: "#3B1A0A", secondary: "#EAB308", accent: "#0284C7" }, // 보고타 콘도르스 (안데스 콘도르 골드 & 콜롬비아 삼색)
  "ACL-018": { primary: "#022C22", secondary: "#EAB308", accent: "#0284C7" }, // 리우데자네이루 삼바 (삼바 카니발 브라질 그린 & 골든 옐로우)

    "ACL-019": { primary: "#0F172A", secondary: "#B91C1C", accent: "#B45309" }, // 필라델피아 리버티 (자유의 종 브론즈 & 페이트리어트 블루)
  "ACL-020": { primary: "#18181B", secondary: "#DC2626", accent: "#F59E0B" }, // 라스베이거스 에이시스 (카지노 벨벳 블랙 & 칩 루비 레드)
  "ACL-021": { primary: "#29180C", secondary: "#EA580C", accent: "#94A3B8" }, // 오스틴 아웃로스 (텍사스 샌드 & 건메탈 그레이/선셋 오렌지)
  "ACL-022": { primary: "#0F172A", secondary: "#10B981", accent: "#EC4899" }, // 몬트리올 보레알리스 (오로라 보레알리스 에메랄드 & 네온 마젠타)
  "ACL-023": { primary: "#1E293B", secondary: "#EA580C", accent: "#FACC15" }, // 몬테레이 피크스 (시에라 록 인더스트리얼 스틸 & 선샤인 오렌지)
  "ACL-024": { primary: "#031B4E", secondary: "#DC2626", accent: "#F59E0B" }, // 산티아고 푸마스 (칠레 레드 & 블루 & 안데스 골든 탄)

    "ACL-025": { primary: "#18181B", secondary: "#DC2626", accent: "#94A3B8" }, // 디트로이트 엔진즈 (모터 시티 크롬 실버 & 머슬카 레이싱 레드)
  "ACL-026": { primary: "#271206", secondary: "#EA580C", accent: "#FACC15" }, // 피닉스 스코피언즈 (애리조나 선셋 코퍼 & 사막 샌드)
  "ACL-027": { primary: "#082F49", secondary: "#94A3B8", accent: "#F8FAFC" }, // 캘거리 울브즈 (알버타 빙하 블루 & 늑대 털 실버 그레이)
  "ACL-028": { primary: "#042F2E", secondary: "#06B6D4", accent: "#EA580C" }, // 과달라하라 아가베스 (블루 아가베 청록 & 테라코타 오렌지)
  "ACL-029": { primary: "#2A0845", secondary: "#EAB308", accent: "#06B6D4" }, // 리마 인카스 (잉카 제국 골드 & 안데스 터키석/황실 퍼플)
  "ACL-030": { primary: "#0F172A", secondary: "#38BDF8", accent: "#7DD3FC" }, // 몬테비데오 차루아스 (매트 블랙 & 라 셀레스테 스카이블루)

  // =========================================================================
  // 5. PCL (태평양 챔피언스 리그 — 30팀)
  // =========================================================================
    "PCL-001": { primary: "#18181B", secondary: "#DC2626", accent: "#FDE047" }, // 도쿄 사무라이즈 (사무라이 칠흑 & 에도 크림슨 레드)
  "PCL-002": { primary: "#14281D", secondary: "#EAB308", accent: "#FDE68A" }, // 오사카 워리어스 (오사카성 딥 그린 & 무사 골드)
  "PCL-003": { primary: "#0C2340", secondary: "#06B6D4", accent: "#67E8F9" }, // 타이베이 파일럿츠 (푸른 창공의 사이언 & 애비에이터 골드)
  "PCL-004": { primary: "#1E1E24", secondary: "#EC4899", accent: "#06B6D4" }, // 홍콩 네온즈 (빅토리아 하버 네온 핑크 & 사이버 시안)
  "PCL-005": { primary: "#042F2E", secondary: "#F472B6", accent: "#FACC15" }, // 호찌민 로터스 (연꽃 소프트 핑크 & 베트남 옐로우 스타)
  "PCL-006": { primary: "#0A2540", secondary: "#EAB308", accent: "#F8FAFC" }, // 방콕 엘리펀츠 (타이 사파이어 블루 & 사원 황금)
  "PCL-007": { primary: "#3B0808", secondary: "#DC2626", accent: "#F8FAFC" }, // 싱가포르 라이온즈 (싱가포르 크림슨 레드 & 퓨어 화이트)
  "PCL-008": { primary: "#1C1917", secondary: "#DC2626", accent: "#F59E0B" }, // 자카르타 가루다스 (가루다 골든 옐로우 & 화산 딥 레드)
  "PCL-009": { primary: "#042F2E", secondary: "#06B6D4", accent: "#FACC15" }, // 시드니 서퍼스 (본다이 비치 터키석 & 오스트레일리안 골드)
  "PCL-010": { primary: "#2E1065", secondary: "#F97316", accent: "#EAB308" }, // 뭄바이 메가스타즈 (인도 사프란 오렌지 & 볼리우드 골드/마젠타)

    "PCL-011": { primary: "#18181B", secondary: "#DC2626", accent: "#94A3B8" }, // 나고야 엑셀러레이터즈 (토요타 레이싱 레드 & 티타늄 크롬)
  "PCL-012": { primary: "#082F49", secondary: "#38BDF8", accent: "#F8FAFC" }, // 후쿠오카 제트 (아시아 관문 스카이블루 & 제트 스트림 화이트)
  "PCL-013": { primary: "#0F2B5C", secondary: "#F97316", accent: "#FACC15" }, // 가오슝 하버 (대만 해협 코발트 블루 & 컨테이너 오렌지)
  "PCL-014": { primary: "#052E16", secondary: "#D97706", accent: "#DC2626" }, // 하노이 터틀스 (호안끼엠 레이크 제이드 & 호국 황금)
  "PCL-015": { primary: "#042F2E", secondary: "#F43F5E", accent: "#FBBF24" }, // 마닐라 코랄스 (열대 산호 코랄 핑크 & 에메랄드 씨)
  "PCL-016": { primary: "#022C22", secondary: "#94A3B8", accent: "#EAB308" }, // 쿠알라룸푸르 타워스 (이슬라믹 에메랄드 & 페트로나스 실버)
  "PCL-017": { primary: "#0F172A", secondary: "#EAB308", accent: "#94A3B8" }, // 멜버른 에이펙스 (빅토리아 네이비 & 스피드 옐로우)
  "PCL-018": { primary: "#1E1B4B", secondary: "#EA580C", accent: "#06B6D4" }, // 벵갈루루 벡터 (인디언 테크 샤프 오렌지 & 사이버 인디고)

    "PCL-019": { primary: "#0F172A", secondary: "#EA580C", accent: "#F8FAFC" }, // 삿포로 폭시스 (북방여우 러스티 오렌지 & 스노우 퓨어 화이트)
  "PCL-020": { primary: "#022C22", secondary: "#EAB308", accent: "#DC2626" }, // 마카오 잭팟 (카지노 에메랄드 그린 & 잭팟 골드/루비)
  "PCL-021": { primary: "#1E293B", secondary: "#10B981", accent: "#F59E0B" }, // 다낭 마블스 (대리석 마블 그레이 & 베트남 씨 그린)
  "PCL-022": { primary: "#052E16", secondary: "#15803D", accent: "#F8FAFC" }, // 수라바야 크록스 (열대 맹그로브 그린 & 강철 티스 화이트)
  "PCL-023": { primary: "#09090B", secondary: "#94A3B8", accent: "#10B981" }, // 오클랜드 키위스 (올블랙 딥 블랙 & 실버 펀 화이트/제이드)
  "PCL-024": { primary: "#3B0808", secondary: "#D97706", accent: "#059669" }, // 뉴델리 코브라스 (인디언 샌드스톤 레드 & 코브라 골드)

    "PCL-025": { primary: "#18181B", secondary: "#D97706", accent: "#DC2626" }, // 교토 쇼군즈 (교토 칠기 블랙 & 황실 골드/단풍 크림슨)
  "PCL-026": { primary: "#0F2E1E", secondary: "#D97706", accent: "#94A3B8" }, // 타이중 레오파드 (옥산 포레스트 그린 & 구름표범 샌드 골드)
  "PCL-027": { primary: "#4A0E17", secondary: "#D4AF37", accent: "#10B981" }, // 치앙마이 로즈 (북방의 장미 벨벳 레드 & 란나 앤틱 골드)
  "PCL-028": { primary: "#0F172A", secondary: "#0284C7", accent: "#94A3B8" }, // 페낭 실리콘 (페낭 브릿지 블루 & 인텔 웨이퍼 실버)
  "PCL-029": { primary: "#3B0712", secondary: "#EAB308", accent: "#059669" }, // 브리즈번 캥거루스 (퀸즐랜드 마룬 & 선샤인 골드)
  "PCL-030": { primary: "#0B132B", secondary: "#7C3AED", accent: "#A78BFA" }, // 세부 템페스트 (열대 심해 블루 & 네온 바이올렛)
};

export function getTeamColors(teamId?: string | null, league?: string | null): TeamColorPalette {
  if (teamId && TEAM_COLORS[teamId]) {
    return TEAM_COLORS[teamId];
  }
  if (league && LEAGUE_DEFAULT_COLORS[league]) {
    return LEAGUE_DEFAULT_COLORS[league];
  }
  // 기본 중립 디폴트 (모던 사이버 e스포츠 팔레트)
  return {
    primary: "#0F172A",
    secondary: "#0284C7",
    accent: "#38BDF8",
  };
}
