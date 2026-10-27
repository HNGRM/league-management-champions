export const AGING_TYPE_LABEL: Record<string, string> = {
  Early: "조기만개형",
  Normal: "표준형",
  Late: "대기만성형",
};

export const formatKoreanCurrency = (amount: number): string => {
  if (amount >= 100000000) {
    const eok = amount / 100000000;
    const formatted = Number.isInteger(eok)
      ? eok.toString()
      : eok.toFixed(1).replace(/\.0$/, "");
    return `${formatted}억`;
  }
  if (amount >= 10000) {
    const man = Math.round(amount / 10000);
    return `${man.toLocaleString()}만`;
  }
  return `${amount.toLocaleString()}원`;
};
