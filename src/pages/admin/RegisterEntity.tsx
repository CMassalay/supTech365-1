import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
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
import { registrationApi, ApiError, getValidationErrors } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  entity_name: z.string().min(1, "Required"),
  entity_type: z.string().min(1, "Required"),
  registration_number: z.string().min(1, "Required"),
  contact_email: z.string().min(1, "Required").email("Invalid email"),
  contact_phone: z.string().min(1, "Required"),
  username: z.string().min(1, "Required"),
  email: z.string().min(1, "Required").email("Invalid email"),
  password: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterEntity() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      entity_type: "Bank",
    },
  });

  const entity_type = watch("entity_type");

  const onSubmit = async (data: FormData) => {
    setError(null);
    setValidationErrors([]);
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
      });
      console.log("Register entity response:", response);
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
        setError(err.message || "Registration failed");
        const details = getValidationErrors(err);
        setValidationErrors(details ?? []);
        if (details?.length) {
          toast.error("Please fix the validation errors below.");
        }
      } else {
        setError("Connection error. Please try again.");
        setValidationErrors([]);
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
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="MFI">MFI</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="MSB">MSB</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
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
              <Button type="submit" disabled={isLoading}>
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
