type FaceVerificationStatus = "pending" | "completed" | "failed";
type IdVerificationStatus = "pending" | "completed" | "failed";
type Status = "not_stated" | "pending" | "approved" | "rejected";
type StoreProfileStatus = "pending" | "completed" | "failed";

export interface InitSellerOnboardingResponse {
  data: {
    currentStep: number;
    faceVerificationStatus: FaceVerificationStatus;
    id: string;
    idVerificationStatus: IdVerificationStatus;
    isAdminVerificationCompleted: boolean;
    isFaceVerificationCompleted: boolean;
    isIdVerificationCompleted: boolean;
    isStoreProfileCompleted: boolean;
    message: string;
    status: Status;
    stepsCompleted: number;
    storeProfileStatus: StoreProfileStatus;
  };
}
