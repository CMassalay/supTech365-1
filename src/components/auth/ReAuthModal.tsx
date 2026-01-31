import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Lock } from "lucide-react";
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
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const reAuthSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type ReAuthFormData = z.infer<typeof reAuthSchema>;

interface ReAuthModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  actionDescription?: string;
}

export function ReAuthModal({
  open,
  onSuccess,
  onCancel,
  actionDescription = "This action requires re-authentication for security.",
}: ReAuthModalProps) {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30); // 30 seconds timeout
  const [attemptCount, setAttemptCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReAuthFormData>({
    resolver: zodResolver(reAuthSchema),
  });

  // Countdown timer
  useEffect(() => {
    if (!open) return;

    setTimeRemaining(30);
    setAttemptCount(0);
    setError(null);
    reset();

    timeoutRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [open]);

  const handleTimeout = () => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
    }
    toast.error("Re-authentication timed out. Please try again.");
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: ReAuthFormData) => {
    if (timeRemaining <= 0) {
      handleTimeout();
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.reauthenticate(data.password);
      
      // Store grace period
      const gracePeriodExpiresAt = new Date(response.gracePeriodExpiresAt);
      localStorage.setItem("gracePeriodExpiresAt", gracePeriodExpiresAt.toISOString());
      
      toast.success("Re-authentication successful");
      onSuccess();
    } catch (err) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      if (err instanceof ApiError) {
        switch (err.code) {
          case "INVALID_PASSWORD":
            const remaining = err.data?.attemptsRemaining || 3 - newAttemptCount;
            if (remaining <= 0 || newAttemptCount >= 3) {
              // Force logout after 3 failed attempts
              toast.error("Too many failed re-authentication attempts. Please log in again.");
              await authApi.logout();
              window.location.href = "/login";
              return;
            }
            setError(`Incorrect password. Attempt ${newAttemptCount} of 3.`);
            break;
          case "TOO_MANY_ATTEMPTS":
            toast.error("Too many failed re-authentication attempts. Please log in again.");
            await authApi.logout();
            window.location.href = "/login";
            return;
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

  const handleCancel = () => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
    }
    onCancel();
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogContent
        className="sm:max-w-[400px]"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Confirm Your Identity
          </DialogTitle>
          <DialogDescription>{actionDescription}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="animate-in fade-in-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={user?.name || user?.email || ""}
              disabled
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus
                {...register("password")}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Time remaining: {formatTime(timeRemaining)}
            </div>
            {attemptCount > 0 && (
              <div className="text-muted-foreground">
                Attempt {attemptCount} of 3
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || timeRemaining <= 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
