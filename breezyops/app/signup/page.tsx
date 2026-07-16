"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wind, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirmPassword) return toast.error("Passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);
    if (error) {
      if (error.message.includes("already registered")) {
        return toast.error("An account with this email already exists. Try logging in.");
      }
      return toast.error(error.message);
    }
    setSent(true);
    toast.success("Check your email to confirm your account.");
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

      {/* Right panel — signup form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
              <Wind className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold">Breezy<span className="text-primary">ops</span></span>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-muted-foreground">
                We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <Link href="/login">
                <Button variant="outline" className="mt-4">Back to login</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Create your account</h1>
              <p className="text-muted-foreground mb-6">Get started with Breezyops in seconds.</p>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@breezyops.co" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" autoFocus autoComplete="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="confirm-password" type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" autoComplete="new-password" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  Create account
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Breezyops. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
