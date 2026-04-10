import Header from "@/components/header";
import { OnboardingGuard } from "@/components/onboarding-guard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <div className="grid h-svh grid-rows-[auto_1fr]">
        <Header />
        {children}
      </div>
    </OnboardingGuard>
  );
}
