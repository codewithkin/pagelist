export interface BookCoverProps {
  /**
   * The book cover URL. If null or invalid, a placeholder will be shown.
   */
  coverUrl: string | null | undefined;

  /**
   * The book title - used as alt text and in the placeholder
   */
  title: string;

  /**
   * Size variant for the cover
   */
  size?: "sm" | "md" | "lg";

  /**
   * Additional CSS class name (web) or NativeWind class string (native)
   */
  className?: string;

  /**
   * Optional alt text override
   */
  alt?: string;

  /**
   * Callback when image fails to load
   */
  onImageError?: () => void;
}
