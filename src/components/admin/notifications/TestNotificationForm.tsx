import { useState } from "react";
import { Loader2, FlaskConical, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useTestNotification from "@/hooks/admin/notifications/mutations/useTestNotification";
import { TestNotificationResult } from "@/types/adminNotification";
import appToast from "@/lib/appToast";

export default function TestNotificationForm() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pushToken, setPushToken] = useState("");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<TestNotificationResult[] | null>(null);

  const { mutate: runTest, isPending } = useTestNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email && !phoneNumber && !pushToken) {
      appToast({
        title: "Add at least one destination",
        description: "Email, phone number, or push token.",
        variant: "destructive",
      });
      return;
    }

    runTest(
      {
        email: email || undefined,
        phoneNumber: phoneNumber || undefined,
        pushToken: pushToken || undefined,
        message: message || undefined,
      },
      {
        onSuccess: (data) => setResults(data),
        onError: (err: any) =>
          appToast({
            title: "Test failed to run",
            description: err?.response?.data?.message ?? "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-3 text-xs border rounded-lg border-border bg-secondary/30 text-muted-foreground">
        Fires a real message straight at the provider — no queue, no stored
        notification, works even for destinations that don't belong to a
        real user yet. Use this to confirm SMTP/Termii/Twilio/Firebase
        credentials after a deploy or credential rotation.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="testEmail">Email</Label>
          <Input
            id="testEmail"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="testPhone">Phone number (E.164)</Label>
          <Input
            id="testPhone"
            placeholder="+2348012345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="testPushToken">Push token (FCM)</Label>
          <Input
            id="testPushToken"
            placeholder="A real FCM registration token"
            value={pushToken}
            onChange={(e) => setPushToken(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="testMessage">Custom message (optional)</Label>
          <Textarea
            id="testMessage"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Defaults to a canned test message"
          />
        </div>

        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FlaskConical className="size-4" />
          )}
          Run test
        </Button>
      </form>

      {results && (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Results
          </p>
          {results.map((r) => (
            <div
              key={r.channel}
              className="flex items-start gap-3 p-3 border rounded-lg border-border"
            >
              {r.success ? (
                <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium capitalize">
                  {r.channel} → {r.to}
                </p>
                {r.success ? (
                  <p className="text-xs text-muted-foreground">
                    Delivered via <span className="font-medium">{r.providerName}</span>{" "}
                    in {r.durationMs}ms
                  </p>
                ) : (
                  <p className="text-xs text-destructive">{r.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
