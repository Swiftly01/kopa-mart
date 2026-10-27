import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import useHasLegacyProducts from "@/hooks/products/queries/useHasLegacyProducts";
import ManageListings from "./ManageListings";

// Old-product dashboard: only sellers who still have old products see it,
// everyone else lands on their ads.
export default function ManageListingsGate() {
  const { data: hasLegacy, isLoading } = useHasLegacyProducts();

  if (isLoading) {
    return <Loader2 className="mx-auto mt-10 size-8 animate-spin text-primary" />;
  }
  if (!hasLegacy) return <Navigate to="/my-ads" replace />;
  return <ManageListings />;
}