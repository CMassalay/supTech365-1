import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Check, X, Copy } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { registrationApi, adminApi, ApiError, getValidationErrors } from "@/lib/api";
import type { CreateEntityUserResponse } from "@/lib/api";
import { validatePassword, validateEmail, validatePhone, validateUsername, type PasswordValidationResult } from "@/lib/password-validation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { ROLE_LABELS } from "@/types/roles";

const userCreationSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").max(100, "Name is too long"),
    username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username is too long"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    phone: z.string().optional(),
    role: z.string().min(1, "Please select a role"),
    entityId: z.string().min(1, "Please select an entity"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    requirePasswordChange: z.boolean().default(true),
    sendWelcomeEmail: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UserCreationFormData = z.infer<typeof userCreationSchema>;

export default function CreateUser() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createResult, setCreateResult] = useState<CreateEntityUserResponse | null>(null);
  const [entities, setEntities] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserCreationFormData>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      role: "compliance_officer",
      requirePasswordChange: true,
      sendWelcomeEmail: true,
    },
  });

  const username = watch("username");
  const password = watch("password");
  const role = watch("role");
  const entityId = watch("entityId");
  const sendWelcomeEmail = watch("sendWelcomeEmail");

  // Debounce username availability check
  const debouncedUsername = useDebounce(username, 500);

  // Load entities on mount (required for entity user creation)
  useEffect(() => {
    setIsLoadingEntities(true);
    registrationApi
      .getEntities({ limit: 500 })
      .then((response) => {
        console.log("Entities (Create User dropdown):", response);
        setEntities(
          (response.data || []).map((e) => ({
            id: e.id,
            name: e.name,
          }))
        );
      })
      .catch(() => {
        toast.error("Failed to load entities");
      })
      .finally(() => {
        setIsLoadingEntities(false);
      });
  }, []);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      if (!validateUsername(debouncedUsername)) {
        setUsernameAvailable(false);
        return;
      }

      setIsCheckingUsername(true);
      registrationApi
        .checkUsername(debouncedUsername)
        .then((response) => {
          setUsernameAvailable(response.available);
        })
        .catch(() => {
          setUsernameAvailable(null);
        })
        .finally(() => {
          setIsCheckingUsername(false);
        });
    } else {
      setUsernameAvailable(null);
    }
  }, [debouncedUsername]);

  // Validate password in real-time
  useEffect(() => {
    if (password && password.length > 0) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  const onSubmit = async (data: UserCreationFormData) => {
    // Validate all fields
    if (!validateEmail(data.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (data.phone && !validatePhone(data.phone)) {
      setError("Please enter a valid phone number");
      return;
    }
    if (!validateUsername(data.username)) {
      setError("Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens");
      return;
    }
    if (usernameAvailable === false) {
      setError("This username is already taken. Please choose another.");
      return;
    }
    if (!data.entityId) {
      setError("Please select an entity");
      return;
    }
    if (!passwordValidation || !passwordValidation.isValid) {
      setError("Password does not meet requirements. Please check the requirements above.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setValidationErrors([]);
    setIsLoading(true);

    try {
      const roleName = ROLE_LABELS[data.role as keyof typeof ROLE_LABELS] ?? data.role;
      const response = await adminApi.createEntityUser({
        entity_id: data.entityId,
        username: data.username,
        email: data.email,
        password: data.password,
        role_name: roleName,
        send_welcome_email: sendWelcomeEmail,
      });

      setCreateResult(response);
      setShowSuccessDialog(true);
      toast.success(response.message || `User '${data.username}' created successfully!`);
    } catch (err) {
      if (err instanceof ApiError) {
        setValidationErrors(getValidationErrors(err) ?? []);
        switch (err.code) {
          case "USERNAME_EXISTS":
            setError("This username is already taken. Please choose another.");
            break;
          case "EMAIL_EXISTS":
            setError("This email is already registered to another user.");
            break;
          case "WEAK_PASSWORD":
            setError("Password does not meet requirements. Please check the requirements above.");
            break;
          case "ENTITY_REQUIRED":
          case "ENTITY_NOT_FOUND":
            setError("Entity not found or inactive.");
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

  const handleCopyCredentials = () => {
    if (!createResult) return;
    const text = `Username: ${createResult.user.username}\nEmail: ${createResult.user.email}`;
    navigator.clipboard.writeText(text);
    toast.success("Details copied to clipboard");
  };

  const breadcrumbItems = [
    { label: "Administration", href: "/admin" },
    { label: "User Management", href: "/admin/users" },
    { label: "Create User", href: "/admin/users/create" },
  ];

  const roleOptions = [
    "reporting_entity",
    "compliance_officer",
    "head_of_compliance",
    "analyst",
    "head_of_analysis",
    "director_ops",
    "oic",
    "tech_admin",
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Create New User</h1>
            <p className="text-muted-foreground mt-1">Create a new user account for FIA staff</p>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in fade-in-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription asChild>
                <div>
                  <p className="font-medium">{error}</p>
                  {validationErrors.length > 0 && (
                    <ul className="list-disc list-inside text-sm mt-2">
                      {validationErrors.map((e, i) => (
                        <li key={i}>
                          {e.field.replace(/^body\s*->\s*/i, "").replace(/_/g, " ")}: {e.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* User Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">User Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register("fullName")}
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="johndoe"
                      {...register("username")}
                      aria-invalid={!!errors.username || usernameAvailable === false}
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!isCheckingUsername && usernameAvailable === true && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                      {!isCheckingUsername && usernameAvailable === false && (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-sm text-destructive">This username is already taken. Please choose another.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@fia.gov.lr"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+231 XX XXX XXXX"
                    {...register("phone")}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details Section */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Account Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={role}
                    onValueChange={(value) => setValue("role", value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((roleOption) => (
                        <SelectItem key={roleOption} value={roleOption}>
                          {ROLE_LABELS[roleOption as keyof typeof ROLE_LABELS]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entityId">Entity *</Label>
                  <Select
                    value={entityId || ""}
                    onValueChange={(value) => setValue("entityId", value)}
                    disabled={isLoadingEntities}
                  >
                    <SelectTrigger id="entityId">
                      <SelectValue placeholder={isLoadingEntities ? "Loading..." : "Select entity"} />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.entityId && (
                    <p className="text-sm text-destructive">{errors.entityId.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Password</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      {...register("confirmPassword")}
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

              {/* Password Requirements */}
              {passwordValidation && (
                <div className="space-y-2 p-4 bg-muted rounded-md">
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

              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requirePasswordChange"
                    {...register("requirePasswordChange")}
                    defaultChecked
                  />
                  <Label htmlFor="requirePasswordChange" className="text-sm font-normal cursor-pointer">
                    Require password change on first login
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendWelcomeEmail"
                    {...register("sendWelcomeEmail")}
                    defaultChecked
                  />
                  <Label htmlFor="sendWelcomeEmail" className="text-sm font-normal cursor-pointer">
                    Send welcome email to user
                  </Label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t">
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
                disabled={
                  isLoading ||
                  usernameAvailable === false ||
                  (passwordValidation !== null && !passwordValidation.isValid) ||
                  !entityId
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating user...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Created Successfully!</DialogTitle>
            <DialogDescription>
              User account has been created successfully.
            </DialogDescription>
          </DialogHeader>

          {createResult && (
            <div className="space-y-4">
              {createResult.message && (
                <p className="text-sm text-muted-foreground">{createResult.message}</p>
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium">User</p>
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <p><strong>User ID:</strong> {createResult.user.id}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(createResult.user.id);
                        toast.success("User ID copied to clipboard");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p><strong>Username:</strong> {createResult.user.username}</p>
                  <p><strong>Email:</strong> {createResult.user.email}</p>
                  <p><strong>Role:</strong> {createResult.user.role}</p>
                  <p><strong>Status:</strong> {createResult.user.account_status}</p>
                  <p><strong>Entity:</strong> {createResult.user.entity_name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Entity</p>
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  <p><strong>Name:</strong> {createResult.entity.name}</p>
                  <p><strong>Type:</strong> {createResult.entity.entity_type}</p>
                  <p><strong>Registration:</strong> {createResult.entity.registration_number}</p>
                </div>
              </div>
              {createResult.welcome_email && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Welcome email</p>
                  <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                    <p><strong>Sent:</strong> {createResult.welcome_email.email_sent ? "Yes" : "No"}</p>
                    {createResult.welcome_email.recipient_email && (
                      <p><strong>To:</strong> {createResult.welcome_email.recipient_email}</p>
                    )}
                    {createResult.welcome_email.message && (
                      <p className="text-muted-foreground">{createResult.welcome_email.message}</p>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleCopyCredentials}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    setCreateResult(null);
                  }}
                >
                  Create another
                </Button>
                <Button onClick={() => navigate("/entities")}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
