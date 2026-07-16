import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { formatPrice, useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  ssr: false,
  head: () => ({ meta: [{ title: "Cart — SwiftCommerce" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Your cart</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground mb-4">Your cart is empty.</p>
            <Link to="/shop" className="inline-block rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.items.map((it) => (
                <div key={it.id} className="flex gap-4 rounded-xl border border-border p-3">
                  <img src={it.image_url} alt={it.name} className="size-24 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <Link to="/products/$slug" params={{ slug: it.slug }} className="text-sm font-medium hover:underline line-clamp-1">
                      {it.name}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1">{formatPrice(it.price_cents)}</div>
                    <div className="mt-2 inline-flex items-center rounded-full border border-input">
                      <button onClick={() => cart.setQty(it.id, it.quantity - 1)} className="p-1.5 hover:bg-muted rounded-l-full">
                        <Minus className="size-3" />
                      </button>
                      <span className="px-3 text-xs tabular-nums w-7 text-center">{it.quantity}</span>
                      <button onClick={() => cart.setQty(it.id, it.quantity + 1)} className="p-1.5 hover:bg-muted rounded-r-full">
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between items-end">
                    <button onClick={() => cart.remove(it.id)} className="text-muted-foreground hover:text-red-600" aria-label="Remove">
                      <Trash2 className="size-4" />
                    </button>
                    <div className="text-sm font-medium">{formatPrice(it.price_cents * it.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="rounded-xl border border-border p-5 h-fit">
              <h2 className="text-sm font-semibold mb-4">Summary</h2>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-semibold mb-4">
                <span>Total</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <button
                onClick={() => navigate({ to: "/checkout" })}
                className="w-full rounded-full bg-foreground text-background py-2.5 text-sm font-medium hover:opacity-90"
              >
                Checkout →
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
