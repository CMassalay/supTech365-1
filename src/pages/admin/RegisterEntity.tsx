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

const entityRegistrationSchema = z
  .object({
    // Entity Information
    entityName: z.string().min(1, "Entity name is required").max(255, "Entity name is too long"),
    entityType: z.string().min(1, "Please select an entity type"),
    entityTypeOther: z.string().optional(),
    registrationNumber: z.string().min(1, "Registration number is required"),
    contactEmail: z.string().min(1, "Contact email is required").email("Please enter a valid email address"),
    contactPhone: z.string().min(1, "Contact phone is required"),
    
    // Primary Contact
    primaryContactName: z.string().min(1, "Full name is required").max(100, "Name is too long"),
    primaryContactEmail: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    primaryContactPhone: z.string().min(1, "Phone is required"),
    
    // Initial User Account
    username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username is too long"),
    userEmail: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.entityType !== "Other" || (data.entityTypeOther && data.entityTypeOther.length > 0), {
    message: "Please specify entity type",
    path: ["entityTypeOther"],
  });

type EntityRegistrationFormData = z.infer<typeof entityRegistrationSchema>;

export default function RegisterEntity() {
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EntityRegistrationFormData>({
    resolver: zodResolver(entityRegistrationSchema),
    defaultValues: {
      entityType: "Bank",
    },
  });

  const username = watch("username");
  const password = watch("password");
  const entityType = watch("entityType");

  // Debounce username availability check
  const debouncedUsername = useDebounce(username, 500);

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

  const onSubmit = async (data: EntityRegistrationFormData) => {
    // Validate all fields
    if (!validateEmail(data.contactEmail)) {
      setError("Please enter a valid contact email address");
      return;
    }
    if (!validateEmail(data.primaryContactEmail)) {
      setError("Please enter a valid primary contact email address");
      return;
    }
    if (!validateEmail(data.userEmail)) {
      setError("Please enter a valid user email address");
      return;
    }
    if (!validatePhone(data.contactPhone)) {
      setError("Please enter a valid contact phone number");
      return;
    }
    if (!validatePhone(data.primaryContactPhone)) {
      setError("Please enter a valid primary contact phone number");
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
      const response = await registrationApi.registerEntity({
        entity_name: data.entityName,
        entity_type: data.entityType === "Other" ? data.entityTypeOther || "Other" : data.entityType,
        registration_number: data.registrationNumber,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        primary_contact_name: data.primaryContactName,
        primary_contact_email: data.primaryContactEmail,
        primary_contact_phone: data.primaryContactPhone,
        username: data.username,
        email: data.userEmail,
        password: data.password,
      });

      setRegistrationData({ ...response, createdPassword: data.password });
      setShowSuccessDialog(true);
      toast.success(`Entity '${data.entityName}' and user account '${data.username}' created successfully!`);
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case "REGISTRATION_NUMBER_EXISTS":
            setError("This registration number is already in use. Please use a different number.");
            break;
          case "USERNAME_EXISTS":
            setError("This username is already taken. Please choose another.");
            break;
          case "EMAIL_EXISTS":
            setError("This email is already registered to another user/entity.");
            break;
          case "WEAK_PASSWORD":
            setError("Password does not meet requirements. Please check the requirements above.");
            break;
          case "PASSWORD_MISMATCH":
            setError("Passwords do not match.");
            break;
          case "VALIDATION_ERROR":
            setError(err.message || "Please check the form and try again.");
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
    const pwd = registrationData.createdPassword ?? "";
    const text = `Username: ${registrationData.user?.username ?? ""}\nPassword: ${pwd || "N/A"}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard");
  };

  const handleSendWelcomeEmail = async () => {
    // This would call an API endpoint to send welcome email
    toast.info("Welcome email functionality would be implemented here");
  };

  const breadcrumbItems = [
    { label: "Administration", href: "/admin" },
    { label: "Reporting Entity Management", href: "/admin/entities" },
    { label: "Register New Entity", href: "/admin/entities/register" },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Register New Reporting Entity</h1>
            <p className="text-muted-foreground mt-1">Create a new reporting entity and initial user account</p>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in fade-in-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Entity Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Entity Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entityName">Entity Name *</Label>
                  <Input
                    id="entityName"
                    placeholder="e.g., Bank of Monrovia"
                    {...register("entityName")}
                    aria-invalid={!!errors.entityName}
                  />
                  {errors.entityName && (
                    <p className="text-sm text-destructive">{errors.entityName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entityType">Entity Type *</Label>
                  <Select
                    value={entityType}
                    onValueChange={(value) => setValue("entityType", value)}
                  >
                    <SelectTrigger id="entityType">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="MFI">Microfinance Institution (MFI)</SelectItem>
                      <SelectItem value="FinTech">FinTech</SelectItem>
                      <SelectItem value="MSB">Money Service Business (MSB)</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.entityType && (
                    <p className="text-sm text-destructive">{errors.entityType.message}</p>
                  )}
                </div>

                {entityType === "Other" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="entityTypeOther">Specify Entity Type *</Label>
                    <Input
                      id="entityTypeOther"
                      placeholder="Enter entity type"
                      {...register("entityTypeOther")}
                      aria-invalid={!!errors.entityTypeOther}
                    />
                    {errors.entityTypeOther && (
                      <p className="text-sm text-destructive">{errors.entityTypeOther.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="e.g., REG-2024-001"
                    {...register("registrationNumber")}
                    aria-invalid={!!errors.registrationNumber}
                  />
                  {errors.registrationNumber && (
                    <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="entity@example.com"
                    {...register("contactEmail")}
                    aria-invalid={!!errors.contactEmail}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+231 XX XXX XXXX"
                    {...register("contactPhone")}
                    aria-invalid={!!errors.contactPhone}
                  />
                  {errors.contactPhone && (
                    <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Contact Section */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Primary Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryContactName">Full Name *</Label>
                  <Input
                    id="primaryContactName"
                    placeholder="John Doe"
                    {...register("primaryContactName")}
                    aria-invalid={!!errors.primaryContactName}
                  />
                  {errors.primaryContactName && (
                    <p className="text-sm text-destructive">{errors.primaryContactName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryContactEmail">Email *</Label>
                  <Input
                    id="primaryContactEmail"
                    type="email"
                    placeholder="contact@example.com"
                    {...register("primaryContactEmail")}
                    aria-invalid={!!errors.primaryContactEmail}
                  />
                  {errors.primaryContactEmail && (
                    <p className="text-sm text-destructive">{errors.primaryContactEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryContactPhone">Phone *</Label>
                  <Input
                    id="primaryContactPhone"
                    placeholder="+231 XX XXX XXXX"
                    {...register("primaryContactPhone")}
                    aria-invalid={!!errors.primaryContactPhone}
                  />
                  {errors.primaryContactPhone && (
                    <p className="text-sm text-destructive">{errors.primaryContactPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Initial User Account Section */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">Initial User Account</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="userEmail">Email *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="user@example.com"
                    {...register("userEmail")}
                    aria-invalid={!!errors.userEmail}
                  />
                  {errors.userEmail && (
                    <p className="text-sm text-destructive">{errors.userEmail.message}</p>
                  )}
                </div>

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

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value="Reporting Entity User"
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">Auto-assigned, cannot be changed</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/entities/all")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  usernameAvailable === false ||
                  (passwordValidation !== null && !passwordValidation.isValid)
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Entity & Create User"
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
            <DialogTitle>Registration Successful!</DialogTitle>
            <DialogDescription>
              Entity and user account have been created successfully.
            </DialogDescription>
          </DialogHeader>

          {registrationData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Entity Details:</p>
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  <p><strong>Entity ID:</strong> {registrationData.entity?.id}</p>
                  <p><strong>Entity Name:</strong> {registrationData.entity?.name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">User Account:</p>
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  <p><strong>Username:</strong> {registrationData.user?.username}</p>
                  <p><strong>Email:</strong> {registrationData.user?.email}</p>
                </div>
                <p className="text-sm text-muted-foreground">User must change password on first login.</p>
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
                  onClick={() => navigate(`/admin/entities/${registrationData.entity.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Entity
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    window.location.reload();
                  }}
                >
                  Register Another
                </Button>
                <Button onClick={() => navigate("/admin/entities/all")}>
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
