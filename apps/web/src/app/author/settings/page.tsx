"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@pagelist/ui/components/button";
import { Input } from "@pagelist/ui/components/input";
import { Label } from "@pagelist/ui/components/label";
import { Textarea } from "@pagelist/ui/components/textarea";
import { Switch } from "@pagelist/ui/components/switch";
import { Separator } from "@pagelist/ui/components/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@pagelist/ui/components/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@pagelist/ui/components/tooltip";
import { PageHeader } from "@/components/ui/page-header";
import { DangerZone } from "@/components/ui/danger-zone";
import { toast } from "sonner";

export default function AuthorSettingsPage() {
  // Profile
  const [name, setName] = useState("Author Name");
  const [email] = useState("author@example.com");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Notifications
  const [notifySale, setNotifySale] = useState(true);
  const [notifyPayout, setNotifyPayout] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  const isOAuth = false;

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
      <PageHeader title="Settings" subtitle="Manage your author profile and account." />

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
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="border-[var(--color-brand-border)] bg-transparent" />
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
            <Input id="email" value={email} readOnly={isOAuth} className="border-[var(--color-brand-border)] bg-transparent" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio for your author profile…"
              rows={3}
              className="border-[var(--color-brand-border)] resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
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
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]">
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
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]">
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
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]">
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

      {/* Notifications */}
      <section className="space-y-5">
        <h2
          className="text-lg font-semibold text-[var(--color-brand-primary)]"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-brand-primary)]">Sale notifications</p>
              <p className="text-xs text-[var(--color-brand-muted)]">Get notified when someone buys your book.</p>
            </div>
            <Switch checked={notifySale} onCheckedChange={setNotifySale} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-brand-primary)]">Payout notifications</p>
              <p className="text-xs text-[var(--color-brand-muted)]">Get notified when a payout is processed.</p>
            </div>
            <Switch checked={notifyPayout} onCheckedChange={setNotifyPayout} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-brand-primary)]">Newsletter & updates</p>
              <p className="text-xs text-[var(--color-brand-muted)]">Receive product updates and tips.</p>
            </div>
            <Switch checked={notifyNewsletter} onCheckedChange={setNotifyNewsletter} />
          </div>
        </div>
      </section>

      <Separator className="bg-[var(--color-brand-border)]" />

      {/* Danger Zone */}
      <DangerZone
        description="Permanently delete your account, books, and all associated data. Readers who purchased your books will lose access."
        onConfirm={() => {
          toast.error("Account deletion not yet implemented.");
        }}
      />
    </div>
  );
}
