"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@pagelist/ui/components/button";
import {
  READER_GENRES,
  WRITER_GENRES,
} from "@/constants/genres";
import { useSession } from "@/hooks/use-auth";
import { useCompleteOnboarding } from "@/hooks/use-onboarding";
import { cn } from "@pagelist/ui/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { mutate: completeOnboarding, isPending } = useCompleteOnboarding();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  if (isSessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading04Icon} size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/signin");
    return null;
  }

  const isReader = session.user.role === "READER";
  const genres = isReader ? READER_GENRES : WRITER_GENRES;
  const title = isReader
    ? "What genres interest you?"
    : "What genres do you write?";
  const description = isReader
    ? "Select the genres you'd like to discover. You can update this anytime."
    : "Select the genres you write in. You can update this anytime.";

  function handleToggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  }

  function handleSubmit() {
    if (selectedGenres.length === 0) return;
    completeOnboarding(selectedGenres, {
      onSuccess: () => router.push("/"),
    });
  }

  return (
    <div className="min-h-screen bg-secondary py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-12 text-center animate-in fade-in duration-500">
          <h1
            className="mb-3 text-4xl font-light tracking-tight text-foreground"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            {title}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-card ring-1 ring-foreground/8 p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleToggleGenre(genre)}
                disabled={isPending}
                className={cn(
                  "rounded-xl border px-4 py-3 text-xs font-medium transition-all duration-200 disabled:opacity-50",
                  selectedGenres.includes(genre)
                    ? "border-[#D9A826] bg-[#D9A826]/8 text-[#161312]"
                    : "border-border text-muted-foreground hover:border-muted-foreground/50",
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {selectedGenres.length > 0 && (
          <div className="mb-8 animate-in fade-in duration-300">
            <p className="text-xs text-muted-foreground mb-3">
              Selected ({selectedGenres.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedGenres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center gap-1 rounded-full bg-[#D9A826]/12 px-3 py-1 text-xs font-medium text-[#161312]"
                >
                  {genre}
                  <button
                    onClick={() => handleToggleGenre(genre)}
                    className="ml-1 text-[#D9A826] hover:text-[#BF901D] transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <Button
          enabled={selectedGenres.length > 0 && !isPending}
          onClick={handleSubmit}
          disabled={selectedGenres.length === 0 || isPending}
          size="lg"
          className="w-full bg-[#D9A826] text-[#161312] hover:bg-[#BF901D]"
        >
          {isPending ? (
            <HugeiconsIcon icon={Loading04Icon} size={16} className="animate-spin" />
          ) : (
            `Continue to ${isReader ? "your library" : "your workspace"}`
          )}
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can update your preferences anytime in settings.
        </p>
      </div>
    </div>
  );
}
