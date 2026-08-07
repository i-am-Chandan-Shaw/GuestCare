import { useState } from "react";
import { cn } from "@/lib/utils";

const AVATAR_TONES = [
  "bg-teal-600 text-white",
  "bg-rose-500 text-white",
  "bg-amber-500 text-white",
  "bg-indigo-500 text-white",
  "bg-sky-600 text-white",
  "bg-violet-500 text-white",
  "bg-emerald-600 text-white",
] as const;

const SIZE_CLASS = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-10 w-10 text-[12px]",
} as const;

export type AvatarSize = keyof typeof SIZE_CLASS;

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/** Stable color class from an id/name — shared by Avatar and portfolio thumbs. */
export function avatarToneClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0]!;
}

/**
 * Circular person avatar. Prefers `src` when available; otherwise shows initials.
 * Pass a stable `seed` (usually entity id) for consistent color.
 */
export function Avatar({
  name,
  src,
  seed,
  size = "md",
  className,
  title,
}: {
  name: string;
  /** Profile image URL when available; falls back to initials. */
  src?: string | null;
  /** Stable id for color hashing (defaults to name). */
  seed?: string;
  size?: AvatarSize;
  className?: string;
  /** Native tooltip; pass `null` to disable (e.g. when a custom tooltip is used). Defaults to `name`. */
  title?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(src) && !imageFailed;
  const initials = initialsFromName(name);
  const tone = avatarToneClass(seed ?? name);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold",
        SIZE_CLASS[size],
        !showImage && tone,
        className,
      )}
      title={title === undefined ? name : (title ?? undefined)}
      aria-hidden
    >
      {showImage ? (
        <img
          src={src!}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
