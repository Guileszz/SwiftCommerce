import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { formatPrice } from "@/lib/cart";

type Order = {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — SwiftCommerce" }] }),
  component: Orders,
});

function statusColor(s: string) {
  return (
    {
      pending: "bg-amber-500/10 text-amber-600",
      paid: "bg-emerald-500/10 text-emerald-600",
      shipped: "bg-blue-500/10 text-blue-600",
      delivered: "bg-emerald-500/10 text-emerald-600",
      cancelled: "bg-red-500/10 text-red-600",
    } as Record<string, string>
  )[s] ?? "bg-muted text-muted-foreground";
}

function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("id, status, total_cents, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">My orders</h1>
        {orders === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-4">No orders yet.</p>
            <Link to="/shop" className="inline-block rounded-full bg-foreground text-background px-5 py-2.5 text-sm">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to="/orders/$id" params={{ id: o.id }} className="font-mono text-xs hover:underline">
                        #{o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
