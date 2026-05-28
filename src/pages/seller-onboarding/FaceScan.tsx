

import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Smile,
  Eye,
  Lock,
  Loader2,
  Camera,
  RotateCcw,
} from "lucide-react";
import nyscLogo from "@/assets/kopa_logo.jpeg";
import appToast from "@/lib/appToast";
import { AxiosError } from "axios";
import { SellerOnboardingService } from "@/services/sellerOnboardingService";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";

// Validation schema for face scan
const faceScanSchema = z.object({
  faceScan: z
    .instanceof(File, {
      message: "Face scan image is required",
    })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "Image must be less than 5MB",
    })
    .refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    }),
});

type FaceScanSchema = z.infer<typeof faceScanSchema>;

const FaceScan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [cameraActive, setCameraActive] = useState(false);
  const [scanned, setScanned] = useState<string | undefined>();

  // React Hook Form setup
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FaceScanSchema>({
    resolver: zodResolver(faceScanSchema),
    mode: "onChange",
  });

  const faceScanFile = watch("faceScan");

  // React Query mutation for face verification
  const { mutate: submitFaceScan, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: FaceScanSchema) => {
      const formData = new FormData();
      formData.append("selfie", data.faceScan);

      return SellerOnboardingService.submitSelfie(formData);
    },
    onSuccess: () => {
      appToast({
        title: "Success",
        description: "Face verification submitted successfully",
      });
      navigate("/seller-onboarding/store-profile");
    },
    onError: (error: AxiosError) => {
      handleAxiosError(error);
    },
  });

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera or fallback to file input
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (error) {
      // Fallback to file input if camera access denied
      console.log("Camera access denied, using file input");
      fileInputRef.current?.click();
    }
  };

  // Capture photo from camera
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

    // Convert data URL to File
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "face-scan.jpg", {
            type: "image/jpeg",
          });
          setValue("faceScan", file, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setScanned(dataUrl);
          stopCamera();
        }
      },
      "image/jpeg",
      0.8,
    );
  };

  // Handle file input from fallback or retry
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      appToast({
        title: "File Too Large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      appToast({
        title: "Invalid File",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Set file in form
    setValue("faceScan", file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setScanned(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const retake = () => {
    setScanned(undefined);
    setValue("faceScan", undefined as any);
    startCamera();
  };

  // Submit form
  const onSubmit = (data: FaceScanSchema) => {
    submitFaceScan(data);
  };

  // Setup video stream when camera becomes active
  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) return;

    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => {
      console.error("Failed to play video");
    });
  }, [cameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-4 pb-16">
      <div className="flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={nyscLogo}
            alt="Kopa Market"
            className="size-8 rounded-lg object-cover ring-1 ring-border"
          />
          <span className="font-semibold">Kopa Market</span>
        </Link>
        <Link to="/" className="text-xs text-muted-foreground">
          Save & Exit
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="font-semibold">Step 3 of 4</span>
        <span className="text-muted-foreground">Face Verification</span>
      </div>
      <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
        <div className="h-full w-3/4 bg-primary" />
      </div>

      <div className="mt-6 grid md:grid-cols-[1fr,260px] gap-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card-listing p-5 text-center space-y-4"
        >
          <h1 className="text-xl font-bold">Liveness Check</h1>
          <p className="text-sm text-muted-foreground">
            Position your face within the frame and take a photo to verify your
            identity.
          </p>

          {/* Preview/Camera Area */}
          <div className="mx-auto w-48 h-48 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
            {scanned ? (
              <img
                src={scanned}
                alt="Face scan preview"
                className="w-full h-full object-cover"
              />
            ) : cameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
                autoPlay
                playsInline
                muted
              />
            ) : (
              <Smile className="size-12 text-muted-foreground" />
            )}
          </div>

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileInput}
          />

          {/* Status message */}
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-secondary">
            {isSubmitting ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Verifying…
              </>
            ) : scanned ? (
              "Preview your photo"
            ) : cameraActive ? (
              "Position your face and tap capture"
            ) : (
              "Tap to open camera"
            )}
          </div>

          {/* Error message */}
          {errors.faceScan && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">
                {errors.faceScan.message}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stopCamera();
                navigate(-1);
              }}
              disabled={isSubmitting}
            >
              Back
            </Button>

            <div className="flex gap-2">
              {scanned && !isSubmitting && (
                <>
                  <Button type="button" variant="outline" onClick={retake}>
                    <RotateCcw className="size-4 mr-1" />
                    Retake
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 mr-1 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </>
              )}

              {cameraActive && !scanned && (
                <Button
                  type="button"
                  onClick={capture}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  <Camera className="size-4 mr-1" />
                  Capture
                </Button>
              )}

              {!cameraActive && !scanned && !isSubmitting && (
                <Button
                  type="button"
                  onClick={startCamera}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Open Camera
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Sidebar with tips */}
        <aside className="card-listing p-4 h-fit space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-warning" />
            <p className="font-semibold text-sm">Lighting & Positioning</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Follow these tips for a successful liveness check.
          </p>

          {[
            {
              icon: Lightbulb,
              title: "Good Lighting",
              description:
                "Ensure your face is evenly lit. Avoid strong backlighting or dark rooms.",
            },
            {
              icon: Smile,
              title: "Remove Accessories",
              description:
                "Please remove sunglasses, hats, or masks that obscure your facial features.",
            },
            {
              icon: Eye,
              title: "Eye Level",
              description:
                "Hold your device at eye level and look directly into the camera.",
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-secondary/40"
            >
              <div className="size-7 rounded-md bg-background flex items-center justify-center shrink-0">
                <tip.icon className="size-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold">{tip.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-2 flex items-start gap-2">
            <Lock className="size-3.5 text-muted-foreground mt-0.5" />
            <p className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                Security & Privacy:
              </span>{" "}
              Your biometric data is encrypted end-to-end and never displayed
              publicly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FaceScan;
