"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-auth";
import { useOnboardingStatus } from "@/hooks/use-onboarding";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading04Icon } from "@hugeicons/core-free-icons";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { data: onboarding, isPending: isOnboardingLoading } = useOnboardingStatus();

  useEffect(() => {
    if (isSessionLoading || isOnboardingLoading) return;

    // If no session, redirect to signin
    if (!session?.user) {
      return;
    }

    // If onboarding not completed, redirect to onboarding
    if (onboarding && !onboarding.completed) {
      router.push("/onboarding");
    }
  }, [session, onboarding, isSessionLoading, isOnboardingLoading, router]);

  if (isSessionLoading || isOnboardingLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading04Icon} size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render children until we know onboarding is complete
  if (!onboarding?.completed) {
    return null;
  }

  return <>{children}</>;
}
