"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetBulkGrantJobQuery,
  useGrantPointsMutation,
  useGrantPointsToAllMutation,
  useGrantSubscriptionMutation,
  useGrantSubscriptionToAllMutation,
  useListBonusRecipientsQuery,
  useListBulkGrantJobsQuery,
  useListQuery,
  useRevokeMutation,
} from "@/hooks/use-bonuses-admin";
import {
  errorMessage,
  firstValue,
  formatDate,
  rowsFrom,
  text,
  makeIdempotencyKey,
} from "@/lib/api-shapes";

type RecipientPlan = "free" | "regular" | "vip" | "premium";
type GrantType = "points" | "subscription";
type Target = "selected" | "tier" | "all";
type Recipient = {
  id: string;
  username?: string;
  fullName?: string;
  email?: string;
  plan?: RecipientPlan;
  status?: string;
};

const inputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs outline-none focus:border-primary";
const buttonClass =
  "inline-flex h-8 items-center justify-center rounded-md border border-border px-2.5 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";
const primaryClass =
  "inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export default function BonusesAdmin() {
  const qc = useQueryClient();
  const [type, setType] = useState<GrantType>("points");
  const [target, setTarget] = useState<Target>("selected");
  const [recipientPlan, setRecipientPlan] = useState<RecipientPlan>("free");
  const [listPlan, setListPlan] = useState<"all" | RecipientPlan>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [points, setPoints] = useState("1000");
  const [plan, setPlan] = useState<"regular" | "vip" | "premium">("vip");
  const [days, setDays] = useState("7");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [revokeId, setRevokeId] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [jobId, setJobId] = useState("");

  const recipientsQuery = useListBonusRecipientsQuery<any>(
    { query: { page, limit: 50, ...(search.trim() ? { search: search.trim() } : {}) } },
    { refetchInterval: 60_000 },
  );
  const jobs = useListBulkGrantJobsQuery<any>(
    { query: { limit: "20" } },
    { refetchInterval: 15_000 },
  );
  const history = useListQuery<any>(
    { query: { page: 1, limit: 30 } },
    { refetchInterval: 30_000 },
  );
  const jobDetail = useGetBulkGrantJobQuery<any>({ path: { id: jobId } }, { enabled: Boolean(jobId) });
  const grantPoints = useGrantPointsMutation<any>();
  const grantSubscription = useGrantSubscriptionMutation<any>();
  const grantPointsAll = useGrantPointsToAllMutation<any>();
  const grantSubscriptionAll = useGrantSubscriptionToAllMutation<any>();
  const revoke = useRevokeMutation<any>();

  const recipientRows = rowsFrom(recipientsQuery.data, ["items", "users", "results", "data"]) as Recipient[];
  const visibleRecipients = useMemo(
    () => listPlan === "all" ? recipientRows : recipientRows.filter((u) => u.plan === listPlan),
    [recipientRows, listPlan],
  );
  const jobRows = rowsFrom(jobs.data, ["items", "jobs", "results", "data"]);
  const historyRows = rowsFrom(history.data, ["items", "bonuses", "records", "results", "data"]);
  const recipientTotal = Number(firstValue(recipientsQuery.data, ["total", "count"]) ?? 0);
  const recipientPages = Math.max(1, Number(firstValue(recipientsQuery.data, ["totalPages", "pages"]) ?? Math.ceil(recipientTotal / 50)));
  const pending =
    grantPoints.isPending ||
    grantSubscription.isPending ||
    grantPointsAll.isPending ||
    grantSubscriptionAll.isPending;

  function toggleRecipient(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function selectVisible() {
    const ids = visibleRecipients.map((u) => u.id).filter(Boolean);
    setSelected((current) => {
      const allSelected = ids.length > 0 && ids.every((id) => current.includes(id));
      return allSelected ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])];
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanReason = reason.trim();
    if (cleanReason.length < 3) return setError("Enter a reason.");
    if (target === "selected" && selected.length === 0) return setError("Select at least one user.");

    try {
      const idempotencyKey = makeIdempotencyKey("bonus");
      if (type === "points") {
        const value = Math.floor(Number(points));
        if (!Number.isFinite(value) || value <= 0) return setError("Enter valid points.");
        if (target === "selected" && selected.length === 1) {
          await grantPoints.mutateAsync({ body: { userId: selected[0], points: value, reason: cleanReason, idempotencyKey } });
        } else {
          await grantPointsAll.mutateAsync({
            body: {
              points: value,
              reason: cleanReason,
              idempotencyKey,
              ...(target === "selected" ? { userIds: selected } : {}),
              ...(target === "tier" ? { recipientPlan } : {}),
            },
          });
        }
      } else {
        const durationDays = Math.floor(Number(days));
        if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 365) return setError("Enter a duration from 1 to 365 days.");
        if (target === "selected" && selected.length === 1) {
          await grantSubscription.mutateAsync({
            body: { userId: selected[0], plan, durationDays, reason: cleanReason, idempotencyKey },
          });
        } else {
          await grantSubscriptionAll.mutateAsync({
            body: {
              plan,
              durationDays,
              reason: cleanReason,
              idempotencyKey,
              ...(target === "selected" ? { userIds: selected } : {}),
              ...(target === "tier" ? { recipientPlan } : {}),
            },
          });
        }
      }
      setMessage(target === "selected" && selected.length === 1 ? "Grant completed." : "Grant queued.");
      setReason("");
      if (target === "selected") setSelected([]);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["bonuses-admin"] }),
        jobs.refetch(),
        history.refetch(),
      ]);
    } catch (e) {
      setError(errorMessage(e, "Unable to grant bonus."));
    }
  }

  async function revokeGrant() {
    if (!revokeId || revokeReason.trim().length < 3) {
      setError("Enter a revocation reason.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await revoke.mutateAsync({ path: { id: revokeId }, body: { reason: revokeReason.trim() } });
      setMessage("Grant revoked.");
      setRevokeId("");
      setRevokeReason("");
      await qc.invalidateQueries({ queryKey: ["bonuses-admin"] });
      await history.refetch();
    } catch (e) {
      setError(errorMessage(e, "Unable to revoke grant."));
    }
  }

  return (
    <main className="mx-auto max-w-[1450px] space-y-3 px-3 py-3 sm:px-4">
      <header className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <h1 className="text-base font-semibold tracking-tight">Bonuses</h1>
          <p className="text-[11px] text-muted-foreground">Administer points and subscription access</p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground">
          {recipientTotal.toLocaleString()} users
        </span>
      </header>

      {(message || error) && (
        <div role={error ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-xs ${error ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-emerald-600/20 bg-emerald-600/5 text-emerald-700"}`}>
          <div className="flex items-center justify-between gap-3">
            <span>{error || message}</span>
            <button type="button" className="text-[10px] underline" onClick={() => { setError(""); setMessage(""); }}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <h2 className="text-xs font-semibold">Users</h2>
            <span className="text-[10px] text-muted-foreground">{selected.length} selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-2">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search username or email"
              className={`${inputClass} min-w-[170px] flex-1`}
            />
            <select value={listPlan} onChange={(e) => setListPlan(e.target.value as typeof listPlan)} className={`${inputClass} w-[115px]`}>
              <option value="all">All tiers</option>
              <option value="free">Free</option>
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
              <option value="premium">Premium</option>
            </select>
            <button type="button" className={buttonClass} onClick={selectVisible}>Toggle page</button>
          </div>
          <div className="max-h-[370px] overflow-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
                <tr>
                  <th className="w-8 px-2 py-2"></th>
                  <th className="px-2 py-2 font-medium">User</th>
                  <th className="px-2 py-2 font-medium">Email</th>
                  <th className="px-2 py-2 font-medium">Tier</th>
                </tr>
              </thead>
              <tbody>
                {recipientsQuery.isLoading ? (
                  <tr><td colSpan={4} className="px-3 py-5 text-center text-muted-foreground">Loading…</td></tr>
                ) : visibleRecipients.length ? visibleRecipients.map((user) => (
                  <tr key={user.id} className="border-t border-border/70 hover:bg-muted/30">
                    <td className="px-2 py-1.5">
                      <input aria-label={`Select ${user.username || user.email}`} type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleRecipient(user.id)} />
                    </td>
                    <td className="max-w-[150px] px-2 py-1.5">
                      <div className="truncate font-medium">{user.username || user.fullName || "—"}</div>
                      {user.username && user.fullName && <div className="truncate text-[10px] text-muted-foreground">{user.fullName}</div>}
                    </td>
                    <td className="max-w-[220px] truncate px-2 py-1.5 text-muted-foreground">{user.email || "—"}</td>
                    <td className="px-2 py-1.5"><TierBadge plan={user.plan || "free"} /></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-3 py-5 text-center text-muted-foreground">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <span className="text-[10px] text-muted-foreground">Page {page} of {recipientPages}</span>
            <div className="flex gap-1">
              <button type="button" className={buttonClass} disabled={page <= 1} onClick={() => setPage((v) => v - 1)}>Previous</button>
              <button type="button" className={buttonClass} disabled={page >= recipientPages} onClick={() => setPage((v) => v + 1)}>Next</button>
            </div>
          </div>
        </section>

        <section className="h-fit rounded-lg border border-border bg-card">
          <div className="border-b border-border px-3 py-2"><h2 className="text-xs font-semibold">Grant bonus</h2></div>
          <form onSubmit={submit} className="space-y-3 p-3">
            <div className="grid grid-cols-2 gap-1 rounded-md bg-muted/60 p-1">
              <Segment active={type === "points"} onClick={() => setType("points")}>Bet Lab points</Segment>
              <Segment active={type === "subscription"} onClick={() => setType("subscription")}>Subscription</Segment>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Segment active={target === "selected"} onClick={() => setTarget("selected")}>Selected</Segment>
              <Segment active={target === "tier"} onClick={() => setTarget("tier")}>By tier</Segment>
              <Segment active={target === "all"} onClick={() => setTarget("all")}>All users</Segment>
            </div>
            {target === "selected" ? (
              <div className="flex items-center justify-between rounded-md border border-border px-2.5 py-2 text-[11px]">
                <span>{selected.length} recipients</span>
                <button type="button" className="text-primary underline" onClick={() => setSelected([])}>Clear</button>
              </div>
            ) : target === "tier" ? (
              <label className="block text-[11px] font-medium">Recipient tier
                <select value={recipientPlan} onChange={(e) => setRecipientPlan(e.target.value as RecipientPlan)} className={`${inputClass} mt-1`}>
                  <option value="free">Free</option><option value="regular">Regular</option><option value="vip">VIP</option><option value="premium">Premium</option>
                </select>
              </label>
            ) : null}
            {type === "points" ? (
              <label className="block text-[11px] font-medium">Points
                <input type="number" min="1" step="1" value={points} onChange={(e) => setPoints(e.target.value)} className={`${inputClass} mt-1`} required />
              </label>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-[11px] font-medium">Entitlement
                  <select value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)} className={`${inputClass} mt-1`}>
                    <option value="regular">Regular</option><option value="vip">VIP</option><option value="premium">Premium</option>
                  </select>
                </label>
                <label className="block text-[11px] font-medium">Duration (days)
                  <input type="number" min="1" max="365" step="1" value={days} onChange={(e) => setDays(e.target.value)} className={`${inputClass} mt-1`} required />
                </label>
              </div>
            )}
            <label className="block text-[11px] font-medium">Reason
              <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Reason for grant" className={`${inputClass} mt-1`} required />
            </label>
            <button type="submit" disabled={pending} className={`${primaryClass} w-full`}>
              {pending ? "Submitting…" : target === "selected" && selected.length === 1 ? "Grant bonus" : "Queue grant"}
            </button>
          </form>
        </section>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2 className="text-xs font-semibold">Bulk jobs</h2>
          <button type="button" className="text-[10px] text-primary underline" onClick={() => jobs.refetch()}>Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-[11px]">
            <thead className="bg-muted/50 text-muted-foreground"><tr>{["Status", "Type", "Progress", "Granted", "Failed", "Created", ""].map((v) => <th key={v} className="px-2.5 py-2 font-medium">{v}</th>)}</tr></thead>
            <tbody>
              {jobs.isLoading ? <tr><td colSpan={7} className="px-3 py-4 text-muted-foreground">Loading…</td></tr> : jobRows.length ? jobRows.map((row, i) => {
                const id = text(firstValue(row, ["_id", "id"]), String(i));
                const progress = Number(row.progressPercent ?? 0);
                return <tr key={id} className="border-t border-border/70">
                  <td className="px-2.5 py-2"><StatusBadge value={text(row.status)} /></td>
                  <td className="px-2.5 py-2">{text(row.type).replaceAll("_", " ")}</td>
                  <td className="px-2.5 py-2"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div><span>{text(row.processedUsers, "0")}/{text(row.totalUsers, "0")}</span></div></td>
                  <td className="px-2.5 py-2">{text(row.grantedCount, "0")}</td>
                  <td className="px-2.5 py-2">{text(row.failedCount, "0")}</td>
                  <td className="whitespace-nowrap px-2.5 py-2">{formatDate(row.createdAt)}</td>
                  <td className="px-2.5 py-2"><button type="button" className="text-primary underline" onClick={() => setJobId(id)}>Details</button></td>
                </tr>;
              }) : <tr><td colSpan={7} className="px-3 py-4 text-muted-foreground">No jobs.</td></tr>}
            </tbody>
          </table>
        </div>
        {jobId && (
          <div className="border-t border-border bg-muted/20 p-3">
            <div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-semibold">Job details</h3><button type="button" className="text-[10px] underline" onClick={() => setJobId("")}>Close</button></div>
            {jobDetail.isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : (
              <div className="grid gap-2 text-[11px] sm:grid-cols-3">
                <Detail label="Progress" value={`${text(jobDetail.data?.processedUsers, "0")} / ${text(jobDetail.data?.totalUsers, "0")}`} />
                <Detail label="Started" value={formatDate(jobDetail.data?.startedAt)} />
                <Detail label="Completed" value={formatDate(jobDetail.data?.completedAt)} />
                <Detail label="Recipient tier" value={text(jobDetail.data?.recipientPlan, "All eligible")} />
                <Detail label="Recent errors" value={Array.isArray(jobDetail.data?.recentErrors) ? jobDetail.data.recentErrors.join(" · ") || "None" : "None"} />
              </div>
            )}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2 className="text-xs font-semibold">Recent grants</h2>
          <button type="button" className="text-[10px] text-primary underline" onClick={() => history.refetch()}>Refresh</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[11px]">
            <thead className="bg-muted/50 text-muted-foreground"><tr>{["Type", "User", "Value", "Status", "Reason", "Created", "Action"].map((v) => <th key={v} className="px-2.5 py-2 font-medium">{v}</th>)}</tr></thead>
            <tbody>
              {history.isLoading ? <tr><td colSpan={7} className="px-3 py-4 text-muted-foreground">Loading…</td></tr> : historyRows.length ? historyRows.map((row, i) => {
                const id = text(firstValue(row, ["_id", "id"]), String(i));
                const userId = typeof row.userId === "object" ? text(firstValue(row.userId, ["username", "email", "_id"])) : text(row.userId);
                const value = row.type === "SUBSCRIPTION" ? `${text(row.plan)} · ${text(row.durationDays)}d` : `${text(row.points)} pts`;
                return <tr key={id} className="border-t border-border/70">
                  <td className="px-2.5 py-2">{text(row.type).replaceAll("_", " ")}</td>
                  <td className="max-w-[170px] truncate px-2.5 py-2" title={userId}>{userId}</td>
                  <td className="whitespace-nowrap px-2.5 py-2">{value}</td>
                  <td className="px-2.5 py-2"><StatusBadge value={text(row.status)} /></td>
                  <td className="max-w-[200px] truncate px-2.5 py-2" title={text(row.reason)}>{text(row.reason)}</td>
                  <td className="whitespace-nowrap px-2.5 py-2">{formatDate(row.createdAt)}</td>
                  <td className="px-2.5 py-2">{row.status === "GRANTED" ? <button type="button" className="text-destructive underline" onClick={() => { setRevokeId(id); setRevokeReason(""); }}>Revoke</button> : "—"}</td>
                </tr>;
              }) : <tr><td colSpan={7} className="px-3 py-4 text-muted-foreground">No grants.</td></tr>}
            </tbody>
          </table>
        </div>
        {revokeId && (
          <div className="flex flex-wrap items-end gap-2 border-t border-border bg-muted/20 p-3">
            <div className="min-w-[200px] flex-1"><label className="text-[11px] font-medium">Revocation reason</label><input value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)} maxLength={300} className={`${inputClass} mt-1`} placeholder="Reason for revocation" /></div>
            <button type="button" className={primaryClass} disabled={revoke.isPending} onClick={revokeGrant}>{revoke.isPending ? "Revoking…" : "Confirm revoke"}</button>
            <button type="button" className={buttonClass} onClick={() => setRevokeId("")}>Cancel</button>
          </div>
        )}
      </section>
    </main>
  );
}

function Segment({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded px-2 py-1.5 text-[11px] font-medium transition ${active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{children}</button>;
}

function TierBadge({ plan }: { plan: string }) {
  const cls = plan === "vip" ? "border-amber-500/30 bg-amber-500/10 text-amber-700" : plan === "premium" ? "border-violet-500/30 bg-violet-500/10 text-violet-700" : plan === "regular" ? "border-blue-500/30 bg-blue-500/10 text-blue-700" : "border-border bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${cls}`}>{plan}</span>;
}

function StatusBadge({ value }: { value: string }) {
  const status = value.toUpperCase();
  const cls = status === "COMPLETED" || status === "GRANTED" ? "border-emerald-600/25 bg-emerald-600/10 text-emerald-700" : status === "FAILED" || status === "REVOKED" ? "border-destructive/25 bg-destructive/10 text-destructive" : "border-border bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded border px-1.5 py-0.5 text-[9px] font-semibold ${cls}`}>{value || "—"}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-border px-2 py-1.5"><div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-0.5 break-words">{value}</div></div>;
}
