# Book Cover Component System

## Overview

The `BookCover` component is a reusable, platform-agnostic component that handles book cover image display with automatic fallback to a premium placeholder when the image URL is missing or fails to load.

## Features

✅ **Automatic Image Validation**
- Validates if cover URL is provided and not `null` or `undefined`
- Automatically handles image load failures via `onError` event

✅ **Premium Placeholder Design**
- Elegant fallback design aligned with PageList design system
- Displays book icon + book title in a warm, editorial style
- Maintains consistent visual hierarchy with actual book covers

✅ **Platform Support**
- Web implementation uses Next.js `Image` component with optimization
- Native implementation uses React Native `Image` with NativeWind
- Same props interface across both platforms

✅ **Size Variants**
- `sm`: 48px (3:2 aspect ratio) - for order rows, auth callouts
- `md`: 128px (3:2 aspect ratio) - default for general use
- `lg`: 192px (3:2 aspect ratio) - for detailed book views

✅ **Graceful Error Handling**
- Loading state with blur effect (web only)
- OnError callback for custom handling if needed
- Smooth fallback to placeholder

## Usage

### Basic Usage

```tsx
import { BookCover } from '@pagelist/ui/components/book-cover';

<BookCover
  coverUrl={book.coverUrl}
  title={book.title}
  size="md"
/>
```

### With Custom Styling

```tsx
<BookCover
  coverUrl={book.coverUrl}
  title={book.title}
  size="lg"
  className="rounded-xl shadow-lg"
/>
```

### With Error Handling

```tsx
<BookCover
  coverUrl={book.coverUrl}
  title={book.title}
  onImageError={() => {
    console.log(`Failed to load cover for: ${book.title}`);
    trackImageError(book.id);
  }}
/>
```

### Custom Alt Text

```tsx
<BookCover
  coverUrl={book.coverUrl}
  title={book.title}
  alt={`Cover of ${book.title} by ${book.author}`}
/>
```

## Component Props

```typescript
interface BookCoverProps {
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
   * @default "md"
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
```

## Implementation Details

### File Structure

```
packages/ui/src/components/book-cover/
├── book-cover.types.ts     # Shared props interface
├── book-cover.web.tsx      # Next.js Image implementation
├── book-cover.native.tsx   # React Native implementation
└── index.ts                # Re-exports (resolver picks correct file)
```

### How It Works

1. **URL Validation**: Checks if `coverUrl` is provided and not null/undefined
2. **Image Loading**: Attempts to load image via `Image` component (web) or `Image` (native)
3. **Error Handling**: If image load fails, `imageError` state is set to `true`
4. **Fallback Render**: When image is not available, renders premium placeholder with:
   - Book icon (SVG on web, emoji on native)
   - Book title (line-clamped to 3 lines)
   - Premium color scheme from PageList design system

### Placeholder Design

The placeholder uses:
- **Colors**: Gradient surface from PageList palette
- **Typography**: Display serif font for editorialquality
- **Iconography**: Simple book icon with muted opacity
- **Layout**: Centered, flexbox with generous spacing

## Migration Guide

### From Manual Conditional Rendering

**Before:**
```tsx
{book.coverUrl ? (
  <Image src={book.coverUrl} alt={book.title} fill />
) : (
  <div>Placeholder content</div>
)}
```

**After:**
```tsx
<BookCover coverUrl={book.coverUrl} title={book.title} />
```

### Updated Files

The following files have been refactored to use `BookCover`:

1. ✅ `apps/web/src/components/ui/book-card.tsx` - Book grid cards
2. ✅ `apps/web/src/components/ui/book-preview-dialog.tsx` - Book preview modal
3. ✅ `apps/web/src/app/reader/orders/page.tsx` - Order history
4. ✅ `apps/web/src/app/(public-auth)/login/page.tsx` - Login auth callout
5. ✅ `apps/web/src/app/(public-auth)/signup/page.tsx` - Signup auth callout
6. ✅ `apps/web/src/app/author/books/page.tsx` - Author book management

## Future Enhancements

- [ ] Add image CDN optimization options
- [ ] Support for custom placeholder content
- [ ] Image blur-up loading strategy
- [ ] Retry logic for failed image loads
- [ ] Analytics for missing/failed book covers
