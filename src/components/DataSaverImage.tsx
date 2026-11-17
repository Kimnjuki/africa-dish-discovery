import { lighterImageUrl } from "@/lib/offlineStore";
import { useDataSaver } from "@/hooks/useDataSaver";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** When data-saver is on, skip remote images entirely unless already cached by SW. */
  hideOnSaver?: boolean;
  loading?: "lazy" | "eager";
};

/**
 * Recipe/media image that respects the data-saver preference:
 * lighter Unsplash URLs, optional hide, and lazy loading by default.
 */
export function DataSaverImage({
  src,
  alt,
  className,
  hideOnSaver = false,
  loading = "lazy",
}: Props) {
  const { dataSaver } = useDataSaver();
  const resolved = lighterImageUrl(src, dataSaver);

  if (!resolved || (dataSaver && hideOnSaver)) {
    return (
      <div
        className={cn("bg-muted flex items-center justify-center text-muted-foreground text-xs", className)}
        aria-label={alt}
        role="img"
      >
        {dataSaver ? "Image hidden (data saver)" : alt}
      </div>
    );
  }

  const srcSet = unsplashSrcSet(resolved);

  return (
    <img
      src={resolved}
      srcSet={srcSet}
      sizes={srcSet ? "(max-width: 768px) 100vw, 800px" : undefined}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      fetchPriority={dataSaver ? "low" : undefined}
    />
  );
}

function unsplashSrcSet(url: string): string | undefined {
  if (!url.includes("images.unsplash.com")) return undefined;
  try {
    return [480, 800, 1200]
      .map((width) => {
        const next = new URL(url);
        next.searchParams.set("w", String(width));
        next.searchParams.set("q", "70");
        next.searchParams.set("auto", "format");
        return `${next.toString()} ${width}w`;
      })
      .join(", ");
  } catch {
    return undefined;
  }
}
