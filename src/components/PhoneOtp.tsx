import { useEffect, useState } from "react";
import { requestOtp, verifyOtp } from "@/lib/otp.functions";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

/** OTP verification for an Indian mobile number. Calls onVerified(phone) once. */
export function PhoneOtp({
  phone,
  onVerified,
}: {
  phone: string;
  onVerified: (phone: string) => void;
}) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  // Changing the number resets verification.
  useEffect(() => {
    setSent(false);
    setCode("");
    setVerified(false);
    setError("");
  }, [phone]);

  const send = async () => {
    if (!phoneValid || busy || cooldown > 0) return;
    setBusy(true);
    setError("");
    try {
      const res = await requestOtp({ data: { phone } });
      setSent(true);
      setCooldown(res.resendAfter ?? 30);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP.");
    }
    setBusy(false);
  };

  const verify = async () => {
    if (code.length !== 6 || busy) return;
    setBusy(true);
    setError("");
    try {
      await verifyOtp({ data: { phone, otp: code } });
      setVerified(true);
      onVerified(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    }
    setBusy(false);
  };

  if (verified) {
    return (
      <p className="rounded-xl bg-veg-soft p-3 text-sm font-semibold text-veg">
        ✓ {phone} verified
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Mobile verification
      </p>
      {!sent ? (
        <button
          type="button"
          disabled={!phoneValid || busy}
          onClick={send}
          className="mt-3 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-ink-foreground disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send OTP"}
        </button>
      ) : (
        <div className="mt-3">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={code.length !== 6 || busy}
              onClick={verify}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || busy}
              onClick={send}
              className="text-sm font-semibold text-muted-foreground underline disabled:no-underline disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
      {!phoneValid && (
        <p className="mt-2 text-xs text-muted-foreground">Enter a valid 10-digit Indian mobile number first.</p>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-destructive">{error}</p>}
    </div>
  );
}
