import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authApi, entityApi } from "@/lib/api";
import type { Entity, EntityUser, EntityApiKey, UpdateEntityPayload } from "@/lib/api";
import { Building2, Pencil, Users, Key, Copy, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  entity_type: z.string().min(1, "Entity type is required"),
  registration_number: z.string().min(1, "Registration number is required"),
  contact_email: z.string().min(1, "Email is required").email("Invalid email"),
});

type UpdateFormData = z.infer<typeof updateSchema>;

function MyEntityPage() {
  const [entityId, setEntityId] = useState<string | null>(null);
  const [entityName, setEntityName] = useState<string | null>(null);
  /** From last successful PUT response; no GET entity in this API. */
  const [entityFromUpdate, setEntityFromUpdate] = useState<Entity | null>(null);
  const [users, setUsers] = useState<EntityUser[]>([]);
  const [apiKeys, setApiKeys] = useState<EntityApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [includeRevoked, setIncludeRevoked] = useState(false);

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
    let cancelled = false;
    setError(null);
    authApi
      .getProfile()
      .then((profile) => {
        const eid = (profile as { entity_id?: string | null }).entity_id ?? null;
        const ename = (profile as { entity_name?: string | null }).entity_name ?? null;
        if (cancelled) return;
        setEntityId(eid);
        setEntityName(ename);
        if (!eid) {
          setEntityFromUpdate(null);
          setUsers([]);
          setApiKeys([]);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load profile.");
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Pre-fill edit form when opening: use last PUT response or profile name. */
  useEffect(() => {
    if (!editOpen) return;
    const e = entityFromUpdate;
    form.reset({
      name: e?.name ?? entityName ?? "",
      entity_type: e?.entity_type ?? "Bank",
      registration_number: e?.registration_number ?? "",
      contact_email: e?.contact_email ?? "",
    });
  }, [editOpen, entityFromUpdate, entityName, form]);

  useEffect(() => {
    if (!entityId) return;
    entityApi.getEntityUsers(entityId).then(setUsers).catch(() => setUsers([]));
  }, [entityId]);

  useEffect(() => {
    if (!entityId) return;
    entityApi.getEntityApiKeys(entityId, includeRevoked).then(setApiKeys).catch(() => setApiKeys([]));
  }, [entityId, includeRevoked]);

  const onSaveEdit = form.handleSubmit(async (data) => {
    if (!entityId) return;
    setIsSaving(true);
    try {
      const updated = await entityApi.updateEntity(entityId, {
        name: data.name,
        entity_type: data.entity_type,
        registration_number: data.registration_number,
        contact_email: data.contact_email,
      });
      setEntityFromUpdate(updated);
      setEntityName(updated.name);
      setEditOpen(false);
      toast.success("Entity updated.");
    } catch {
      toast.error("Failed to update entity.");
    } finally {
      setIsSaving(false);
    }
  });

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <Building2 className="h-5 w-5" /> },
    { label: "My Entity" },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!entityId) {
    return (
      <MainLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You are not associated with an entity.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Breadcrumb items={breadcrumbItems} />
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            My Entity
          </h1>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit details
          </Button>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys ({apiKeys.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Entity information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="font-medium">{entityFromUpdate?.name ?? entityName ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">{entityFromUpdate?.entity_type ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Registration number</dt>
                      <dd className="font-medium">{entityFromUpdate?.registration_number ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Contact email</dt>
                      <dd className="font-medium">{entityFromUpdate?.contact_email ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">{entityFromUpdate != null ? (entityFromUpdate.is_active ? "Active" : "Inactive") : "—"}</dd>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs">{entityId}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (entityId) {
                            navigator.clipboard.writeText(entityId);
                            toast.success("Entity ID copied");
                          }
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Entity users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No users found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last login</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.username}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.role ?? "—"}</TableCell>
                            <TableCell>{u.account_status ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {u.last_login ? new Date(u.last_login).toLocaleString() : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API keys
                  </CardTitle>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={includeRevoked}
                      onChange={(e) => setIncludeRevoked(e.target.checked)}
                      className="rounded border-input"
                    />
                    Include revoked
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No API keys found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Prefix</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Expires</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((k) => (
                          <TableRow key={k.id}>
                            <TableCell className="font-medium">{k.key_name}</TableCell>
                            <TableCell className="font-mono text-xs">{k.key_prefix ?? "—"}</TableCell>
                            <TableCell>
                              <span className={k.is_active ? "text-green-600" : "text-muted-foreground"}>
                                {k.is_active ? "Active" : "Revoked"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {k.created_at ? new Date(k.created_at).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit entity</DialogTitle>
            <DialogDescription>Update your entity details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-entity_type">Entity type</Label>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-registration_number">Registration number</Label>
              <Input id="edit-registration_number" {...form.register("registration_number")} />
              {form.formState.errors.registration_number && (
                <p className="text-sm text-destructive">{form.formState.errors.registration_number.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact_email">Contact email</Label>
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
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default MyEntityPage;
