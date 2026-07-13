// Role helpers mirrored from the RLS policies in supabase/policies.sql.
// The DATABASE is the source of truth; these are for UI affordances only.
export type Role = "admin" | "ops" | "technician" | "b2b_manager" | "finance" | "viewer";

export const can = {
  seeCost: (r: Role) => r === "admin" || r === "finance",
  editPipeline: (r: Role) => r === "admin" || r === "ops" || r === "b2b_manager",
  triageLeads: (r: Role) => r === "admin" || r === "ops" || r === "b2b_manager",
  invoice: (r: Role) => r === "admin" || r === "finance" || r === "b2b_manager",
  broadcast: (r: Role) => r === "admin" || r === "ops" || r === "b2b_manager",
  admin: (r: Role) => r === "admin",
};
