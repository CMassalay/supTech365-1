import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authApi, ApiError, getValidationErrors, getFriendlyErrorMessage } from "@/lib/api";
import { validatePassword, type PasswordValidationResult } from "@/lib/password-validation";
import { toast } from "sonner";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError: setFormError,
    clearErrors,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch("newPassword");

  // Validate password in real-time
  useEffect(() => {
    if (newPassword && newPassword.length > 0) {
      setPasswordValidation(validatePassword(newPassword));
    } else {
      setPasswordValidation(null);
    }
  }, [newPassword]);

  // Token expiration countdown (assuming 1 hour expiration)
  useEffect(() => {
    // In a real app, you'd get the expiration time from the token or API
    // For now, we'll simulate a 1-hour countdown
    const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hour from now

    const interval = setInterval(() => {
      const remaining = Math.max(0, expirationTime - Date.now());
      if (remaining === 0) {
        setTokenExpired(true);
        setTimeRemaining(null);
        clearInterval(interval);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(minutes * 60 + seconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    if (tokenExpired) {
      setError("Reset token has expired. Please request a new password reset.");
      return;
    }

    // Validate password requirements
    const validation = validatePassword(data.newPassword);
    if (!validation.isValid) {
      setError("Password does not meet requirements. Please check the requirements above.");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    clearErrors();
    setIsLoading(true);

    try {
      await authApi.resetPassword(token, data.newPassword, data.confirmPassword);
      toast.success("Password reset successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { state: { message: "Password reset successful. Please log in with your new password." } });
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        const details = getValidationErrors(err);
        const formFieldMap: Record<string, keyof ResetPasswordFormData> = {
          password: "newPassword",
          new_password: "newPassword",
          newPassword: "newPassword",
          confirm_password: "confirmPassword",
          confirmPassword: "confirmPassword",
        };
        if (details?.length) {
          details.forEach((e) => {
            const raw = e.field.replace(/^body\s*->\s*/i, "").trim();
            const field = formFieldMap[raw] ?? raw;
            if (field === "newPassword" || field === "confirmPassword") {
              setFormError(field, { type: "server", message: e.message });
            }
          });
        }
        switch (err.code) {
          case "INVALID_TOKEN":
            setError("Invalid or expired reset token. Please request a new password reset link.");
            setTokenExpired(true);
            break;
          case "EXPIRED_TOKEN":
            setError("Reset token has expired. Please request a new password reset.");
            setTokenExpired(true);
            break;
          case "WEAK_PASSWORD":
            setError("Password does not meet requirements. Please check the requirements above.");
            setFormError("newPassword", { type: "server", message: "Password does not meet all requirements." });
            break;
          case "PASSWORD_MISMATCH":
            setError("Passwords do not match.");
            setFormError("confirmPassword", { type: "server", message: "Passwords do not match." });
            break;
          case "PASSWORD_REUSE":
            setError("You cannot reuse your last 5 passwords. Please choose a different password.");
            setFormError("newPassword", { type: "server", message: "Choose a password you haven't used recently." });
            break;
          default:
            setError(details?.length ? "Please fix the errors below." : getFriendlyErrorMessage(err));
        }
      } else {
        setError("We couldn't reset your password. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenExpired && timeRemaining === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Reset token has expired. Please request a new password reset.
              </AlertDescription>
            </Alert>
            <Link to="/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-sm text-muted-foreground">Enter your new password below</p>
        </div>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {timeRemaining !== null && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Token expires in: {formatTime(timeRemaining)}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
                {...register("newPassword")}
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? "new-password-error" : "password-requirements"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p id="new-password-error" className="text-sm text-destructive" role="alert">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          {passwordValidation && (
            <div className="space-y-2 p-4 bg-muted rounded-md" id="password-requirements" role="group" aria-label="Password requirements">
              <p className="text-sm font-medium">Password Requirements:</p>
              <ul className="space-y-1 text-sm">
                {passwordValidation.requirements.map((req, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 ${
                      req.met ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    {req.met ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              tokenExpired ||
              (passwordValidation !== null && !passwordValidation.isValid)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <Link to="/login">
          <Button variant="ghost" className="w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
