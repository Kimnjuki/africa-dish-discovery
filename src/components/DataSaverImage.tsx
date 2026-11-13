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

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      // Avoid speculative fetch priority when saving data
      fetchPriority={dataSaver ? "low" : undefined}
    />
  );
}
