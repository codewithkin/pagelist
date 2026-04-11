"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { Separator } from "@pagelist/ui/components/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@pagelist/ui/components/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@pagelist/ui/components/tooltip";
import { PageHeader } from "@/components/ui/page-header";
import { DangerZone } from "@/components/ui/danger-zone";
import { toast } from "sonner";

export default function ReaderSettingsPage() {
  const [name, setName] = useState("Reader Name");
  const [email] = useState("reader@example.com");
  const [avatarUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const isOAuth = false; // TODO: determine from session

  async function handleSaveProfile() {
    setIsSavingProfile(true);
    try {
      // TODO: API call
      toast.success("Profile updated.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsSavingPassword(true);
    try {
      // TODO: API call
      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <PageHeader title="Settings" subtitle="Manage your account." />

      {/* Profile */}
      <section className="space-y-5">
        <h2
          className="text-lg font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Profile
        </h2>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-[var(--color-brand-primary)] text-white text-lg">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" className="rounded-full border-[var(--color-brand-border)]">
            Upload photo
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-[var(--color-brand-border)]"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="email">Email</Label>
              {isOAuth && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-[var(--color-brand-muted)] cursor-help">(read-only)</span>
                    </TooltipTrigger>
                    <TooltipContent>Email cannot be changed for OAuth accounts.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              id="email"
              value={email}
              readOnly={isOAuth}
              className="border-[var(--color-brand-border)]"
            />
          </div>
        </div>

        <Button
          onClick={handleSaveProfile}
          disabled={isSavingProfile}
          className="bg-black text-white rounded-full hover:bg-neutral-800"
        >
          {isSavingProfile && <Loader2 size={16} className="mr-2 animate-spin" />}
          Save Changes
        </Button>
      </section>

      <Separator className="bg-[var(--color-brand-border)]" />

      {/* Password */}
      {!isOAuth && (
        <>
          <section className="space-y-5">
            <h2
              className="text-lg font-semibold text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Password
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10 border-[var(--color-brand-border)] bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 border-[var(--color-brand-border)] bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 border-[var(--color-brand-border)] bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isSavingPassword || !currentPassword || !newPassword}
              className="bg-black text-white rounded-full hover:bg-neutral-800"
            >
              {isSavingPassword && <Loader2 size={16} className="mr-2 animate-spin" />}
              Update Password
            </Button>
          </section>

          <Separator className="bg-[var(--color-brand-border)]" />
        </>
      )}

      {/* Danger Zone */}
      <DangerZone
        description="Permanently delete your account and all data. This action cannot be undone."
        onConfirm={() => {
          // TODO: API call
          toast.error("Account deletion not yet implemented.");
        }}
      />
    </div>
  );
}
