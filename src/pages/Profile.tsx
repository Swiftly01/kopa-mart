
import SignInPrompt from "@/components/SignInPrompt";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import useUser from "@/hooks/users/queries/useUser";
import useUpdateAvatar from "@/hooks/users/mutations/useUpdateAvatar";
import appToast from "@/lib/appToast";
import { isAdmin, isSuperAdmin } from "@/lib/utils/authRoles";
import {
  Camera,
  Download,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageCircle,
  Pencil,
  Plus,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EditProfileModal from "@/components/ui/editProfileModal";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // match backend limit

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    buyer: "bg-secondary text-secondary-foreground",
    pending: "bg-warning/15 text-warning",
    verified: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${map[status]}`}
    >
      {status}
    </span>
  );
};

const Profile = () => {
  const { data: user, isLoading } = useUser();
  const { logOut } = useAuth();
  const { mutate: uploadAvatar, isPending: isUploading } = useUpdateAvatar();

  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  function handleLogout() {
    logOut();
    appToast({ title: "Log Out", description: "You have logged out successfully" });
    navigate("/", { replace: true });
  }

  if (typeof window !== "undefined" && !deferredPrompt) {
    window.addEventListener(
      "beforeinstallprompt",
      (e: any) => { e.preventDefault(); setDeferredPrompt(e); },
      { once: true },
    );
  }

  if (isLoading) {
    return <Loader2 className="mx-auto size-12 animate-spin text-primary" />;
  }

  if (!user) return <SignInPrompt />;

  // ─── Avatar change ──────────────────────────────────────────────────────────
  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so the same file can be re-selected after an error
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      return toast({
        title: "File too large",
        description: "Maximum 5 MB.",
        variant: "destructive",
      });
    }
    uploadAvatar(file);
  };

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") toast({ title: "App installed!" });
      setDeferredPrompt(null);
    } else {
      toast({ title: "Add to Home Screen", description: "Use your browser menu to install this app." });
    }
  };

  const roleLabel = isSuperAdmin(user) ? "Super Admin" : isAdmin(user) ? "Admin" : null;

  const avatarSrc = user.profilePictureUrl  ?? null;

  return (
    <div className="max-w-2xl px-4 pt-4 pb-20 mx-auto space-y-5">
      {/* ── Profile card ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 p-5 card-listing">
        {/* Avatar with upload overlay */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="relative flex items-center justify-center overflow-hidden text-xl font-bold rounded-full size-16 bg-gradient-primary text-primary-foreground group shrink-0"
          title="Change photo"
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : avatarSrc ? (
            <img src={avatarSrc} alt="" className="object-cover w-full h-full" />
          ) : (
            user.firstName?.charAt(0).toUpperCase()
          )}
          {!isUploading && (
            <span className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-foreground/40 group-hover:opacity-100">
              <Camera className="size-5 text-background" />
            </span>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />

        {/* User info + edit button */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold truncate">
              {user.firstName} {user.lastName}
            </p>
            {/* ── Edit icon ── */}
            <button
              onClick={() => setEditOpen(true)}
              className="shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
              title="Edit profile"
            >
              <Pencil className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs truncate text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">{user.phoneNumber}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <StatusBadge status={user.status} />
            {roleLabel && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${isSuperAdmin(user) ? "bg-primary/15 text-primary" : "bg-accent/20 text-accent-foreground"}`}>
                {roleLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit profile modal ────────────────────────────────────────────── */}
      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
      />

      {user.role === "seller" && (
        <Link to="/seller-dashboard/manage-listings" className="flex items-center gap-3 p-4 card-listing">
          <div className="flex items-center justify-center size-10 rounded-xl bg-success/15 text-success">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Seller Dashboard</p>
            <p className="text-xs text-muted-foreground">Manage and add listings</p>
          </div>
        </Link>
      )}

      {user.role === "seller" && (
        <Link to={`/seller/${user.id}`} className="flex items-center gap-3 p-4 card-listing">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">View my public seller page</p>
            <p className="text-xs text-muted-foreground">See what buyers see</p>
          </div>
        </Link>
      )}

      {user.role === "seller" && (
        <Link to="/seller-dashboard/create-listing" className="flex items-center gap-3 p-4 card-listing">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary">
            <Plus className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Add new listing</p>
            <p className="text-xs text-muted-foreground">Post a product or service</p>
          </div>
        </Link>
      )}

      {(user.role === "buyer" || user.role === "admin") && (
        <Link to="/seller-onboarding/intro" className="flex items-center gap-3 p-4 card-listing">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Become a Seller</p>
            <p className="text-xs text-muted-foreground">For verified NYSC corps members</p>
          </div>
        </Link>
      )}

      {isAdmin(user) && (
        <Link to="/admin/dashboard" className="flex items-center gap-3 p-4 card-listing">
          <div className="flex items-center justify-center size-10 rounded-xl bg-accent/30 text-accent-foreground">
            <Settings className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin Dashboard</p>
            <p className="text-xs text-muted-foreground">Manage users, listings & verifications</p>
          </div>
        </Link>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Get the App</p>
        <button onClick={handleAndroidInstall} className="flex items-center w-full gap-3 p-4 text-left transition-shadow card-listing hover:shadow-elevated">
          <div className="flex items-center justify-center size-10 rounded-xl bg-success/15 text-success">
            <Download className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Download for Android</p>
            <p className="text-xs text-muted-foreground">Install to your home screen</p>
          </div>
        </button>
        <Link to="/install-ios" className="flex items-center gap-3 p-4 transition-shadow card-listing hover:shadow-elevated">
          <div className="flex items-center justify-center size-10 rounded-xl bg-secondary text-foreground">
            <Smartphone className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Download for iOS</p>
            <p className="text-xs text-muted-foreground">Step-by-step guide for iPhone</p>
          </div>
        </Link>
      </div>

      <Button variant="outline" className="w-full h-12" onClick={handleLogout}>
        <LogOut className="mr-2 size-4" />
        Logout
      </Button>

      <Link to="/support" className="fixed z-50 flex items-center justify-center text-white transition-transform rounded-full bottom-20 right-4 size-14 bg-success shadow-elevated hover:scale-105">
        <MessageCircle className="size-6" />
      </Link>
    </div>
  );
};

export default Profile;
