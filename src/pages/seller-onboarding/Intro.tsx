import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ScanLine,
  IdCard,
  UserCheck,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import nyscLogo from "@/assets/kopa_logo.jpeg";
import useInitSellerOnboarding from "@/hooks/seller/mutations/useInitSellerOnboarding";
import appToast from "@/lib/appToast";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";

const STEPS = [
  {
    icon: IdCard,
    title: "NYSC ID Upload",
    desc: "Take a clear photo of your valid NYSC identification card.",
  },
  {
    icon: ScanLine,
    title: "Face Scan",
    desc: "A quick liveness check to match your face with your ID.",
  },
  {
    icon: UserCheck,
    title: "Human Review",
    desc: "Our team securely reviews your details within 24 hours.",
  },
];

const Intro = () => {
  const navigate = useNavigate();
  const { initSellerOnboarding, isLoading } = useInitSellerOnboarding();
  function handleInitOnboarding() {
    initSellerOnboarding(undefined, {
      onSuccess: () => {
        appToast({
          title: "Seller onboarding",
          description: "Initialize seller onboarding",
        });
        navigate("/seller-onboarding/apply");
      },

      onError: (err: AxiosError) => {
        
        handleAxiosError(err);
      },
    });
  }
  return (
    <div className="max-w-2xl mx-auto px-5 pt-4 pb-16">
      <div className="flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={nyscLogo}
            alt=""
            className="size-8 rounded-lg object-cover ring-1 ring-border"
          />
          <span className="font-semibold">Kopa Market</span>
        </Link>
        <Link to="/" className="text-xs text-muted-foreground">
          Save & Exit
        </Link>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="font-semibold">Step 1 of 4</span>
        <span className="text-muted-foreground">Verification Overview</span>
      </div>
      <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
        <div className="h-full w-1/4 bg-primary" />
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-5 card-listing p-5">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold">Seller Identity Verification</h1>
            <p className="text-sm text-muted-foreground mt-1">
              To maintain a safe and trustworthy community for all corps
              members, we require a quick verification process before you can
              list items for sale.
            </p>
          </div>

          <ul className="space-y-2.5">
            {STEPS.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center shrink-0">
                  <s.icon className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-2">
            <ShieldCheck className="size-3" />
            Your data is encrypted and never shared.
          </p>
        </div>

        <div className="bg-secondary/40 rounded-2xl p-5 flex flex-col items-center text-center justify-center space-y-3">
          <div className="size-12 rounded-full bg-background flex items-center justify-center shadow-soft">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <h2 className="font-bold text-lg">Why verify?</h2>
          <p className="text-xs text-muted-foreground">
            Completing this one-time process unlocks full seller privileges and
            builds trust with buyers.
          </p>

          <div className="grid grid-cols-3 gap-2 w-full pt-2">
            {[
              {
                t: "Verified Badge",
                d: "Stand out with a badge on your profile.",
              },
              { t: "Higher Trust", d: "Buyers prefer verified corps members." },
              { t: "Faster Sales", d: "Verified items sell 3x faster." },
            ].map((x, i) => (
              <div key={i} className="bg-background rounded-xl p-2.5 text-left">
                <p className="text-[11px] font-semibold leading-tight">{x.t}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {x.d}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full bg-background rounded-xl p-2.5 flex items-center gap-2 text-left">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] font-semibold">
                Expected Time: ~3 Minutes
              </p>
              <p className="text-[10px] text-muted-foreground">
                Have your physical NYSC ID card ready and ensure you are in a
                well-lit area.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button
          disabled={isLoading}
          onClick={() => handleInitOnboarding()}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          {isLoading ? "Submitting..." : "Next"}{" "}
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default Intro;
