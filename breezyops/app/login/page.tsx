"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wind, Mail, Lock, Phone, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // Email+Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStage, setOtpStage] = useState<"enter" | "verify">("enter");
  const [otpBusy, setOtpBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (otpStage === "verify" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [otpStage]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      if (error.message.includes("Invalid login")) {
        return toast.error("Invalid email or password. Try again or use 'Forgot password'.");
      }
      return toast.error(error.message);
    }
    toast.success("Welcome back!");
    router.replace("/");
    router.refresh();
  }

  async function handleSendOtp() {
    if (!phone) return toast.error("Enter your phone number.");
    if (resendCooldown > 0) return toast.error(`Please wait ${resendCooldown}s before resending.`);
    setOtpBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setOtpBusy(false);
    if (error) {
      if (error.message.includes("rate") || error.message.includes("too many") || error.message.includes("For security")) {
        return toast.error("Too many attempts. Please wait a minute before trying again.");
      }
      return toast.error(error.message);
    }
    setOtpStage("verify");
    setResendCooldown(60);
    toast.success("OTP sent to your phone.");
  }

  async function handleVerifyOtp() {
    if (!otpCode) return toast.error("Enter the OTP code.");
    setOtpBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otpCode, type: "sms" });
    setOtpBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in!");
    router.replace("/");
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail) return toast.error("Enter your email.");
    setResetBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    setResetBusy(false);
    if (error) return toast.error(error.message);
    setResetSent(true);
    toast.success("Check your email for the reset link.");
  }

  // Forgot password view
  if (showForgot) {
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

        {/* Right panel — reset form */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <button onClick={() => { setShowForgot(false); setResetSent(false); }} className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to sign in
            </button>

            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Mail className="h-8 w-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-muted-foreground">We sent a password reset link to <span className="font-medium text-foreground">{resetEmail}</span></p>
                <Button variant="outline" onClick={() => { setShowForgot(false); setResetSent(false); }} className="mt-4">
                  Return to sign in
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-2">Reset password</h1>
                <p className="text-muted-foreground mb-6">Enter your email and we&apos;ll send you a reset link.</p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="reset-email" type="email" placeholder="you@breezyops.co" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="pl-10" autoFocus />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={resetBusy}>
                    {resetBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send reset link
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main login view
  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 login-panel-left">
        {/* Animated orbs */}
        <div className="login-orb login-orb--1" />
        <div className="login-orb login-orb--2" />
        <div className="login-orb login-orb--3" />
        {/* Subtle grid */}
        <div className="login-grid" />
        {/* Glowing edge */}
        <div className="login-edge" />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white login-brand-content">
          <div className="login-logo-breathe mb-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-2">
            <Image src="/brand/doodle-breezyops.png" alt="Breezyops" width={340} height={340} className="rounded-xl" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Breezyops</h2>
          <p className="mt-3 text-base text-white/60 text-center max-w-xs leading-relaxed">Professional HVAC service operations, managed from one place.</p>
          <div className="mt-8 flex gap-5 text-xs font-medium text-white/40 uppercase tracking-widest">
            <span>Leads</span>
            <span className="text-primary/60">·</span>
            <span>Jobs</span>
            <span className="text-primary/60">·</span>
            <span>Invoicing</span>
            <span className="text-primary/60">·</span>
            <span>AMC</span>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
              <Wind className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold">Breezy<span className="text-primary">ops</span></span>
          </div>

          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-6">Sign in to your operations dashboard.</p>

          <Tabs defaultValue="password" className="space-y-5">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="password" className="text-sm">
                <Lock className="mr-1.5 h-3.5 w-3.5" /> Email & Password
              </TabsTrigger>
              <TabsTrigger value="phone" className="text-sm">
                <Phone className="mr-1.5 h-3.5 w-3.5" /> Phone OTP
              </TabsTrigger>
            </TabsList>

            {/* Email + Password tab */}
            <TabsContent value="password">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@breezyops.co" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-primary hover:text-primary/80 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  Sign in
                </Button>
              </form>
            </TabsContent>

            {/* Phone OTP tab */}
            <TabsContent value="phone">
              {otpStage === "enter" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" onKeyDown={(e) => e.key === "Enter" && handleSendOtp()} />
                    </div>
                  </div>
                  <Button className="w-full h-11" onClick={handleSendOtp} disabled={otpBusy}>
                    {otpBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification code</Label>
                    <Input id="otp" ref={otpInputRef} placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()} maxLength={6} className="text-center text-lg tracking-[0.3em]" />
                  </div>
                  <Button className="w-full h-11" onClick={handleVerifyOtp} disabled={otpBusy}>
                    {otpBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify & sign in
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setOtpStage("enter"); setOtpCode(""); }} className="flex-1">
                      Change number
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleSendOtp} disabled={otpBusy || resendCooldown > 0} className="flex-1">
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend code"}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Breezyops. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
