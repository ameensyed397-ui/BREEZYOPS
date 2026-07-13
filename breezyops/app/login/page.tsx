"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wind } from "lucide-react";
import { toast } from "sonner";

type Channel = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [channel, setChannel] = useState<Channel>("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"enter" | "verify">("enter");
  const [busy, setBusy] = useState(false);

  async function sendOtp() {
    if (!identifier) return toast.error("Enter your email or phone first.");
    setBusy(true);
    const { error } =
      channel === "email"
        ? await supabase.auth.signInWithOtp({ email: identifier })
        : await supabase.auth.signInWithOtp({ phone: identifier });
    setBusy(false);
    if (error) return toast.error(error.message);
    setStage("verify");
    toast.success(channel === "email" ? "Code sent to your email." : "Code sent to your phone.");
  }

  async function verifyOtp() {
    if (!code) return toast.error("Enter the code from your " + channel + ".");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp(
      channel === "email"
        ? { email: identifier, token: code, type: "email" }
        : { phone: identifier, token: code, type: "sms" }
    );
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in.");
    router.replace("/");
    router.refresh();
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
        <p className="mb-4 text-sm text-muted-foreground">Team access only. One-time code, no password.</p>

        {stage === "enter" && (
          <>
            <Tabs
              value={channel}
              onValueChange={(v) => { setChannel(v as Channel); setIdentifier(""); }}
              className="mb-3"
            >
              <TabsList className="w-full">
                <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
                <TabsTrigger value="phone" className="flex-1">Phone</TabsTrigger>
              </TabsList>
            </Tabs>
            <Input
              placeholder={channel === "email" ? "you@breezyair.co" : "+91 98765 43210"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mb-3"
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
            />
            <Button className="w-full" onClick={sendOtp} disabled={busy}>
              {busy ? "Sending…" : "Send code"}
            </Button>
          </>
        )}

        {stage === "verify" && (
          <>
            <p className="mb-3 text-sm">
              Enter the code sent to <span className="font-medium">{identifier}</span>.
            </p>
            <Input
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mb-3"
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
            />
            <Button className="w-full mb-2" onClick={verifyOtp} disabled={busy}>
              {busy ? "Verifying…" : "Verify & sign in"}
            </Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStage("enter")}>
              Use a different email or phone
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
