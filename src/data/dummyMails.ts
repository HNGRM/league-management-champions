export interface MailItem {
  id: string;
  category: "필수" | "팀" | "경기" | "뉴스";
  sender: string;
  senderRole: string;
  title: string;
  content: string;
  dateStr: string;
  seasonYear: number;
  isRead: boolean;
  hasAction?: boolean; // 필수 액션 버튼(수락/거절 등) 유무
  actionType?: "ACCEPT_REJECT" | "CONTRACT_SIGN" | "CONFIRM";
  actionState?: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
}

export const INITIAL_MAILS: MailItem[] = [
  {
    id: "MAIL_001",
    category: "필수",
    sender: "서울 엠퍼러스",
    senderRole: "서울 엠퍼러스 단장",
    title: "주전 미드라이너 바이아웃 영입 제안서",
    content:
      "귀 팀의 주전 미드라이너 선수에게 바이아웃 2.50억 원을 지불하고 영입하고자 정식 제안서를 송부합니다.\n\n이적을 승인하실 경우 즉시 2.50억 원의 이적료가 팀 재정 계좌로 입금되며, 선수는 서울 엠퍼러스 소속으로 등록 변경됩니다.\n\n신중히 검토 후 최종 결정을 전달해 주시기 바랍니다.",
    dateStr: "D-2",
    seasonYear: 2026,
    isRead: false,
    hasAction: true,
    actionType: "ACCEPT_REJECT",
    actionState: "PENDING",
  },
  {
    id: "MAIL_002",
    category: "필수",
    sender: "넥서스 테크",
    senderRole: "팀 마케팅 팀장",
    title: "2026 시즌 메인 스폰서십 계약 서명 요청",
    content:
      "글로벌 IT 기업 '넥서스 테크'에서 2026 정규 시즌을 후원하는 연간 1.20억 원 규모의 메인 스폰서십 최종 계약안이 도착했습니다.\n\n계약 체결 시 1.20억 원의 스폰서 지원금이 즉시 팀 자금으로 입금되며, 이번 시즌 경기 유니폼 및 경기장 부스에 넥서스 테크 공식 브랜딩이 적용됩니다.\n\n감독님의 최종 서명을 요청드립니다.",
    dateStr: "어제",
    seasonYear: 2026,
    isRead: false,
    hasAction: true,
    actionType: "CONTRACT_SIGN",
    actionState: "PENDING",
  },
  {
    id: "MAIL_003",
    category: "필수",
    sender: "KCL 리그 사무국",
    senderRole: "KCL 경기운영위원회",
    title: "스프링 시즌 1군 공식 로스터 최종 제출 마감 안내",
    content:
      "2026 정규 시즌 개막을 앞두고 1군 로스터(주전 5인 및 후보 선수단) 최종 제출 마감 D-3일 전입니다.\n\n각 라인(TOP, JGL, MID, BOT, SUP)별 주전 선수가 정상 배정되어 있는지 최종 점검하시고 로스터 등록을 완료해 주십시오.\n\n미배정 라인이 존재할 경우 리그 개막전 경기 몰수패 처리될 수 있습니다.",
    dateStr: "D-3",
    seasonYear: 2026,
    isRead: false,
    hasAction: true,
    actionType: "CONFIRM",
    actionState: "PENDING",
  },
  {
    id: "MAIL_004",
    category: "팀",
    sender: "팀 메디컬 센터",
    senderRole: "수석 팀 닥터",
    title: "주전 탑라이너 경미한 손목 건염 진단서",
    content:
      "어제 야간 스크림(연습 경기) 도중 주전 탑라이너 선수가 오른쪽 손목 통증을 호소하여 정밀 검진을 진행했습니다.\n\n진단 결과 경미한 초기 손목 건염으로 확인되었으며, 악화를 방지하기 위해 향후 약 2주간 고강도 스크림 휴식 및 서브(후보) 탑라이너 기용을 권장합니다.\n\n현재 물리 치료와 컨디션 케어를 병행하고 있습니다.",
    dateStr: "3일 전",
    seasonYear: 2026,
    isRead: false,
  },
  {
    id: "MAIL_005",
    category: "팀",
    sender: "프런트 재무팀",
    senderRole: "재무 관리관",
    title: "1분기 팀 재정 결산 및 샐러리 캡 안전 리포트",
    content:
      "2026년 1분기 팀 재정 결산 결과 총 0.85억 원의 운영 흑자를 기록 중입니다.\n\n현재 선수단 및 코칭스태프 총 연봉 지출은 디비전 D 샐러리 캡 상한선 이내로 안전하게 통제되고 있으며, 스폰서십 유치 및 상품 판매 수익이 안정적으로 유입되고 있습니다.\n\n안정적인 팀 운영을 지속해 주시기 바랍니다.",
    dateStr: "4일 전",
    seasonYear: 2026,
    isRead: true,
  },
  {
    id: "MAIL_006",
    category: "팀",
    sender: "팀 프런트 에이전시",
    senderRole: "선수 계약 전담 매니저",
    title: "주전 서포터 잔여 계약 만료 3개월 전 알림",
    content:
      "주전 서포터 선수의 계약 기간이 이번 시즌을 끝으로 종료될 예정입니다.\n\n해당 선수는 팀 전력의 핵심 연결고리 역할을 맡고 있으므로, 시즌 종료 후 자유계약(FA) 시장으로 풀리기 전에 조기 재계약 협상 테이블을 마련할 것을 권장합니다.\n\n선수 측 대리인과의 사전 미팅 일정을 확인해 주십시오.",
    dateStr: "5일 전",
    seasonYear: 2026,
    isRead: true,
  },
  {
    id: "MAIL_007",
    category: "경기",
    sender: "전력 분석실",
    senderRole: "전력 분석 코치",
    title: "1주차 개막전 상대 '강릉 웨이브즈' 전술 분석 리포트",
    content:
      "개막전 맞대결 상대인 '강릉 웨이브즈'의 최근 스크림 데이터를 분석한 결과, 바텀 듀오 중심의 초반 스노우볼 전술을 강력하게 선호하는 것으로 파악되었습니다.\n\n밴픽 페이즈에서 상대 원거리 딜러의 1티어 주력 챔피언 견제가 필수적이며, 첫 번째 드래곤 교전 시 미드와 정글의 빠른 합류 라인을 설계해야 합니다.\n\n상세 전력 리포트는 전력 분석 탭에서도 열람 가능합니다.",
    dateStr: "6일 전",
    seasonYear: 2026,
    isRead: false,
  },
  {
    id: "MAIL_008",
    category: "경기",
    sender: "KCL 경기운영위원회",
    senderRole: "메타 밸런스 위원회",
    title: "2026 시즌 14.1 밸런스 패치 노트 핵심 요약 안내",
    content:
      "2026 정규 시즌 개막 버전인 14.1 패치가 적용되었습니다.\n\n주요 변경 사항:\n1. 원거리 딜러 포지션의 초반 기본 방어력 소폭 상향\n2. 주요 암살자 챔피언의 궁극기 재사용 대기시간 증가\n3. 상체 협곡의 전령 생성 타이밍 조정\n\n이에 따라 후반 지향형 하이퍼캐리 원딜과 안정적인 탱커 라인의 기용 가치가 급상승할 것으로 전망됩니다.",
    dateStr: "1주 전",
    seasonYear: 2026,
    isRead: true,
  },
  {
    id: "MAIL_009",
    category: "뉴스",
    sender: "e스포츠 데일리 뉴스",
    senderRole: "e스포츠 전문 기자단",
    title: "KCL 디비전 D 2026 시즌 미디어 데이 파워 랭킹 발표",
    content:
      "[e스포츠 데일리] 2026 KCL 디비전 D 미디어 데이에서 전문가 10인의 시즌 예측 파워 랭킹이 공개되었습니다.\n\n이번 시즌 디비전 D 우승 후보 1위로는 강력한 로스터를 구축한 '인천 그리핀즈'가 지목되었으며, 최하위 탈출 유력 후보로 우리 팀이 지목되어 다크호스로서의 잠재력을 높게 평가받았습니다.\n\n개막 초반 3경기의 기선 제압이 승격 레이스의 분수령이 될 것입니다.",
    dateStr: "1주 전",
    seasonYear: 2026,
    isRead: true,
  },
  {
    id: "MAIL_010",
    category: "뉴스",
    sender: "글로벌 e스포츠 브레이킹",
    senderRole: "글로벌 e스포츠 통신",
    title: "리그 A 대형 이적 성사: 역대 최고 이적료 50.00억 원 경신",
    content:
      "[글로벌 e스포츠] KCL 디비전 A의 디펜딩 챔피언 팀이 해외 리그의 특급 정글러를 바이아웃 이적료 50.00억 원에 전격 영입하며 올 시즌 완벽한 슈퍼팀 구성을 마쳤습니다.\n\n이번 메가 딜은 e스포츠 역사상 단일 선수 최고 이적료를 경신한 것으로, 이번 시즌 모든 디비전의 이적 시장 시세에 지대한 영향을 미칠 것으로 관측됩니다.",
    dateStr: "2주 전",
    seasonYear: 2025, // 이전 시즌 테스트 필터용
    isRead: true,
  },
];
