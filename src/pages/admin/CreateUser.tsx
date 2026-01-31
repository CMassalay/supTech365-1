import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Check, X, Copy, Mail, ExternalLink } from "lucide-react";
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
import { registrationApi, ApiError } from "@/lib/api";
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
    entityId: z.string().optional(),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    requirePasswordChange: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.role !== "reporting_entity" || (data.entityId && data.entityId.length > 0), {
    message: "Please select a reporting entity",
    path: ["entityId"],
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
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [entities, setEntities] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);

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
    },
  });

  const username = watch("username");
  const password = watch("password");
  const role = watch("role");
  const entityId = watch("entityId");

  // Debounce username availability check
  const debouncedUsername = useDebounce(username, 500);

  // Load entities when role is Reporting Entity User
  useEffect(() => {
    if (role === "reporting_entity") {
      setIsLoadingEntities(true);
      registrationApi
        .getEntities("active")
        .then((response) => {
          setEntities(
            response.entities.map((e) => ({
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
    } else {
      setEntities([]);
      setValue("entityId", undefined);
    }
  }, [role, setValue]);

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
    if (role === "reporting_entity" && !data.entityId) {
      setError("Please select a reporting entity");
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
    setIsLoading(true);

    try {
      const response = await registrationApi.createUser({
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        phone: data.phone,
        role: data.role,
        entityId: data.entityId,
        password: data.password,
        confirmPassword: data.confirmPassword,
        requirePasswordChange: data.requirePasswordChange,
      });

      setRegistrationData(response.data);
      setShowSuccessDialog(true);
      toast.success(`User '${data.username}' created successfully!`);
    } catch (err) {
      if (err instanceof ApiError) {
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
          case "PASSWORD_MISMATCH":
            setError("Passwords do not match.");
            break;
          case "ENTITY_REQUIRED":
            setError("Entity is required for Reporting Entity User role.");
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
    if (!registrationData) return;
    const text = `Username: ${registrationData.credentials.username}\nPassword: ${registrationData.credentials.password || "N/A"}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard");
  };

  const handleSendWelcomeEmail = async () => {
    // This would call an API endpoint to send welcome email
    toast.info("Welcome email functionality would be implemented here");
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
              <AlertDescription>{error}</AlertDescription>
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

                {role === "reporting_entity" && (
                  <div className="space-y-2">
                    <Label htmlFor="entityId">Entity *</Label>
                    <Select
                      value={entityId || ""}
                      onValueChange={(value) => setValue("entityId", value)}
                      disabled={isLoadingEntities}
                    >
                      <SelectTrigger id="entityId">
                        <SelectValue placeholder={isLoadingEntities ? "Loading..." : "Select reporting entity"} />
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
                )}
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
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/users/all")}
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
                  (role === "reporting_entity" && !entityId)
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

          {registrationData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">User Details:</p>
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  <p><strong>User ID:</strong> {registrationData.user.id}</p>
                  <p><strong>Full Name:</strong> {registrationData.user.fullName}</p>
                  <p><strong>Username:</strong> {registrationData.user.username}</p>
                  <p><strong>Email:</strong> {registrationData.user.email}</p>
                  <p><strong>Role:</strong> {ROLE_LABELS[registrationData.user.role as keyof typeof ROLE_LABELS]}</p>
                  {registrationData.user.entityId && (
                    <p><strong>Entity:</strong> {registrationData.user.entityId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Credentials:</p>
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  <p><strong>Username:</strong> {registrationData.credentials.username}</p>
                  {registrationData.credentials.password && (
                    <p><strong>Password:</strong> {registrationData.credentials.password}</p>
                  )}
                </div>
                {registrationData.user.requiresPasswordChange && (
                  <p className="text-sm text-yellow-600">User must change password on first login</p>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleCopyCredentials}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Credentials
                </Button>
                <Button variant="outline" onClick={handleSendWelcomeEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Welcome Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/users/${registrationData.user.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    window.location.reload();
                  }}
                >
                  Create Another
                </Button>
                <Button onClick={() => navigate("/admin/users/all")}>
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
