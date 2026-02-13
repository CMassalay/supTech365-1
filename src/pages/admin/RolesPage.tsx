import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminApi, ApiError, getValidationErrors } from "@/lib/api";
import type { Role } from "@/lib/api";
import { Shield, Plus, Pencil, Trash2, UserPlus, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getRoles({ page, size });
      setRoles(res.items ?? []);
      setTotal(res.total ?? 0);
      setPage(res.page ?? page);
      setPages(res.pages ?? 1);
    } catch {
      setRoles([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, [page]);

  useEffect(() => {
    adminApi.getAvailablePermissions().then(setAvailablePermissions).catch(() => setAvailablePermissions([]));
  }, []);

  const breadcrumbItems = [
    { label: "Administration", href: "/" },
    { label: "Roles" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Roles
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadRoles} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Role to User
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              {total} role{total !== 1 ? "s" : ""} total
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No roles found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      roles.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{r.description || "—"}</TableCell>
                          <TableCell>{r.user_count}</TableCell>
                          <TableCell className="max-w-[200px]">
                            <span className="text-xs text-muted-foreground">
                              {r.permissions?.length ? r.permissions.join(", ") : "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditRole(r)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteRole(r)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {pages}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateRoleModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        availablePermissions={availablePermissions}
        onSuccess={() => {
          setCreateOpen(false);
          loadRoles();
        }}
      />

      {editRole && (
        <EditRoleModal
          role={editRole}
          open={!!editRole}
          onOpenChange={(open) => !open && setEditRole(null)}
          availablePermissions={availablePermissions}
          onSuccess={() => {
            setEditRole(null);
            loadRoles();
          }}
        />
      )}

      {deleteRole && (
        <DeleteRoleModal
          role={deleteRole}
          open={!!deleteRole}
          onOpenChange={(open) => !open && setDeleteRole(null)}
          onSuccess={() => {
            setDeleteRole(null);
            loadRoles();
          }}
        />
      )}

      <AssignRoleModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        roles={roles}
        onSuccess={() => {
          setAssignOpen(false);
          loadRoles();
        }}
      />
    </MainLayout>
  );
}

function CreateRoleModal({
  open,
  onOpenChange,
  availablePermissions,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePermissions: string[];
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  const reset = () => {
    setName("");
    setDescription("");
    setPermissions([]);
    setError(null);
    setValidationErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setIsLoading(true);
    try {
      await adminApi.createRole({ name: name.trim(), description: description.trim(), permissions });
      toast.success("Role created.");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to create role");
        setValidationErrors(getValidationErrors(err) ?? []);
      } else {
        setError("Request failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (p: string) => {
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>Add a new role with optional permissions.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {validationErrors.length > 0 && (
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {validationErrors.map((e, i) => (
                      <li key={i}>{e.field}: {e.message}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Role name" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {availablePermissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                availablePermissions.map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.includes(p)}
                      onChange={() => togglePermission(p)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{p}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditRoleModal({
  role,
  open,
  onOpenChange,
  availablePermissions,
  onSuccess,
}: {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePermissions: string[];
  onSuccess: () => void;
}) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(role.permissions ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(role.name);
    setDescription(role.description ?? "");
    setPermissions(role.permissions ?? []);
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setIsLoading(true);
    try {
      await adminApi.updateRole(role.id, { name: name.trim(), description: description.trim(), permissions });
      toast.success("Role updated.");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (p: string) => {
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>Update role name, description, and permissions.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
              {availablePermissions.map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.includes(p)}
                    onChange={() => togglePermission(p)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteRoleModal({
  role,
  open,
  onOpenChange,
  onSuccess,
}: {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [force, setForce] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await adminApi.deleteRole(role.id, force);
      toast.success("Role deleted.");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Delete role &quot;{role.name}&quot;? {role.user_count > 0 && (
              <>This role has {role.user_count} user{role.user_count !== 1 ? "s" : ""} assigned. Enable &quot;Force delete&quot; to reassign them to the default role.</>
            )}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {role.user_count > 0 && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} className="rounded border-input" />
            <span className="text-sm">Force delete (reassign users to default role)</span>
          </label>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignRoleModal({
  open,
  onOpenChange,
  roles,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  onSuccess: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);
    if (!userId.trim() || !roleName) {
      setError("User ID and role are required.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await adminApi.assignRoleToUser({ user_id: userId.trim(), role_name: roleName });
      toast.success(res.message || "Role assigned.");
      setUserId("");
      setRoleName("");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Assign failed");
        setValidationErrors(getValidationErrors(err) ?? []);
      } else {
        setError("Request failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role to User</DialogTitle>
          <DialogDescription>Set the role for a user by their user ID (UUID).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {validationErrors.length > 0 && (
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {validationErrors.map((e, i) => (
                      <li key={i}>{e.field}: {e.message}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User UUID"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleName} onValueChange={setRoleName}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
