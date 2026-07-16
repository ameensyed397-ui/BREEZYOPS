"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wind, Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session);
    });
  }, [supabase]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!password || password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDone(true);
    toast.success("Password reset successfully!");
    setTimeout(() => router.replace("/login"), 1500);
  }

  if (validSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 login-panel-left">
          <div className="login-orb login-orb--1" />
          <div className="login-orb login-orb--2" />
          <div className="login-orb login-orb--3" />
          <div className="login-grid" />
          <div className="login-edge" />
          <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white login-brand-content">
            <div className="login-logo-breathe mb-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-2">
            <Image src="/brand/doodle-breezyops.png" alt="Breezyops" width={340} height={340} className="rounded-xl" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Breezyops</h2>
            <p className="mt-3 text-base text-white/60 text-center max-w-xs leading-relaxed">Professional HVAC service operations, managed from one place.</p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="text-center space-y-4">
            <h1 className="text-xl font-bold">Invalid or expired link</h1>
            <p className="text-muted-foreground">Please request a new password reset link.</p>
            <Button onClick={() => router.replace("/login")}>Back to login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 login-panel-left">
        <div className="login-orb login-orb--1" />
        <div className="login-orb login-orb--2" />
        <div className="login-orb login-orb--3" />
        <div className="login-grid" />
        <div className="login-edge" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white login-brand-content">
          <div className="login-logo-breathe mb-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-2">
            <Image src="/brand/doodle-breezyops.png" alt="Breezyops" width={340} height={340} className="rounded-xl" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Breezyops</h2>
          <p className="mt-3 text-base text-white/60 text-center max-w-xs leading-relaxed">Professional HVAC service operations, managed from one place.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
              <Wind className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold">Breezy<span className="text-primary">ops</span></span>
          </div>

          {done ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold">Password updated</h1>
              <p className="text-muted-foreground">Redirecting you to login…</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Set new password</h1>
              <p className="text-muted-foreground mb-6">Choose a strong password for your account.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="new-password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="confirm-password" type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
