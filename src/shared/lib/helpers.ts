/**
 * Shared string/list helpers used across features.
 * Prefer adding here over one-off files unless the helper is feature-specific.
 */

/**
 * Split a sheet cell (or stored blob) into list items.
 * Supports newlines and inline bullets like "- Rule A - Rule B".
 * Strips leading bullets/numbers; drops empty / NA lines.
 */
export function splitSheetLines(value: string | undefined | null): string[] {
  if (!value) return [];

  const normalized = value
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    // Inline " - Next rule" (space-dash-space) → newline boundaries
    .replace(/\s+[-•*]\s+/g, "\n")
    // Leading bullet on a line
    .replace(/(?:^|\n)\s*[-•*]\s+/g, "\n");

  return normalized
    .split("\n")
    .map((line) => line.replace(/^\s*(?:\d+[.)])\s+/, "").trim())
    .filter((line) => {
      if (!line) return false;
      const lower = line.toLowerCase();
      return lower !== "na" && lower !== "n/a" && lower !== "-";
    });
}

export type ParsedWifiCell = {
  location?: string;
  network?: string;
  password?: string;
};

const NETWORK_LINE = /^(?:network\s*name|network)\s*:\s*(.*)$/i;
const PASSWORD_LINE = /^password\s*:\s*(.*)$/i;

/**
 * Parse a WIFI sheet cell into structured fields when labeled correctly.
 * Otherwise returns the original text as a single location blob (line breaks kept).
 */
export function parseWifiCell(value: string | undefined | null): ParsedWifiCell | undefined {
  if (!value) return undefined;

  const original = value.replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n").trim();
  if (!original) return undefined;

  let network: string | undefined;
  let password: string | undefined;
  const locationLines: string[] = [];

  for (const line of original.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const networkMatch = trimmed.match(NETWORK_LINE);
    if (networkMatch) {
      const extracted = networkMatch[1]?.trim();
      if (extracted) network = extracted;
      continue;
    }

    const passwordMatch = trimmed.match(PASSWORD_LINE);
    if (passwordMatch) {
      const extracted = passwordMatch[1]?.trim();
      if (extracted) password = extracted;
      continue;
    }

    locationLines.push(trimmed);
  }

  if (!network && !password) {
    return { location: original };
  }

  const location = locationLines.length > 0 ? locationLines.join("\n") : undefined;
  return {
    ...(location ? { location } : {}),
    ...(network ? { network } : {}),
    ...(password ? { password } : {}),
  };
}

const URL_IN_TEXT =
  /https?:\/\/[^\s<>"')\]]+/gi;

export type TextSegment = { type: "text" | "url"; value: string };

/** Split text into plain segments and URL segments for link rendering. */
export function linkifyTextSegments(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  const re = new RegExp(URL_IN_TEXT.source, URL_IN_TEXT.flags);
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) != null) {
    const start = match.index;
    if (start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, start) });
    }
    // Trim trailing punctuation commonly stuck to URLs
    let url = match[0] ?? "";
    while (/[.,;:!?)]$/.test(url)) {
      url = url.slice(0, -1);
    }
    if (url) {
      segments.push({ type: "url", value: url });
      lastIndex = start + url.length;
      re.lastIndex = lastIndex;
    } else {
      lastIndex = start + (match[0]?.length ?? 0);
    }
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}

