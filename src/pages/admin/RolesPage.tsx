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
import type { Role, BulkAssignRoleResponse } from "@/lib/api";
import { Shield, Plus, Pencil, Trash2, UserPlus, Users, RefreshCw, Loader2, AlertCircle, CheckCircle2, XCircle, X } from "lucide-react";
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
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
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
            <Button variant="outline" size="sm" onClick={() => setBulkAssignOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Bulk Assign Role
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

      <BulkAssignRoleModal
        open={bulkAssignOpen}
        onOpenChange={setBulkAssignOpen}
        roles={roles}
        onSuccess={() => {
          setBulkAssignOpen(false);
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
              <SelectTrigger className="h-8 w-full max-w-[200px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto min-w-[12rem]">
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parsePastedIds(text: string): string[] {
  return text
    .split(/[\n,\s]+/)
    .map((s) => s.trim())
    .filter((s) => UUID_REGEX.test(s));
}

function BulkAssignRoleModal({
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
  const [userIds, setUserIds] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [roleName, setRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ field: string; message: string }[]>([]);
  const [result, setResult] = useState<BulkAssignRoleResponse | null>(null);

  const addOne = (id: string) => {
    const trimmed = id.trim();
    if (!UUID_REGEX.test(trimmed)) return;
    setUserIds((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCurrentInput("");
  };

  const addMany = (ids: string[]) => {
    const valid = ids.filter((id) => UUID_REGEX.test(id));
    setUserIds((prev) => {
      const set = new Set([...prev, ...valid]);
      return Array.from(set);
    });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parsePastedIds(text);
      if (parsed.length) {
        addMany(parsed);
        toast.success(`Added ${parsed.length} user ID${parsed.length !== 1 ? "s" : ""}`);
      } else {
        toast.error("No valid UUIDs found in clipboard.");
      }
    } catch {
      toast.error("Could not read clipboard.");
    }
  };

  const removeId = (id: string) => {
    setUserIds((prev) => prev.filter((x) => x !== id));
  };

  const clearAll = () => {
    setUserIds([]);
    setCurrentInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);
    setResult(null);
    if (!userIds.length || !roleName) {
      setError("Add at least one user ID and select a role.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await adminApi.bulkAssignRole({ user_ids: userIds, role_name: roleName });
      setResult(res);
      toast.success(res.message || `Bulk assign complete: ${res.successful_assignments} succeeded, ${res.failed_assignments} failed.`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Bulk assign failed.");
        setValidationErrors(getValidationErrors(err) ?? []);
      } else {
        setError("Request failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setUserIds([]);
      setCurrentInput("");
      setRoleName("");
      setError(null);
      setValidationErrors([]);
      setResult(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Bulk Assign Role</DialogTitle>
          <DialogDescription>
            Add user IDs one by one or paste from clipboard. Each ID appears as a chip—remove any before submitting.
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="rounded-md bg-muted p-3">
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{result.total_users}</p>
              </div>
              <div className="rounded-md bg-green-500/10 p-3">
                <p className="text-muted-foreground">Succeeded</p>
                <p className="font-semibold text-green-700 dark:text-green-400">{result.successful_assignments}</p>
              </div>
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-muted-foreground">Failed</p>
                <p className="font-semibold text-destructive">{result.failed_assignments}</p>
              </div>
              <div className="rounded-md bg-muted p-3">
                <p className="text-muted-foreground">Role</p>
                <p className="font-semibold">{result.role_name}</p>
              </div>
            </div>
            {result.results?.length > 0 && (
              <div className="rounded-md border overflow-x-auto max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Old role</TableHead>
                      <TableHead>New role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.results.map((r, i) => (
                      <TableRow key={r.user_id + String(i)}>
                        <TableCell className="font-mono text-xs">{r.username ?? r.user_id}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{r.old_role}</TableCell>
                        <TableCell className="text-sm">{r.new_role}</TableCell>
                        <TableCell>
                          {r.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={r.message}>{r.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setResult(null); }}>
                Assign again
              </Button>
              <Button onClick={() => { onSuccess(); handleClose(false); }}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex flex-col min-h-0">
            {error && (
              <Alert variant="destructive" className="shrink-0">
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

            <div className="space-y-2 shrink-0">
              <Label>Add user IDs</Label>
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOne(currentInput);
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text");
                    const parsed = parsePastedIds(pasted);
                    if (parsed.length > 1) {
                      e.preventDefault();
                      addMany(parsed);
                      toast.success(`Added ${parsed.length} user IDs`);
                    }
                  }}
                  placeholder="Paste or type a UUID, press Enter to add"
                  className="font-mono text-sm flex-1"
                />
                <Button type="button" variant="secondary" onClick={() => addOne(currentInput)}>
                  Add
                </Button>
                <Button type="button" variant="outline" onClick={handlePasteFromClipboard}>
                  Paste from clipboard
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste multiple at once (newlines or commas) to add all valid UUIDs.
              </p>
            </div>

            <div className="space-y-2 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between">
                <Label>User IDs to assign ({userIds.length})</Label>
                {userIds.length > 0 && (
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={clearAll}>
                    Clear all
                  </Button>
                )}
              </div>
              <div className="rounded-md border bg-muted/30 p-3 min-h-[120px] max-h-48 overflow-y-auto">
                {userIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No user IDs added yet. Add one above or paste from clipboard.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {userIds.map((id) => (
                      <li key={id}>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md bg-background border px-2.5 py-1 text-xs font-mono shadow-sm"
                          title={id}
                        >
                          <span className="max-w-[140px] truncate">{id}</span>
                          <button
                            type="button"
                            onClick={() => removeId(id)}
                            className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                            aria-label="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2 shrink-0">
              <Label>Role</Label>
              <Select value={roleName} onValueChange={setRoleName}>
                <SelectTrigger className="h-8 w-full max-w-[200px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto min-w-[12rem]">
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="shrink-0">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading || userIds.length === 0}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bulk assign"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
