import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useCurrentUser, useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Clock,
  LogOut,
  LogIn,
  Plus,
  LayoutDashboard,
  Settings,
  Camera,
  Download,
  Smartphone,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import useUser from "@/hooks/users/queries/useUser";
import { isAdmin, isSuperAdmin } from "@/lib/utils/authRoles";
import { useAuth } from "@/context/AuthContext";
import appToast from "@/lib/appToast";
import SignInPrompt from "@/components/SignInPrompt";

const MAX_FILE_SIZE = 1 * 1024 * 1024;

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
  const { data: user, isLoading, isError } = useUser();
  const { logOut } = useAuth();

  const updateCurrentUser = useStore((s) => s.updateCurrentUser);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  function handleLogout() {
    logOut();
    appToast({
      title: "Log Out",
      description: "You have logged out successfully",
    });
    navigate("/", { replace: true });
  }

  if (typeof window !== "undefined" && !deferredPrompt) {
    window.addEventListener(
      "beforeinstallprompt",
      (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      },
      { once: true },
    );
  }

  if (isLoading) {
    return <Loader2 className="mx-auto size-12 animate-spin text-primary" />;
  }

  if (!user) {
    return <SignInPrompt />;
  }

  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      return toast({
        title: "File too large",
        description: "Maximum 1MB.",
        variant: "destructive",
      });
    }
    const r = new FileReader();
    r.onload = () => {
      updateCurrentUser({ avatar: r.result as string });
      toast({ title: "Photo updated" });
    };
    r.readAsDataURL(f);
  };

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") toast({ title: "App installed!" });
      setDeferredPrompt(null);
    } else {
      toast({
        title: "Add to Home Screen",
        description: "Use your browser menu to install this app.",
      });
    }
  };

  const roleLabel = isSuperAdmin(user)
    ? "Super Admin"
    : isAdmin(user)
      ? "Admin"
      : null;

  return (
    <div className="max-w-2xl px-4 pt-4 pb-20 mx-auto space-y-5">
      <div className="flex items-center gap-4 p-5 card-listing">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative flex items-center justify-center overflow-hidden text-xl font-bold rounded-full size-16 bg-gradient-primary text-primary-foreground group"
          title="Change photo"
        >
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt=""
              className="object-cover w-full h-full"
            />
          ) : (
            user.firstName?.toUpperCase()
          )}
          <span className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-foreground/40 group-hover:opacity-100">
            <Camera className="size-5 text-background" />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onAvatar}
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{user.firstName}</p>
          <p className="text-xs truncate text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">{user.phoneNumber}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <StatusBadge status={user.status} />
            {roleLabel && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${isSuperAdmin(user) ? "bg-primary/15 text-primary" : "bg-accent/20 text-accent-foreground"}`}
              >
                {roleLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* {user.status === "pending" && (
        <div className="flex items-start gap-3 p-4 border rounded-2xl bg-warning/10 border-warning/20">
          <Clock className="size-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">
              Your seller application is under review
            </p>
            <p className="text-xs text-muted-foreground">
              Admin will verify your NYSC details shortly.
            </p>
          </div>
        </div>
      )}

      {user.status === "verified" && (
        <Link
          to="/seller-dashboard/manage-listings"
          className="flex items-center gap-3 p-4 card-listing"
        >
          <div className="flex items-center justify-center size-10 rounded-xl bg-success/15 text-success">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Seller Dashboard</p>
            <p className="text-xs text-muted-foreground">
              Manage and add listings
            </p>
          </div>
        </Link>
      )}

      {user.status === "verified" && (
        <Link
          to={`/seller/${user.id}`}
          className="flex items-center gap-3 p-4 card-listing"
        >
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">View my public seller page</p>
            <p className="text-xs text-muted-foreground">See what buyers see</p>
          </div>
        </Link>
      )}

      {user.status === "verified" && (
        <Link
          to="/seller-dashboard/create-listing"
          className="flex items-center gap-3 p-4 card-listing"
        >
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary">
            <Plus className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Add new listing</p>
            <p className="text-xs text-muted-foreground">
              Post a product or service
            </p>
          </div>
        </Link>
      )}
*/}
      {user.role === "buyer" ||
        (user.role === "admin" && (
          <Link
            to="/seller-onboarding/intro"
            className="flex items-center gap-3 p-4 card-listing"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Become a Seller</p>
              <p className="text-xs text-muted-foreground">
                For verified NYSC corps members
              </p>
            </div>
          </Link>
        ))}

      {isAdmin(user) && (
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 p-4 card-listing"
        >
          <div className="flex items-center justify-center size-10 rounded-xl bg-accent/30 text-accent-foreground">
            <Settings className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin Dashboard</p>
            <p className="text-xs text-muted-foreground">
              Manage users, listings & verifications
            </p>
          </div>
        </Link>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Get the App
        </p>
        <button
          onClick={handleAndroidInstall}
          className="flex items-center w-full gap-3 p-4 text-left transition-shadow card-listing hover:shadow-elevated"
        >
          <div className="flex items-center justify-center size-10 rounded-xl bg-success/15 text-success">
            <Download className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Download for Android</p>
            <p className="text-xs text-muted-foreground">
              Install to your home screen
            </p>
          </div>
        </button>
        <Link
          to="/install-ios"
          className="flex items-center gap-3 p-4 transition-shadow card-listing hover:shadow-elevated"
        >
          <div className="flex items-center justify-center size-10 rounded-xl bg-secondary text-foreground">
            <Smartphone className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Download for iOS</p>
            <p className="text-xs text-muted-foreground">
              Step-by-step guide for iPhone
            </p>
          </div>
        </Link>
      </div>

      <Button
        variant="outline"
        className="w-full h-12"
        onClick={() => handleLogout()}
      >
        <LogOut className="mr-2 size-4" />
        Logout
      </Button>

      <Link
        to="/support"
        className="fixed z-50 flex items-center justify-center text-white transition-transform rounded-full bottom-20 right-4 size-14 bg-success shadow-elevated hover:scale-105"
      >
        <MessageCircle className="size-6" />
      </Link>
    </div>
  );
};

export default Profile;
