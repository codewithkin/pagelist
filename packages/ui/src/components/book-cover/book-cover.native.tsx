import { useState } from "react";
import { View, Image, Text } from "react-native";
import { cn } from "../../lib/utils";
import type { BookCoverProps } from "./book-cover.types";

/**
 * BookCover component for native (React Native)
 * Displays a book cover with automatic fallback to a premium placeholder
 * if the image URL is missing or fails to load.
 */
export function BookCover({
  coverUrl,
  title,
  size = "md",
  className,
  alt,
  onImageError,
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false);

  // Determine container dimensions based on size variant
  const sizeClasses = {
    sm: "h-12 w-8",
    md: "h-48 w-32",
    lg: "h-80 w-48",
  };

  const hasValidImage = coverUrl && !imageError;

  const handleImageError = () => {
    setImageError(true);
    onImageError?.();
  };

  return (
    <View className={cn("relative overflow-hidden rounded-lg", sizeClasses[size], className)}>
      {hasValidImage ? (
        <Image
          source={{ uri: coverUrl }}
          className="h-full w-full"
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        // Fallback: solid brand background with centered title
        <View className="h-full w-full items-center justify-center bg-[var(--color-brand-primary)] p-4">
          <Text
            className="text-center text-sm font-medium leading-tight text-white/80"
            numberOfLines={3}
            style={{ fontFamily: "var(--font-display, 'Playfair Display'), serif" }}
          >
            {title}
          </Text>
        </View>
      )}
    </View>
  );
}
