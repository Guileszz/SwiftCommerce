import { Link } from "@tanstack/react-router";
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth, useIsAdmin } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteNav() {
  const { count } = useCart();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin(user?.id);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md ring-1 ring-foreground/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          SwiftCommerce
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link to="/shop" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Shop
          </Link>
          {user && (
            <Link to="/orders" className="hover:text-foreground transition-colors">
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              <LayoutDashboard className="size-3.5" /> Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            <ShoppingCart className="size-3.5" />
            <span className="tabular-nums">{count}</span>
          </Link>
          {user ? (
            <button
              onClick={signOut}
              className="text-sm font-medium py-2 px-4 hover:bg-muted rounded-full transition-colors inline-flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-medium py-2 px-4 hover:bg-muted rounded-full transition-colors inline-flex items-center gap-1.5"
            >
              <UserIcon className="size-3.5" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
