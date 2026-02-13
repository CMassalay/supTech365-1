import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, AlertCircle, Shield } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi, ApiError, getValidationErrors } from "@/lib/api";
import { toast } from "sonner";

const schema = z.object({
  username: z.string().min(1, "Required"),
  email: z.string().min(1, "Required").email("Invalid email"),
  password: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

export default function CreateSuperAdmin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setValidationErrors([]);
    setIsLoading(true);
    try {
      const result = await adminApi.createSuperAdmin({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success(`Super admin "${result.username}" created successfully.`);
      navigate("/admin/roles");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to create super admin");
        setValidationErrors(getValidationErrors(err) ?? []);
      } else {
        setError("Connection error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Administration", href: "/" },
    { label: "Create Super Admin", href: "/admin/super-admin" },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6 max-w-2xl">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Create Super Admin</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Bootstrap the first super admin account. In production this should be protected or disabled after initial setup.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription asChild>
                <div className="space-y-2">
                  <p className="font-medium">{error.split("\n")[0]}</p>
                  {validationErrors.length > 0 && (
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
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} placeholder="Login username" aria-invalid={!!errors.username} />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="user@example.com" aria-invalid={!!errors.email} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="pr-10"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Super Admin"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
