import { useState } from "react";
import { lighterImageUrl } from "@/lib/offlineStore";
import { imageSrcSet, optimizeImageUrl, IMAGE_PLACEHOLDER } from "@/lib/imageUrl";
import { useDataSaver } from "@/hooks/useDataSaver";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** When data-saver is on, skip remote images entirely unless already cached by SW. */
  hideOnSaver?: boolean;
  loading?: "lazy" | "eager";
  width?: number;
  sizes?: string;
};

/**
 * Recipe/media image that respects data-saver, uses safe CDN params,
 * and falls back to a placeholder when the remote URL fails (common on mobile).
 */
export function DataSaverImage({
  src,
  alt,
  className,
  hideOnSaver = false,
  loading = "lazy",
  width,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: Props) {
  const { dataSaver } = useDataSaver();
  const [failed, setFailed] = useState(false);

  const base = lighterImageUrl(src, dataSaver) || src;
  const resolved =
    !failed && base
      ? optimizeImageUrl(base, { width: width ?? (dataSaver ? 480 : 800), dataSaver })
      : null;

  if (!resolved || failed || (dataSaver && hideOnSaver)) {
    return (
      <img
        src={IMAGE_PLACEHOLDER}
        alt={alt}
        className={cn("object-cover bg-muted", className)}
        loading={loading}
        decoding="async"
      />
    );
  }

  const srcSet = imageSrcSet(base, dataSaver ? [320, 480] : [320, 640, 960]);

  return (
    <img
      src={resolved}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      fetchPriority={dataSaver ? "low" : undefined}
      onError={() => setFailed(true)}
    />
  );
}
