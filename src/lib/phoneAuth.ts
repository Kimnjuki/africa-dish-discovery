/**
 * African phone number normalization for Supabase OTP auth (F10).
 */

export type PhoneCountry = {
  id: string;
  label: string;
  dial: string; // without +
  example: string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { id: "ke", label: "Kenya", dial: "254", example: "712 345 678" },
  { id: "ng", label: "Nigeria", dial: "234", example: "801 234 5678" },
  { id: "gh", label: "Ghana", dial: "233", example: "24 123 4567" },
  { id: "za", label: "South Africa", dial: "27", example: "82 123 4567" },
  { id: "tz", label: "Tanzania", dial: "255", example: "712 345 678" },
  { id: "ug", label: "Uganda", dial: "256", example: "712 345 678" },
  { id: "eg", label: "Egypt", dial: "20", example: "100 123 4567" },
  { id: "rw", label: "Rwanda", dial: "250", example: "788 123 456" },
];

/** Strip to digits only. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Convert local or international input into E.164 (+254…).
 */
export function toE164(localOrIntl: string, dialCode: string): string | null {
  let digits = digitsOnly(localOrIntl);
  if (!digits) return null;

  const dial = digitsOnly(dialCode);
  // Already includes country code
  if (digits.startsWith(dial) && digits.length >= dial.length + 7) {
    return `+${digits}`;
  }
  // Leading 00 international
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
    return digits.length >= 10 ? `+${digits}` : null;
  }
  // Drop trunk 0
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (digits.length < 7 || digits.length > 12) return null;
  return `+${dial}${digits}`;
}

export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}
