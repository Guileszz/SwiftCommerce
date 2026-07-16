import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Copy, Check } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { formatPrice, useCart } from "@/lib/cart";
import { createOrder } from "@/lib/order.functions";

const WALLET_ADDRESS = "ltc1qwymqc2djmhqph0y5sfqcnj60dn0l0v5zkrl02z";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — SwiftCommerce" }] }),
  component: Checkout,
});

function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const createOrderFn = useServerFn(createOrder);
  const [form, setForm] = useState({
    shipping_name: "",
    shipping_email: "",
    shipping_address: "",
    shipping_city: "",
    shipping_country: "",
    tx_hash: "",
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setLoading(true);
    try {
      const result = await createOrderFn({
        data: {
          items: cart.items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
          ...form,
          tx_hash: form.tx_hash || undefined,
          wallet_address: WALLET_ADDRESS,
        },
      });
      cart.clear();
      toast.success("Order placed!");
      navigate({ to: "/orders/$id", params: { id: result.order_id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteNav />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
          <Link to="/shop" className="inline-block rounded-full bg-foreground text-background px-5 py-2.5 text-sm">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Toaster position="top-center" />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Checkout</h1>
        <form onSubmit={submit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold mb-4">Shipping information</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full name" v={form.shipping_name} on={(v) => setForm({ ...form, shipping_name: v })} required className="col-span-2" />
                <Field label="Email" type="email" v={form.shipping_email} on={(v) => setForm({ ...form, shipping_email: v })} required className="col-span-2" />
                <Field label="Address" v={form.shipping_address} on={(v) => setForm({ ...form, shipping_address: v })} required className="col-span-2" />
                <Field label="City" v={form.shipping_city} on={(v) => setForm({ ...form, shipping_city: v })} required />
                <Field label="Country" v={form.shipping_country} on={(v) => setForm({ ...form, shipping_country: v })} required />
              </div>
            </section>

            <section className="rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold mb-2">Payment — Crypto wallet</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Send <span className="font-semibold text-foreground">{formatPrice(cart.subtotal)}</span> (in LTC) to the Litecoin address below. Paste the transaction hash after confirming — or leave blank to place a pending order and pay later.
              </p>
              <div className="rounded-lg bg-muted p-3 flex items-center gap-2 mb-3">
                <code className="text-xs font-mono break-all flex-1">{WALLET_ADDRESS}</code>
                <button type="button" onClick={copy} className="rounded-md bg-background p-2 hover:bg-muted-foreground/10">
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </button>
              </div>
              <label className="block text-xs font-medium mb-1.5">Transaction hash (optional)</label>
              <input
                value={form.tx_hash}
                onChange={(e) => setForm({ ...form, tx_hash: e.target.value })}
                placeholder="0x…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </section>
          </div>

          <aside className="rounded-xl border border-border p-5 h-fit">
            <h2 className="text-sm font-semibold mb-4">Order summary</h2>
            <div className="space-y-3 mb-4">
              {cart.items.map((it) => (
                <div key={it.id} className="flex gap-3 text-sm">
                  <img src={it.image_url} alt="" className="size-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1">{it.name}</div>
                    <div className="text-xs text-muted-foreground">Qty {it.quantity}</div>
                  </div>
                  <div>{formatPrice(it.price_cents * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-full bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Placing order…" : "Place order"}
            </button>
          </aside>
        </form>
      </main>
    </div>
  );
}

function Field({ label, v, on, required, type = "text", className = "" }: { label: string; v: string; on: (v: string) => void; required?: boolean; type?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={v}
        onChange={(e) => on(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
