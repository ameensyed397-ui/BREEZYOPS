export function InfoCard({ icon: Icon, label, value, highlight }: {
  icon: React.ElementType; label: string; value: string; highlight?: boolean
}) {
  return (
    <div className={`rounded-md p-3 ${highlight ? "bg-primary/10" : "bg-secondary/40"}`}>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
        <Icon className="h-3 w-3" />{label}
      </div>
      <div className={`truncate text-sm ${highlight ? "text-lg font-semibold text-primary" : ""}`} title={value}>{value}</div>
    </div>
  );
}
