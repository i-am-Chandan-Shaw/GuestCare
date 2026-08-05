/** Stable checklist key for a verification item — must match protocol UI toggles. */
export function verificationId(issueId: string, index: number, text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${issueId}-v-${index}-${slug || "check"}`;
}
