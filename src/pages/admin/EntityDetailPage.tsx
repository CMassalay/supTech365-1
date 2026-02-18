import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { registrationApi, entityApi } from "@/lib/api";
import type { Entity, UpdateEntityPayload, EntityUser } from "@/lib/api";
import { FileText, Pencil, Trash2, ArrowLeft, Copy, Users } from "lucide-react";
import { toast } from "sonner";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  entity_type: z.string().min(1, "Entity type is required"),
  registration_number: z.string().min(1, "Registration number is required"),
  contact_email: z.string().min(1, "Email is required").email("Invalid email"),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function EntityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [entityUsers, setEntityUsers] = useState<EntityUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: "",
      entity_type: "Bank",
      registration_number: "",
      contact_email: "",
    },
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    registrationApi
      .getEntity(id)
      .then((data) => {
        if (!cancelled) {
          setEntity(data);
          form.reset({
            name: data.name,
            entity_type: data.entity_type,
            registration_number: data.registration_number,
            contact_email: data.contact_email,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load entity.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setUsersError(null);
    setUsersLoading(true);
    entityApi
      .getEntityUsers(id)
      .then((users) => {
        if (!cancelled) setEntityUsers(users);
      })
      .catch(() => {
        if (!cancelled) setUsersError("Failed to load users.");
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onEditOpen = () => {
    if (entity) {
      form.reset({
        name: entity.name,
        entity_type: entity.entity_type,
        registration_number: entity.registration_number,
        contact_email: entity.contact_email,
      });
      setEditOpen(true);
    }
  };

  const onSaveEdit = form.handleSubmit(async (data) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const updated = await registrationApi.updateEntity(id, {
        name: data.name,
        entity_type: data.entity_type,
        registration_number: data.registration_number,
        contact_email: data.contact_email,
      });
      setEntity(updated);
      setEditOpen(false);
      toast.success("Entity updated successfully.");
    } catch {
      toast.error("Failed to update entity.");
    } finally {
      setIsSaving(false);
    }
  });

  const onDeactivate = async () => {
    if (!id) return;
    setIsDeactivating(true);
    try {
      const res = await registrationApi.deactivateEntity(id);
      toast.success(res.message || "Entity deactivated.");
      setDeactivateOpen(false);
      navigate("/entities", { replace: true });
    } catch {
      toast.error("Failed to deactivate entity.");
    } finally {
      setIsDeactivating(false);
    }
  };

  const breadcrumbItems = [
    { label: "Administration", href: "/" },
    { label: "Entities", link: "/entities" },
    { label: entity?.name ?? id ?? "Entity" },
  ];

  if (!id) {
    return (
      <MainLayout>
        <div className="p-6">
          <p className="text-destructive">Invalid entity ID.</p>
          <Button variant="link" asChild className="mt-2">
            <Link to="/entities">Back to Entities</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/entities">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Entity details
          </h1>
        </div>

        {error && (
          <Card className="border-destructive mb-6">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
              <Button variant="link" asChild className="mt-2 p-0">
                <Link to="/entities">Back to Entities</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading…
            </CardContent>
          </Card>
        )}

        {!isLoading && entity && (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{entity.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onEditOpen} disabled={!entity.is_active}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {entity.is_active && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeactivateOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">name</dt>
                    <dd className="font-medium">{entity.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">entity_type</dt>
                    <dd className="font-medium">{entity.entity_type}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">registration_number</dt>
                    <dd className="font-medium">{entity.registration_number}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">contact_email</dt>
                    <dd className="font-medium">{entity.contact_email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">is_active</dt>
                    <dd>
                      <span
                        className={
                          entity.is_active
                            ? "text-workflow-validated font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {entity.is_active ? "true" : "false"}
                      </span>
                    </dd>
                  </div>
                </dl>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">ID: {entity.id}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(entity.id);
                      toast.success("Entity ID copied to clipboard");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Entity users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading && (
                  <p className="text-sm text-muted-foreground py-4">Loading users…</p>
                )}
                {usersError && (
                  <p className="text-sm text-destructive py-4">{usersError}</p>
                )}
                {!usersLoading && !usersError && entityUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">No users for this entity.</p>
                )}
                {!usersLoading && !usersError && entityUsers.length > 0 && (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>User ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entityUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground truncate max-w-[12rem] sm:max-w-none" title={user.id}>
                                  {user.id}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.id);
                                    toast.success("User ID copied to clipboard");
                                  }}
                                  aria-label="Copy user ID"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Edit modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit entity</DialogTitle>
            <DialogDescription>Update the entity details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">name</Label>
              <Input id="edit-name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-entity_type">entity_type</Label>
              <Select
                value={form.watch("entity_type")}
                onValueChange={(v) => form.setValue("entity_type", v)}
              >
                <SelectTrigger id="edit-entity_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="MFI">MFI</SelectItem>
                  <SelectItem value="FinTech">FinTech</SelectItem>
                  <SelectItem value="MSB">MSB</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.entity_type && (
                <p className="text-sm text-destructive">{form.formState.errors.entity_type.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-registration_number">registration_number</Label>
              <Input id="edit-registration_number" {...form.register("registration_number")} />
              {form.formState.errors.registration_number && (
                <p className="text-sm text-destructive">{form.formState.errors.registration_number.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact_email">contact_email</Label>
              <Input id="edit-contact_email" type="email" {...form.register("contact_email")} />
              {form.formState.errors.contact_email && (
                <p className="text-sm text-destructive">{form.formState.errors.contact_email.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate entity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the entity and disable associated users. You can no longer use this entity for new submissions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDeactivate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeactivating}
            >
              {isDeactivating ? "Deactivating…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
