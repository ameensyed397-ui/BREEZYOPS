"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Wind } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function sendOtp() {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("OTP sent to your phone.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wind className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold">Breezy<span className="text-primary">ops</span></span>
        </div>
        <h1 className="mb-1 text-lg font-medium">Sign in</h1>
        <p className="mb-4 text-sm text-muted-foreground">Team access only. Enter your phone to get a one-time code.</p>
        <Input placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="mb-3" />
        <Button className="w-full" onClick={sendOtp} disabled={sent}>
          {sent ? "Code sent" : "Send code"}
        </Button>
      </Card>
    </div>
  );
}
