/**
 * Referral system utilities for "جيب صاحبك" (Bring your friend)
 * Temporary system until 500 member capacity is reached.
 */

/**
 * Generates a unique referral code from the user's name.
 * Format: "FIRSTNAME-XXXX" where XXXX is 4 random alphanumeric chars.
 * Example: "SAMIH-A3X7"
 */
export function generateReferralCode(name: string): string {
  const firstName = name.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z\u0600-\u06FF]/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${firstName || "ATHR"}-${suffix}`;
}

/**
 * Returns the full referral link for a given code.
 */
export function getReferralLink(code: string): string {
  return `https://athrsa.org/en/signup?ref=${encodeURIComponent(code)}`;
}
