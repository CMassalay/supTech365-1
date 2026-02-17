import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail, validateUsername } from "@/lib/password-validation";
import { mapBackendRole, type UserRole } from "@/types/roles";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

/** Only use returnUrl if it belongs to the logged-in role's workspace (avoids sending e.g. reporting entity to /compliance/dashboards). */
function isReturnUrlAllowedForRole(returnUrl: string, role: UserRole): boolean {
  const path = returnUrl.split("?")[0];
  if (role === "reporting_entity") {
    const allowed = ["/", "/submit", "/submissions", "/resubmissions", "/statistics", "/my-entity", "/api-credentials"];
    return allowed.some((p) => path === p || (p !== "/" && path.startsWith(p + "/")));
  }
  if (role === "compliance_officer" || role === "head_of_compliance") {
    return path === "/" || path.startsWith("/compliance");
  }
  if (role === "analyst" || role === "head_of_analysis") {
    return path === "/" || path.startsWith("/analysis") || path.startsWith("/my-assignments") || path.startsWith("/subjects");
  }
  if (role === "tech_admin" || role === "super_admin") {
    return true;
  }
  return path === "/" || path.startsWith("/");
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutExpiresAt, setLockoutExpiresAt] = useState<Date | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Auto-focus username field on mount
  useEffect(() => {
    setFocus("username");
  }, [setFocus]);

  // Update lockout countdown
  useEffect(() => {
    if (!lockoutExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = lockoutExpiresAt.getTime() - now.getTime();
      if (diff <= 0) {
        setLockoutExpiresAt(null);
        setRemainingMinutes(null);
        setError(null);
      } else {
        setRemainingMinutes(Math.ceil(diff / 60000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutExpiresAt]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate username/email format
      const isEmail = data.username.includes("@");
      if (isEmail && !validateEmail(data.username)) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      if (!isEmail && !validateUsername(data.username)) {
        setError("Please enter a valid username");
        setIsLoading(false);
        return;
      }

      const response = await authApi.login(data.username, data.password, data.rememberMe);

      // Store token and user; login() uses setStoredToken internally via login()
      login(
        response.user,
        response.access_token,
        response.session_id,
        data.rememberMe,
        response.password_change_required ?? false
      );

      if (response.password_change_required) {
        navigate("/change-password-required");
        return;
      }
      toast.success(`Welcome back, ${response.user.username}!`);

      const role = mapBackendRole(response.user.role);
      const roleRoutes: Record<string, string> = {
        reporting_entity: "/submissions",
        compliance_officer: "/compliance/validation",
        head_of_compliance: "/compliance/dashboards/processing",
        analyst: "/analysis-queue",
        head_of_analysis: "/analysis-queue",
        director_ops: "/",
        oic: "/",
        tech_admin: "/",
        super_admin: "/",
      };
      const defaultRoute = roleRoutes[role] ?? "/";

      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl && returnUrl.startsWith("/") && isReturnUrlAllowedForRole(returnUrl, role)) {
        navigate(returnUrl);
      } else {
        navigate(defaultRoute);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "INVALID_CREDENTIALS":
            setError("Invalid username or password. Please try again.");
            break;
          case "ACCOUNT_LOCKED":
            const lockoutTime = err.data?.lockoutExpiresAt
              ? new Date(err.data.lockoutExpiresAt)
              : null;
            const minutes = err.data?.remainingMinutes || null;
            setLockoutExpiresAt(lockoutTime);
            setRemainingMinutes(minutes);
            setError(
              `Account locked due to multiple failed login attempts. Please try again in ${minutes} minutes.`
            );
            break;
          case "ACCOUNT_DISABLED":
            setError("Your account has been disabled. Please contact support at support@fia.gov.lr");
            break;
          case "RATE_LIMIT_EXCEEDED":
            const retryAfter = err.data?.retryAfter || 60;
            setError(`Too many login attempts. Please try again in ${retryAfter} seconds.`);
            break;
          case "SESSION_EXPIRED":
            setError("Your session has expired. Please log in again.");
            break;
          default:
            setError(err.message || "An unexpected error occurred. Please try again.");
        }
      } else {
        setError("Connection error. Please check your internet connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4 py-8">
      <div className="w-full max-w-md space-y-8 bg-card border border-border/80 p-8 rounded-xl shadow-soft-lg">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="h-11 w-11 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-xl">FIA</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">SupTech365</h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in fade-in-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Lockout Countdown */}
        {lockoutExpiresAt && remainingMinutes !== null && (
          <Alert className="bg-warning/10 border-warning/30 text-foreground">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-foreground">
              Account locked. Please try again in {remainingMinutes} minute{remainingMinutes !== 1 ? "s" : ""}.
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username/Email</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username or email"
              autoComplete="username"
              autoFocus
              {...register("username")}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            {errors.username && (
              <p id="username-error" className="text-sm text-destructive" role="alert">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                {...register("rememberMe")}
                aria-describedby="remember-me-description"
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
                id="remember-me-description"
              >
                Remember me
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (lockoutExpiresAt !== null && remainingMinutes !== null && remainingMinutes > 0)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground border-t border-border pt-4">
          <p>Need help? Contact: support@fia.gov.lr</p>
        </div>
      </div>
    </div>
  );
}
