import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Copy, Check, X, RefreshCw } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { registrationApi, ApiError, getValidationErrors, getFriendlyErrorMessage } from "@/lib/api";
import { validatePassword, generateStrongPassword, type PasswordValidationResult } from "@/lib/password-validation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const ENTITY_TYPES = ["Bank", "MFI", "FinTech", "Insurance", "Casino", "Other"] as const;

const schema = z
  .object({
    entity_name: z.string().min(1, "Entity name is required"),
    entity_type: z.string().min(1, "Entity type is required"),
    registration_number: z.string().min(1, "Registration number is required"),
    contact_email: z.string().min(1, "Contact email is required").email("Please enter a valid email"),
    contact_phone: z.string().min(1, "Contact phone is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().min(1, "Login email is required").email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    issue_api_credentials: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => validatePassword(data.password).isValid, {
    message: "Password does not meet all strength criteria",
    path: ["password"],
  });

type FormData = z.infer<typeof schema>;

/** Normalize backend field name to form field key (e.g. "body -> entity_name" -> "entity_name") */
function normalizeFieldKey(field: string): string {
  return field.replace(/^body\s*->\s*/i, "").trim();
}

export default function RegisterEntity() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    entity?: { name: string; entity_type: string; registration_number: string; contact_email: string };
    user?: { username: string; email: string };
    message?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError: setFormError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      entity_type: "Bank",
      issue_api_credentials: false,
    },
  });

  const entity_type = watch("entity_type");
  const password = watch("password");

  useEffect(() => {
    if (password && password.length > 0) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  const handleGeneratePassword = () => {
    const pwd = generateStrongPassword(16);
    setValue("password", pwd);
    setValue("confirmPassword", pwd);
    setPasswordValidation(validatePassword(pwd));
    toast.success("Strong password generated. You can copy it below.");
  };

  const handleCopyPassword = async () => {
    const pwd = watch("password");
    if (!pwd) return;
    try {
      await navigator.clipboard.writeText(pwd);
      setCopiedPassword(true);
      toast.success("Password copied to clipboard");
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setValidationErrors([]);
    clearErrors();
    setIsLoading(true);
    try {
      const response = await registrationApi.registerEntity({
        entity_name: data.entity_name,
        entity_type: data.entity_type,
        registration_number: data.registration_number,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        username: data.username,
        email: data.email,
        password: data.password,
        issue_api_credentials: data.issue_api_credentials ?? false,
      });
      setRegistrationData({
        entity: response.entity
          ? {
              name: response.entity.name,
              entity_type: response.entity.entity_type,
              registration_number: response.entity.registration_number,
              contact_email: response.entity.contact_email,
            }
          : undefined,
        user: response.user
          ? { username: response.user.username, email: response.user.email }
          : undefined,
        message: response.message,
      });
      setShowSuccessDialog(true);
      toast.success(response.message || "Registration successful");
    } catch (err) {
      if (err instanceof ApiError) {
        const friendlyMessage = getFriendlyErrorMessage(err);
        setError(friendlyMessage);
        const details = getValidationErrors(err);
        setValidationErrors(details ?? []);
        if (details?.length) {
          details.forEach((e) => {
            const field = normalizeFieldKey(e.field) as keyof FormData;
            if (["entity_name", "entity_type", "registration_number", "contact_email", "contact_phone", "username", "email", "password", "confirmPassword"].includes(field)) {
              setFormError(field, { type: "server", message: e.message });
            }
          });
          toast.error("Please fix the errors in the form.");
        } else {
          toast.error(friendlyMessage);
        }
      } else {
        setError("We couldn't complete your request. Please check your connection and try again.");
        setValidationErrors([]);
        toast.error("Connection error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Administration", href: "/admin" },
    { label: "Register Entity", href: "/admin/entities/register" },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white dark:bg-card rounded-lg shadow-sm border p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription asChild>
                <div className="space-y-2">
                  <p className="font-medium">{error.split("\n")[0]}</p>
                  {validationErrors.length > 0 ? (
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      {validationErrors.map((e, i) => (
                        <li key={i}>
                          <span className="font-medium">
                            {e.field.replace(/^body\s*->\s*/i, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}:
                          </span>{" "}
                          {e.message}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    error.includes("\n• ") && (
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        {error
                          .split("\n• ")
                          .slice(1)
                          .map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                      </ul>
                    )
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entity_name">Entity name</Label>
                <Input
                  id="entity_name"
                  {...register("entity_name")}
                  placeholder="Legal or trading name"
                  aria-invalid={!!errors.entity_name}
                />
                {errors.entity_name && (
                  <p className="text-sm text-destructive">{errors.entity_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity_type">Entity type</Label>
                <Select
                  value={entity_type}
                  onValueChange={(v) => setValue("entity_type", v)}
                >
                  <SelectTrigger id="entity_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.entity_type && (
                  <p className="text-sm text-destructive">{errors.entity_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration number</Label>
                <Input
                  id="registration_number"
                  {...register("registration_number")}
                  placeholder="Official registration number"
                  aria-invalid={!!errors.registration_number}
                />
                {errors.registration_number && (
                  <p className="text-sm text-destructive">{errors.registration_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register("contact_email")}
                  placeholder="General contact address"
                  aria-invalid={!!errors.contact_email}
                />
                {errors.contact_email && (
                  <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact phone</Label>
                <Input
                  id="contact_phone"
                  {...register("contact_phone")}
                  placeholder="Main contact number"
                  aria-invalid={!!errors.contact_phone}
                />
                {errors.contact_phone && (
                  <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="Login username"
                  aria-invalid={!!errors.username}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Login email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Email used to sign in"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">This email will be used to sign in to the platform.</p>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        aria-invalid={!!errors.password}
                        className="pr-20"
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={handleCopyPassword}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded"
                          title="Copy password"
                        >
                          {copiedPassword ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={handleGeneratePassword} title="Generate strong password">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  {passwordValidation && (
                    <>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted">
                        <div
                          className={`h-full transition-all ${
                            passwordValidation.strength === "strong"
                              ? "bg-green-500 w-full"
                              : passwordValidation.strength === "medium"
                                ? "bg-amber-500 w-2/3"
                                : "bg-destructive/70 w-1/3"
                          }`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Strength: <span className="capitalize font-medium">{passwordValidation.strength}</span>
                      </p>
                      {passwordValidation.strength !== "strong" && (
                        <div className="p-3 rounded-md bg-muted/60 space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">Password criteria</p>
                          <ul className="space-y-1 text-sm">
                            {passwordValidation.requirements.map((req, i) => (
                              <li key={i} className={`flex items-center gap-2 ${req.met ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}`}>
                                {req.met ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
                                <span>{req.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="Re-enter password"
                      aria-invalid={!!errors.confirmPassword}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="issue_api_credentials"
                {...register("issue_api_credentials")}
              />
              <Label htmlFor="issue_api_credentials" className="text-sm font-normal cursor-pointer">
                Issue API credentials for this entity
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (passwordValidation !== null && !passwordValidation.isValid)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registration successful</DialogTitle>
          </DialogHeader>
          {registrationData && (
            <div className="space-y-3 text-sm">
              {registrationData.entity && (
                <div className="space-y-1">
                  <p><span className="font-medium">Entity name:</span> {registrationData.entity.name}</p>
                  <p><span className="font-medium">Entity type:</span> {registrationData.entity.entity_type}</p>
                  <p><span className="font-medium">Registration number:</span> {registrationData.entity.registration_number}</p>
                  <p><span className="font-medium">Contact email:</span> {registrationData.entity.contact_email}</p>
                </div>
              )}
              {registrationData.user && (
                <div className="space-y-1">
                  <p><span className="font-medium">Username:</span> {registrationData.user.username}</p>
                  <p><span className="font-medium">Login email:</span> {registrationData.user.email}</p>
                </div>
              )}
              {registrationData.message && (
                <p className="text-muted-foreground">{registrationData.message}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSuccessDialog(false); window.location.reload(); }}>
              Register another
            </Button>
            <Button onClick={() => navigate("/")}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
