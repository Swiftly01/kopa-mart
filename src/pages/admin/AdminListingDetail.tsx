import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  AlertCircle,
  User,
  MapPin,
  Tag,
  Package,
  Star,
  Eye,
  Calendar,
  Hash,
  ShoppingBag,
  Layers,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  BadgePercent,
} from "lucide-react";
import useGetProductBySlug from "@/hooks/products/queries/useGetProductBySlug";
import useDeleteListing from "@/hooks/admin/products/mutations/useDeleteListing";
import { formatNaira } from "@/lib/utils/utils";


// ─── Helpers ─────────────────────────────────────────────────────────────────

const StatusBadge = ({ status, isActive }: { status: string; isActive: boolean }) => {
  const map: Record<string, { pill: string; dot: string; label: string }> = {
    active:   { pill: "bg-emerald-500/10 text-emerald-600", dot: "bg-emerald-500", label: "Active"   },
    inactive: { pill: "bg-zinc-500/10 text-zinc-500",       dot: "bg-zinc-400",    label: "Inactive" },
    banned:   { pill: "bg-red-500/10 text-red-600",         dot: "bg-red-500",     label: "Banned"   },
    pending:  { pill: "bg-amber-500/10 text-amber-600",     dot: "bg-amber-500",   label: "Pending"  },
    sold:     { pill: "bg-blue-500/10 text-blue-600",       dot: "bg-blue-500",    label: "Sold"     },
  };
  const s = map[status?.toLowerCase()] ?? map["inactive"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${s.pill}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
    <div className="flex items-center justify-center size-7 rounded-md bg-secondary shrink-0 mt-0.5">
      <Icon className="size-3.5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  </div>
);

// ─── Delete Modal ─────────────────────────────────────────────────────────────

const DeleteModal = ({
  productName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center size-12 rounded-full bg-destructive/10 shrink-0">
          <Trash2 className="size-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Delete this listing?</h2>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">&ldquo;{productName}&rdquo;</span> will be
            permanently removed along with all its images and data. This cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isDeleting} className="gap-1.5">
          {isDeleting && <Loader2 className="size-3.5 animate-spin" />}
          Yes, delete listing
        </Button>
      </div>
    </div>
  </div>
);

// ─── Image Gallery ────────────────────────────────────────────────────────────

const ImageGallery = ({ images }: { images: { cloudinaryUrl: string; isMain: boolean; order: number }[] }) => {
  const sorted = [...images].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    return a.order - b.order;
  });

  const [active, setActive] = useState(0);

  if (!sorted.length) {
    return (
      <div className="aspect-[4/3] rounded-2xl bg-secondary flex items-center justify-center">
        <Package className="size-12 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary group">
        <img
          src={sorted[active]?.cloudinaryUrl}
          alt=""
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {sorted.length > 1 && (
          <>
            <button
              onClick={() => setActive((p) => (p - 1 + sorted.length) % sorted.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-border"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % sorted.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-border"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
        {sorted[active]?.isMain && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-primary text-primary-foreground">
            Main
          </span>
        )}
        <span className="absolute bottom-3 right-3 text-[11px] font-medium px-2 py-1 rounded-md bg-background/80 backdrop-blur text-muted-foreground border border-border">
          {active + 1} / {sorted.length}
        </span>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 size-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? "border-primary" : "border-transparent"
              }`}
            >
              <img src={img.cloudinaryUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) => (
  <div className="bg-secondary/50 rounded-xl p-4 space-y-1 border border-border">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-3.5" />
      <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-xl font-bold text-foreground">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminListingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: product, isLoading, isError } = useGetProductBySlug(slug ?? "");
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();

  //const product = data ?? data; // handle both { data: Product } and Product shapes

  const handleDeleteConfirm = () => {
    if (!product?.id) return;
    deleteListing(product.id, {
      onSuccess: () => navigate("/admin/listings"),
      onSettled: () => setShowDeleteModal(false),
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading listing…</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !product) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-3 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="text-sm font-medium text-foreground">Listing not found</p>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="size-3.5 mr-1.5" /> Go back
            </Button>
          </div>
        </div>
      </AdminShell>
    );
  }

  const discountedPrice = product.discountPercentage > 0
    ? parseFloat(product.price) * (1 - product.discountPercentage / 100)
    : null;

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          productName={product.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}

      <AdminShell>
        <div className="space-y-6 max-w-6xl">
          {/* ── Top bar ── */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-1.5 text-muted-foreground hover:text-foreground -ml-1"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <span className="text-border">|</span>
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link to="/admin/listings" className="hover:text-foreground transition-colors">
                  Listings
                </Link>
                <ChevronRight className="size-3" />
                <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">
                  {product.name}
                </span>
              </nav>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="gap-1.5 shrink-0"
            >
              <Trash2 className="size-3.5" />
              Delete listing
            </Button>
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── Left col: images + stats ── */}
            <div className="lg:col-span-2 space-y-4">
              <ImageGallery images={product.images ?? []} />

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  icon={Eye}
                  label="Views"
                  value={product.views.toLocaleString()}
                />
                <StatCard
                  icon={Star}
                  label="Rating"
                  value={parseFloat(product.rating).toFixed(1)}
                  sub={`${product.reviewCount} reviews`}
                />
                <StatCard
                  icon={ShoppingBag}
                  label="Stock"
                  value={product.stock}
                  sub={product.stock === 0 ? "Out of stock" : "Available"}
                />
              </div>
            </div>

            {/* ── Right col: core info ── */}
            <div className="lg:col-span-3 space-y-4">

              {/* Title + status */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                    {product.name}
                  </h1>
                  <StatusBadge status={product.status} isActive={product.isActive} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    /{product.slug}
                  </span>
                  {product.sku && (
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded font-mono">
                      SKU: {product.sku}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    product.isActive
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-zinc-500/10 text-zinc-500"
                  }`}>
                    {product.isActive ? "Publicly visible" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-secondary/40 rounded-xl p-4 border border-border">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">Pricing</p>
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-foreground">
                    {discountedPrice ? formatNaira(discountedPrice.toString()) : formatNaira(product.price)}
                  </span>
                  {discountedPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatNaira(product.price)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-amber-500/10 text-amber-600">
                        <BadgePercent className="size-3" />
                        {product.discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Details grid */}
              <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                <InfoRow
                  icon={Tag}
                  label="Category"
                  value={
                    <div className="flex items-center gap-1.5">
                      {product.category?.icon && (
                        <span>{product.category.icon}</span>
                      )}
                      <span>{product.category?.name ?? "—"}</span>
                      {product.category?.parentId && (
                        <span className="text-muted-foreground text-xs">· subcategory</span>
                      )}
                    </div>
                  }
                />
                <InfoRow
                  icon={Layers}
                  label="Condition"
                  value={
                    <span className="capitalize">{product.condition ?? "—"}</span>
                  }
                />
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={
                    [product.lgaName, product.stateName]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
                <InfoRow
                  icon={Hash}
                  label="Product ID"
                  value={
                    <span className="font-mono text-xs text-muted-foreground break-all">
                      {product.id}
                    </span>
                  }
                />
                <InfoRow
                  icon={Calendar}
                  label="Listed"
                  value={
                    product.createdAt
                      ? `${format(new Date(product.createdAt), "dd MMM yyyy, HH:mm")} (${formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })})`
                      : "—"
                  }
                />
                <InfoRow
                  icon={Calendar}
                  label="Last updated"
                  value={
                    product.updatedAt
                      ? formatDistanceToNow(new Date(product.updatedAt), { addSuffix: true })
                      : "—"
                  }
                />
                {product.discountPercentage > 0 && (
                  <InfoRow
                    icon={BarChart2}
                    label="Discount"
                    value={`${product.discountPercentage}%`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Seller card ── */}
          {product.seller && (
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-secondary/50 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Seller Profile
                </p>
              </div>
              <div className="p-5 flex items-center gap-4">
                {/* Avatar */}
                {product.seller.profilePictureUrl ? (
                  <img
                    src={product.seller.profilePictureUrl}
                    alt={product.seller.firstName}
                    className="size-14 rounded-full object-cover ring-2 ring-border shrink-0"
                  />
                ) : (
                  <div className="size-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-border shrink-0">
                    <span className="text-xl font-bold text-primary">
                      {product.seller.firstName?.charAt(0).toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground">
                    {product.seller.firstName} {product.seller.lastName ?? ""}
                  </p>
                  <p className="text-sm text-muted-foreground">{product.seller.email}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded font-mono">
                      ID: {product.seller.id ?? product.sellerId}
                    </span>
                    {product.seller.role && (
                      <span className="text-xs capitalize px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                        {product.seller.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* Link to seller page */}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="shrink-0 gap-1.5"
                >
                  <Link to={`/admin/users/${product.seller.id ?? product.sellerId}`}>
                    <User className="size-3.5" />
                    View seller
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* ── Category metadata (if present) ── */}
          {product.category?.metadata && Object.keys(product.category.metadata).length > 0 && (
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-secondary/50 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Category Metadata
                </p>
              </div>
              <div className="p-5">
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {JSON.stringify(product.category.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* ── Danger zone ── */}
          <div className="border border-destructive/30 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 bg-destructive/5 border-b border-destructive/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive/80">
                Danger Zone
              </p>
            </div>
            <div className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Delete this listing</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently removes the product and all associated images. This action cannot be reversed.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="gap-1.5 shrink-0"
              >
                <Trash2 className="size-3.5" />
                Delete listing
              </Button>
            </div>
          </div>
        </div>
      </AdminShell>
    </>
  );
};

export default AdminListingDetail;