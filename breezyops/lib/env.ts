import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  LEAD_WEBHOOK_SECRET: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

function validateEnv() {
  const clientResult = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!clientResult.success) {
    const missing = clientResult.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid public env vars: ${missing}. Check .env.local`);
  }
  const serverResult = serverSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    LEAD_WEBHOOK_SECRET: process.env.LEAD_WEBHOOK_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!serverResult.success) {
    const missing = serverResult.error.issues.map((i) => i.path.join(".")).join(", ");
    console.warn(`Warning: optional server env vars missing: ${missing}`);
  }
}

// Run once at module load
validateEnv();
