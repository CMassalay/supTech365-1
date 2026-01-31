import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Check, X, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authApi, ApiError } from "@/lib/api";
import { validatePassword, type PasswordValidationResult } from "@/lib/password-validation";
import { toast } from "sonner";

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(1, "New password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeModalProps {
  open: boolean;
  onSuccess: () => void;
}

export function PasswordChangeModal({ open, onSuccess }: PasswordChangeModalProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
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

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset();
      setError(null);
      setPasswordValidation(null);
    }
  }, [open, reset]);

  const onSubmit = async (data: PasswordChangeFormData) => {
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
    setIsLoading(true);

    try {
      await authApi.changePassword(data.currentPassword, data.newPassword, data.confirmPassword);
      toast.success("Password changed successfully!");
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "INVALID_PASSWORD":
            setError("Current password is incorrect. Please try again.");
            break;
          case "WEAK_PASSWORD":
            setError("Password does not meet requirements. Please check the requirements above.");
            break;
          case "PASSWORD_MISMATCH":
            setError("Passwords do not match.");
            break;
          case "PASSWORD_REUSE":
            setError("You cannot reuse your last 5 passwords. Please choose a different password.");
            break;
          default:
            setError(err.message || "An unexpected error occurred. Please try again.");
        }
      } else {
        setError("Connection error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogContent
        className="sm:max-w-[500px]"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Your Password
          </DialogTitle>
          <DialogDescription>
            For security reasons, you must change your password before accessing the system.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                autoComplete="current-password"
                autoFocus
                {...register("currentPassword")}
                aria-invalid={!!errors.currentPassword}
                aria-describedby={errors.currentPassword ? "current-password-error" : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p id="current-password-error" className="text-sm text-destructive" role="alert">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

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

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <p>Note: You cannot access the system until you change your password.</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (passwordValidation !== null && !passwordValidation.isValid)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Changing password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
