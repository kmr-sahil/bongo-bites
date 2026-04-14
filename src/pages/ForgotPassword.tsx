import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const isEmailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const passwordStrength = () => {
    let strength = 0;
    if (newPassword.length >= 6) strength++;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
    return strength;
  };

  const getStrengthLabel = () => {
    const strength = passwordStrength();
    if (strength <= 1) return { label: "Weak", color: "bg-destructive" };
    if (strength <= 3) return { label: "Medium", color: "bg-accent" };
    return { label: "Strong", color: "bg-success" };
  };

  const validateRequestStep = () => {
    const nextErrors: { email?: string } = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!isEmailValid) {
      nextErrors.email = "Please enter a valid email";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateResetStep = () => {
    const nextErrors: {
      otp?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!otp.trim()) {
      nextErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp.trim())) {
      nextErrors.otp = "OTP must be 6 digits";
    }

    if (!newPassword) {
      nextErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateRequestStep()) return;

    try {
      setIsSubmitting(true);
      await authService.forgotPassword(email.trim().toLowerCase());
      toast.success("OTP sent to your email");
      setStep("reset");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateResetStep()) return;

    try {
      setIsSubmitting(true);
      await authService.resetPassword(
        email.trim().toLowerCase(),
        otp.trim(),
        newPassword,
      );
      toast.success("Password reset successful. Please sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reset password",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthInfo = getStrengthLabel();

  return (
    <Layout>
      <div className="section-container section-padding">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Forgot Password</h1>
            <p className="text-muted-foreground">
              {step === "request"
                ? "Enter your email to receive a 6-digit OTP"
                : "Enter the OTP sent to your email and set a new password"}
            </p>
          </div>

          {step === "request" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input-field ${errors.email ? "border-destructive ring-destructive/20" : ""}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium mb-2">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={`input-field ${errors.otp ? "border-destructive ring-destructive/20" : ""}`}
                  placeholder="Enter 6-digit OTP"
                />
                {errors.otp && (
                  <p className="text-sm text-destructive mt-1">{errors.otp}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`input-field ${errors.newPassword ? "border-destructive ring-destructive/20" : ""}`}
                  placeholder="Enter new password"
                />
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strengthInfo.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength() / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {strengthInfo.label}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {[
                        {
                          check: newPassword.length >= 6,
                          text: "At least 6 characters",
                        },
                        {
                          check: /[A-Z]/.test(newPassword),
                          text: "One uppercase letter",
                        },
                        {
                          check: /[0-9]/.test(newPassword),
                          text: "One number",
                        },
                      ].map((rule, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs">
                          <span
                            className={
                              rule.check ? "text-success" : "text-muted-foreground"
                            }
                          >
                            {rule.check ? "✓" : "○"}
                          </span>
                          <span
                            className={
                              rule.check
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }
                          >
                            {rule.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {errors.newPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input-field ${errors.confirmPassword ? "border-destructive ring-destructive/20" : ""}`}
                  placeholder="Re-enter new password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("request")}
                  disabled={isSubmitting}
                >
                  Change Email
                </Button>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Remembered your password?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
