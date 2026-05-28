import { AdminShell } from "@/components/AdminShell";
import { ApproveModal } from "@/components/ApproveModal";
import { RejectModal } from "@/components/RejectModal";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, STATUS_STYLES } from "@/constant/sellerVerification";
import { useApproveSeller } from "@/hooks/admin/seller-verification/mutations/useApproveSeller";
import { useRejectSeller } from "@/hooks/admin/seller-verification/mutations/useRejectSeller";
import useSellerVerificationDetails from "@/hooks/admin/seller-verification/queries/useSellerVerificationDetails";
import appToast from "@/lib/appToast";
import { SellerVerificationStatusEnum } from "@/types/adminSellerVerification";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Mail,
  Phone,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const VerificationDetailPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const {
    data: detailData,
    isLoading,
    isError,
  } = useSellerVerificationDetails(userId || "");

  const approveMutation = useApproveSeller();
  const rejectMutation = useRejectSeller();

  const isActionLoading = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async () => {
    if (!userId) return;
    try {
      await approveMutation.mutateAsync(userId);
      appToast({
        title: "Seller approved",
        description: "The seller application has been approved successfully.",
      });
      setShowApproveModal(false);
      setTimeout(() => navigate("/admin/seller-verification"), 500);
    } catch {
      appToast({
        title: "Error",
        description: "Failed to approve the seller. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (
    rejectionReason: string,
    stepToReject: number,
  ) => {
    if (!userId) return;
    const payload = {
      userId,
      rejectionReason,
      stepToReject,
    };

    try {
      await rejectMutation.mutateAsync(payload);
      appToast({
        title: "Application rejected",
        description: "The seller application has been rejected.",
      });
      setShowRejectModal(false);
      setTimeout(() => navigate("/admin/seller-verification"), 500);
    } catch {
      appToast({
        title: "Error",
        description: "Failed to reject the seller. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading seller details...
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (isError || !userId || !detailData) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-2 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {isError
                ? "Failed to load seller details"
                : "No application data found"}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/seller-verification")}
              className="mt-4"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to List
            </Button>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (viewImage) {
    return (
      <AdminShell>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          onClick={() => setViewImage(null)}
        >
          <button className="absolute flex items-center justify-center text-white transition-colors rounded-full top-4 right-4 size-10 bg-white/20 hover:bg-white/30">
            <X className="size-5" />
          </button>
          <img
            src={viewImage}
            alt="Document"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </AdminShell>
    );
  }

  const sellerName = `${detailData.firstName} ${detailData.lastName}`;
  const step1Data = detailData.allStepsData?.step1;
  const step2Data = detailData.allStepsData?.step2;
  const step3Data = detailData.allStepsData?.step3;

  // JS equivalent:
  const stepsCompleted = detailData.stepsCompleted
    .toString(2) // e.g. 7 → "111"
    .split("")
    .filter((b) => b === "1").length;

  return (
    <AdminShell>
      {/* Modals */}
      {showApproveModal && (
        <ApproveModal
          sellerName={sellerName}
          onConfirm={handleApprove}
          onCancel={() => setShowApproveModal(false)}
          isLoading={approveMutation.isPending}
        />
      )}
      {showRejectModal && (
        <RejectModal
          sellerName={sellerName}
          onConfirm={handleReject}
          onCancel={() => setShowRejectModal(false)}
          isLoading={rejectMutation.isPending}
        />
      )}

      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/seller-verification")}
              className="gap-2 px-0 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Verifications
            </Button>
            <div className="pt-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {sellerName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Seller Application Review
              </p>
            </div>
          </div>
          {(() => {
            const style =
              STATUS_STYLES[detailData.status] ??
              STATUS_STYLES[SellerVerificationStatusEnum.PENDING_REVIEW];
            return (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${style.pill}`}
              >
                <span
                  className={`rounded-full size-2 ${style.dot} ${style.pulse ? "animate-pulse" : ""}`}
                />
                {STATUS_LABELS[detailData.status] ?? detailData.status}
              </span>
            );
          })()}
        
        </div>

        <div className="grid gap-6">
          {/* Progress Overview */}
          <div className="p-6 space-y-4 border rounded-lg border-border bg-card">
            <h2 className="text-lg font-semibold">Verification Progress</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Steps Completed
                </p>
                
                <p className="text-2xl font-bold text-foreground">
                  {
                    detailData.stepsCompleted
                      .toString(2)
                      .split("")
                      .filter((b) => b === "1").length
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Current Step
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {detailData.currentStep}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Status
                </p>
                <p className="text-sm font-medium">
                  {STATUS_LABELS[detailData.status] ?? detailData.status}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Submitted
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDistanceToNow(new Date(detailData.submittedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>

         
          <div className="p-6 space-y-4 border rounded-lg border-border bg-card">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Email Address
                </label>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <a
                    href={`mailto:${detailData.email}`}
                    className="text-primary hover:underline"
                  >
                    {detailData.email}
                  </a>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <a
                    href={`tel:${detailData.phoneNumber}`}
                    className="text-primary hover:underline"
                  >
                    {detailData.phoneNumber}
                  </a>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Full Name
                </label>
                <p className="text-sm font-medium text-foreground">
                  {sellerName}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  User ID
                </label>
                <code className="text-xs bg-secondary px-2 py-1.5 rounded font-mono text-foreground">
                  {detailData.userId}
                </code>
              </div>
            </div>
          </div>

        
          {step3Data && (
            <div className="p-6 space-y-4 border rounded-lg border-border bg-card">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Store className="size-5" />
                Store Information
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                    Store Name
                  </label>
                  <p className="text-sm font-medium text-foreground">
                    {step3Data.storeName || detailData.storeName}
                  </p>
                </div>
                {step3Data.whatsappNumber && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      WhatsApp Number
                    </label>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="size-4 text-muted-foreground" />
                      <a
                        href={`https://wa.me/${step3Data.whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {step3Data.whatsappNumber}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        
          {step1Data &&
            (step1Data.idFrontImageUrl || step1Data.idBackImageUrl) && (
              <div className="p-6 space-y-4 border rounded-lg border-border bg-card">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <FileText className="size-5" />
                    ID Verification
                  </h2>
                  {step1Data.completed && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-medium">
                      <CheckCircle2 className="size-3" />
                      Completed
                    </span>
                  )}
                </div>
                {step1Data.idFullName && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      ID Full Name
                    </label>
                    <p className="text-sm font-medium text-foreground">
                      {step1Data.idFullName}
                    </p>
                  </div>
                )}
                {step1Data.idStateCode && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      State Code
                    </label>
                    <code className="text-sm bg-secondary px-2 py-1.5 rounded font-mono text-foreground">
                      {step1Data.idStateCode}
                    </code>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                  {step1Data.idFrontImageUrl && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                        ID Front
                      </label>
                      <button
                        onClick={() => setViewImage(step1Data.idFrontImageUrl!)}
                        className="relative w-full overflow-hidden transition-colors rounded-lg group aspect-video ring-1 ring-border hover:ring-primary"
                      >
                        <img
                          src={step1Data.idFrontImageUrl}
                          alt="ID front"
                          className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        />
                        <span className="absolute inset-0 flex items-center justify-center transition-colors bg-black/0 group-hover:bg-black/40">
                          <Eye className="text-white transition-opacity opacity-0 size-5 group-hover:opacity-100" />
                        </span>
                      </button>
                    </div>
                  )}
                  {step1Data.idBackImageUrl && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                        ID Back
                      </label>
                      <button
                        onClick={() => setViewImage(step1Data.idBackImageUrl!)}
                        className="relative w-full overflow-hidden transition-colors rounded-lg group aspect-video ring-1 ring-border hover:ring-primary"
                      >
                        <img
                          src={step1Data.idBackImageUrl}
                          alt="ID back"
                          className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        />
                        <span className="absolute inset-0 flex items-center justify-center transition-colors bg-black/0 group-hover:bg-black/40">
                          <Eye className="text-white transition-opacity opacity-0 size-5 group-hover:opacity-100" />
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Face Verification */}
          {step2Data && step2Data.livenessImageUrl && (
            <div className="p-6 space-y-4 border rounded-lg border-border bg-card">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="size-5" />
                  Face Verification
                </h2>
                {step2Data.completed && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-medium">
                    <CheckCircle2 className="size-3" />
                    Completed
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                    Liveness Verification
                  </label>
                  <button
                    onClick={() => setViewImage(step2Data.livenessImageUrl!)}
                    className="relative w-full overflow-hidden transition-colors rounded-lg group aspect-video ring-1 ring-border hover:ring-primary"
                  >
                    <img
                      src={step2Data.livenessImageUrl}
                      alt="Face verification"
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center transition-colors bg-black/0 group-hover:bg-black/40">
                      <Eye className="text-white transition-opacity opacity-0 size-5 group-hover:opacity-100" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {detailData.status !== SellerVerificationStatusEnum.APPROVED && (
            <Button
              onClick={() => setShowApproveModal(true)}
              disabled={isActionLoading}
              className="flex-1 gap-2 text-white bg-green-600 hover:bg-green-700 h-11"
            >
              <Check className="size-4" />
              Approve Seller
            </Button>
          )}
          {detailData.status !== SellerVerificationStatusEnum.REJECTED && (
            <Button
              onClick={() => setShowRejectModal(true)}
              disabled={isActionLoading}
              variant="outline"
              className="flex-1 gap-2 text-red-600 border-red-200 h-11 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
            >
              <X className="size-4" />
              Reject Application
            </Button>
          )}
        </div>
      </div>
    </AdminShell>
  );
};

export default VerificationDetailPage;
