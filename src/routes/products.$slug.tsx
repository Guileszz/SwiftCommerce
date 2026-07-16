import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { formatPrice, useCart } from "@/lib/cart";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, description, price_cents, image_url, stock, is_active, categories(name, slug)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

export const Route = createFileRoute("/products/$slug")({
  ssr: false,
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.slug)),
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — SwiftCommerce` },
      { name: "description", content: "Product on SwiftCommerce." },
    ],
  }),
  component: () => (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <ProductPage />
    </Suspense>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold mb-4">Product not found</h1>
        <Link to="/shop" className="text-sm underline">Back to shop</Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(slug));
  const cart = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Toaster position="top-center" />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Back to shop
        </Link>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              {p.categories?.name ?? "—"}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{p.name}</h1>
            <div className="text-2xl font-medium mb-4">{formatPrice(p.price_cents)}</div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{p.description}</p>
            <div className="text-xs mb-4">
              {p.stock > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">● In stock — {p.stock} available</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">● Out of stock</span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center rounded-full border border-input">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted rounded-l-full" aria-label="Decrease">
                  <Minus className="size-3.5" />
                </button>
                <span className="px-3 text-sm tabular-nums w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(p.stock, qty + 1))}
                  className="p-2 hover:bg-muted rounded-r-full"
                  aria-label="Increase"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  cart.add(
                    {
                      id: p.id,
                      name: p.name,
                      slug: p.slug,
                      price_cents: p.price_cents,
                      image_url: p.image_url,
                    },
                    qty,
                  );
                  toast.success("Added to cart");
                }}
                disabled={p.stock === 0}
                className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <ShoppingCart className="size-4" /> Add to cart
              </button>
              <button
                onClick={() => {
                  cart.add(
                    {
                      id: p.id,
                      name: p.name,
                      slug: p.slug,
                      price_cents: p.price_cents,
                      image_url: p.image_url,
                    },
                    qty,
                  );
                  navigate({ to: "/checkout" });
                }}
                disabled={p.stock === 0}
                className="rounded-full border border-input px-6 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
