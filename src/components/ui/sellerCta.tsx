import { SellerVerificationStatusEnum } from "@/types/sellerOnboarding";
import { useNavigate, Link } from "react-router-dom";

interface SellerCTAProps {
  status: SellerVerificationStatusEnum | null | undefined;
}

export function SellerCTA({ status }: SellerCTAProps) {
  const navigate = useNavigate();

  // Not logged in → default "Become a Seller" CTA
  if (!status) {
    return (
      <button
        type="button"
        onClick={() => navigate("/seller-onboarding/intro")}
        className="px-4 py-2 text-sm font-semibold transition-shadow rounded-full bg-background text-foreground shadow-soft hover:shadow-elevated"
      >
        Become a Seller →
      </button>
    );
  }

  switch (status) {
    case SellerVerificationStatusEnum.NOT_STARTED:
      return (
        <button
          type="button"
          onClick={() => navigate("/seller-onboarding/intro")}
          className="px-4 py-2 text-sm font-semibold transition-shadow rounded-full bg-background text-foreground shadow-soft hover:shadow-elevated"
        >
          Become a Seller →
        </button>
      );

    case SellerVerificationStatusEnum.IN_PROGRESS:
      return (
        <button
          type="button"
          onClick={() => navigate("/seller-onboarding/intro")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-shadow rounded-full cursor-pointer bg-background/80 text-foreground shadow-soft hover:shadow-elevated"
        >
          {/* Animated spinner dot */}
          <span className="relative flex size-2">
            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-amber-500" />
            <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
          </span>
          In Progress
        </button>
      );

    case SellerVerificationStatusEnum.PENDING_REVIEW:
      return (
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full cursor-default select-none bg-background/60 text-foreground/70 w-fit">
            {/* Clock icon inline */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-400 size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Pending Review
          </span>
          <p className="text-[10px] opacity-70 pl-1">
            We'll notify you once approved.
          </p>
        </div>
      );

    case SellerVerificationStatusEnum.APPROVED:
      return (
        <button
          type="button"
          onClick={() => navigate("/seller-dashboard/manage-listings")} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-shadow rounded-full bg-background text-foreground shadow-soft hover:shadow-elevated"
        >
          {/* Checkmark */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-green-500 size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Start Selling →
        </button>
      );

    case SellerVerificationStatusEnum.REJECTED:
      return (
        <div className="flex flex-col gap-1">
          <Link
            to="/seller-onboarding/intro"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-shadow rounded-full bg-background text-foreground shadow-soft hover:shadow-elevated w-fit"
          >
            {/* X icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-500 size-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Reapply as Seller
          </Link>
          <p className="text-[10px] opacity-70 pl-1">
            Your application was rejected.
          </p>
        </div>
      );

    default:
      return null;
  }
}
