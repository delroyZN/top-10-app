"use client";

import { useState } from "react";
import type { ImageInfo } from "@/lib/schema";

function Placeholder({ rank, label }: { rank: number; label: string }) {
  return (
    <div
      role="img"
      aria-label={`No photo available for ${label}`}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#3a2a00,transparent_60%),linear-gradient(135deg,#1c1c25,#09090c)]"
    >
      <span aria-hidden className="absolute -top-6 -right-2 font-display text-[10rem] leading-none text-accent/10">
        {rank}
      </span>
      <span className="relative -mt-[15%] px-6 text-center font-display text-3xl uppercase leading-tight text-bone/70 sm:text-4xl">
        {label}
      </span>
    </div>
  );
}

/** The image itself. Falls back to a styled placeholder if it fails to load. */
export function ItemImage({
  image,
  rank,
  className = "",
  priority = false,
}: {
  image: ImageInfo;
  rank: number;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = image.provider === "placeholder" || !image.url || failed;

  return (
    <div className={`relative overflow-hidden bg-ink-3 ${className}`}>
      {showPlaceholder ? (
        <Placeholder rank={rank} label={image.alt} />
      ) : (
        // Plain <img>: Unsplash requires hotlinking their CDN URLs directly.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.url}
          alt={image.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

/** Credit and licence line. Required for both Wikimedia and Unsplash images. */
export function ImageCredit({ image, className = "" }: { image: ImageInfo; className?: string }) {
  if (image.provider === "placeholder") return null;
  const link = "underline decoration-mute/50 underline-offset-2 hover:text-bone";

  if (image.provider === "unsplash") {
    return (
      <p className={`text-xs text-mute ${className}`}>
        Photo by{" "}
        <a href={image.authorUrl} target="_blank" rel="noopener noreferrer" className={link}>
          {image.author}
        </a>{" "}
        on{" "}
        <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className={link}>
          Unsplash
        </a>
      </p>
    );
  }

  return (
    <p className={`line-clamp-2 text-xs text-mute ${className}`}>
      Image:{" "}
      <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className={link}>
        {image.author}
      </a>
      {" · "}
      {image.licenceUrl ? (
        <a href={image.licenceUrl} target="_blank" rel="noopener noreferrer" className={link}>
          {image.licence}
        </a>
      ) : (
        image.licence
      )}
      {" · via Wikimedia Commons"}
    </p>
  );
}
