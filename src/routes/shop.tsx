import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, Suspense } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";
import { formatPrice, useCart } from "@/lib/cart";
import { toast, Toaster } from "sonner";

const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, description, price_cents, image_url, stock, category_id, categories(name, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("id, name, slug").order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/shop")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Shop — SwiftCommerce" },
      { name: "description", content: "Browse premium electronics, wearables, cameras and accessories on SwiftCommerce." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(categoriesQuery);
  },
  component: () => (
    <Suspense fallback={<ShopSkeleton />}>
      <Shop />
    </Suspense>
  ),
});

function ShopSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-muted-foreground">Loading products…</div>
    </div>
  );
}

function Shop() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const cart = useCart();

  const filtered = products.filter((p) => {
    if (cat && p.category_id !== cat) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Toaster position="top-center" />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Shop</h1>
        <p className="text-sm text-muted-foreground mb-8">{filtered.length} products available</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCat(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                !cat ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  cat === c.id ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div key={p.id} className="group">
              <Link to="/products/$slug" params={{ slug: p.slug }} className="block">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  {p.categories?.name ?? "—"}
                </div>
                <div className="text-sm font-medium mb-1 line-clamp-1">{p.name}</div>
                <div className="text-sm text-muted-foreground">{formatPrice(p.price_cents)}</div>
              </Link>
              <button
                onClick={() => {
                  cart.add({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price_cents: p.price_cents,
                    image_url: p.image_url,
                  });
                  toast.success(`Added ${p.name} to cart`);
                }}
                disabled={p.stock === 0}
                className="mt-2 w-full rounded-lg bg-muted hover:bg-foreground hover:text-background px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {p.stock === 0 ? "Out of stock" : "Add to cart"}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-sm text-muted-foreground">No products match your filters.</div>
        )}
      </main>
    </div>
  );
}
