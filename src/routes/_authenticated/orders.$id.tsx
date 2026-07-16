import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order — SwiftCommerce" }] }),
  component: OrderDetail,
});

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  wallet_address: string;
  tx_hash: string | null;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  created_at: string;
};

type Item = {
  id: string;
  product_name: string;
  product_image: string;
  unit_price_cents: number;
  quantity: number;
};

function OrderDetail() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: o }, { data: it }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).maybeSingle(),
        supabase.from("order_items").select("id, product_name, product_image, unit_price_cents, quantity").eq("order_id", id),
      ]);
      setOrder(o as OrderRow | null);
      setItems((it as Item[]) ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="max-w-3xl mx-auto px-6 py-10 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteNav />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Order not found</h1>
          <Link to="/orders" className="text-sm underline">View my orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 mb-8 flex items-start gap-4">
          <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-xl font-semibold">Thank you — your order is confirmed</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Order <span className="font-mono">#{order.id.slice(0, 8)}</span> · Status:{" "}
              <span className="font-medium text-foreground">{order.status}</span>
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-border p-5 mb-6">
          <h2 className="text-sm font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3 items-center">
                <img src={it.product_image} alt="" className="size-14 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{it.product_name}</div>
                  <div className="text-xs text-muted-foreground">Qty {it.quantity} · {formatPrice(it.unit_price_cents)} each</div>
                </div>
                <div className="text-sm font-medium">{formatPrice(it.unit_price_cents * it.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-5 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total_cents)}</span>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-border p-5">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Shipping to</h3>
            <div className="text-sm">
              {order.shipping_name}
              <br />
              {order.shipping_address}
              <br />
              {order.shipping_city}, {order.shipping_country}
              <br />
              <span className="text-muted-foreground">{order.shipping_email}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Payment</h3>
            <div className="text-xs">
              <div className="text-muted-foreground">Wallet</div>
              <code className="font-mono break-all">{order.wallet_address}</code>
              {order.tx_hash && (
                <>
                  <div className="text-muted-foreground mt-2">Tx hash</div>
                  <code className="font-mono break-all">{order.tx_hash}</code>
                </>
              )}
            </div>
          </div>
        </section>

        <Link to="/shop" className="inline-block text-sm underline">← Keep shopping</Link>
      </main>
    </div>
  );
}
