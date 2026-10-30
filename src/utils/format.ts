export interface EokCurrencyParts {
  integer: string;   // 예: "0", "10", "4"
  decimal: string;   // 예: "45", "00", "80" (항상 소수점 2자리)
  unit: string;      // "억원"
  full: string;      // 예: "0.45억원", "10.00억원"
}

/**
 * 금액(원)을 소수점 둘째 자리 억 원 단위로 분할하여 반환
 * 최저 단위: 100만 원 (0.01억 원)
 * 예: 45,000,000 -> { integer: "0", decimal: "45", unit: "억원", full: "0.45억원" }
 * 예: 1,000,000,000 -> { integer: "10", decimal: "00", unit: "억원", full: "10.00억원" }
 */
export const formatEokParts = (amount: number): EokCurrencyParts => {
  const eokValue = (amount || 0) / 100_000_000;
  const fixed = eokValue.toFixed(2);
  const [integer, decimal] = fixed.split(".");
  return {
    integer,
    decimal,
    unit: "억원",
    full: `${fixed}억원`,
  };
};

/**
 * 억 원 단위 문자열 반환 (예: "0.45억원", "10.00억원")
 */
export const formatEok = (amount: number): string => {
  return formatEokParts(amount).full;
};

/**
 * 하위 호환용 통화 포맷터 (0.00억원 형태로 통일 표기)
 */
export const formatKoreanCurrency = (amount: number): string => {
  return formatEok(amount);
};

/**
 * 직관적인 한글 금액 표기 (예: 1,350,000,000 -> "13억 5,000만 원", 500,000,000 -> "5억 원", 85,000,000 -> "8,500만 원")
 */
export const formatKoreanMoney = (amount: number): string => {
  const absAmount = Math.abs(Math.round(amount || 0));
  if (absAmount === 0) return "0원";

  const totalMan = Math.round(absAmount / 10_000);
  const eok = Math.floor(totalMan / 10_000);
  const man = totalMan % 10_000;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`);
  if (man > 0) parts.push(`${man.toLocaleString()}만`);

  if (parts.length === 0) return `${absAmount.toLocaleString()}원`;
  return `${parts.join(" ")} 원`;
};

/**
 * 요약 보조 텍스트용 짧은 억 단위 표기 (예: 680,000,000 -> "6.8억", 500,000,000 -> "5.0억")
 */
export const formatShortEok = (amount: number): string => {
  const eok = (amount || 0) / 100_000_000;
  return `${eok.toFixed(1)}억`;
};
