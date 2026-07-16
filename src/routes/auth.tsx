import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav } from "@/components/site-nav";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — SwiftCommerce" },
      { name: "description", content: "Sign in to the SwiftCommerce demo storefront to explore the shopping and admin experience." },
    ],
  }),
  component: AuthPage,
});

const DEMO_ACCOUNTS = [
  {
    label: "Customer demo",
    description: "Browse the shop, add to cart, and view orders.",
    email: "demo@swiftcommerce.dev",
    password: "Sw!ftDemo7x2",
  },
] as const;

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect ?? "/shop" });
    });
  }, [navigate, redirect]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate({ to: redirect ?? "/shop" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(acc: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(acc.email);
    setPassword(acc.password);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Toaster position="top-center" />
      <main className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This is a portfolio demo — sign in with the credentials below to explore the storefront.
        </p>

        <div className="rounded-xl border border-input bg-muted/40 p-4 mb-6 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Demo credentials</p>
          {DEMO_ACCOUNTS.map((acc) => (
            <div key={acc.email} className="flex items-start justify-between gap-3">
              <div className="text-xs">
                <p className="font-medium text-foreground">{acc.label}</p>
                <p className="text-muted-foreground">{acc.description}</p>
                <p className="mt-1 font-mono text-[11px]">{acc.email}</p>
                <p className="font-mono text-[11px]">{acc.password}</p>
              </div>
              <button
                type="button"
                onClick={() => fillDemo(acc)}
                className="shrink-0 rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Use
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </p>
      </main>
    </div>
  );
}
