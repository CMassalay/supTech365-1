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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminApi, registrationApi } from "@/lib/api";
import type { EntityApiKey, Entity } from "@/lib/api";
import { Key, RefreshCw, Loader2, Plus, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<EntityApiKey[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [entityIdFilter, setEntityIdFilter] = useState<string | null>(null);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createdKeyOnce, setCreatedKeyOnce] = useState<EntityApiKey | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<EntityApiKey | null>(null);
  const [revokeSubmitting, setRevokeSubmitting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAllApiKeys({
        page,
        page_size: pageSize,
        entity_id: entityIdFilter ?? undefined,
        is_active: isActiveFilter ?? undefined,
      });
      setKeys(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setKeys([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [page, pageSize, entityIdFilter, isActiveFilter]);

  useEffect(() => {
    registrationApi.getEntities({ limit: 500 }).then((r) => setEntities(r.data ?? [])).catch(() => setEntities([]));
  }, []);

  const breadcrumbItems = [
    { label: "Administration", href: "/" },
    { label: "API Keys" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" />
            API Keys
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadKeys()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => { setCreatedKeyOnce(null); setCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create API key
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Entity</Label>
                <Select value={entityIdFilter ?? "all"} onValueChange={(v) => setEntityIdFilter(v === "all" ? null : v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All entities</SelectItem>
                    {entities.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={isActiveFilter === null ? "all" : isActiveFilter ? "active" : "revoked"}
                  onValueChange={(v) => setIsActiveFilter(v === "all" ? null : v === "active")}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Key name</TableHead>
                        <TableHead>Prefix</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last used</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No API keys found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        keys.map((k) => (
                          <TableRow key={k.id}>
                            <TableCell>
                              <Link to={`/entities/${k.entity_id}`} className="text-primary hover:underline font-medium">
                                {k.entity_name ?? k.entity_id}
                              </Link>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-xs text-muted-foreground">{k.entity_id}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    navigator.clipboard.writeText(k.entity_id);
                                    toast.success("Entity ID copied");
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{k.key_name}</TableCell>
                            <TableCell className="font-mono text-xs">{k.key_prefix ?? "—"}</TableCell>
                            <TableCell>
                              <span className={k.is_active ? "text-green-600 font-medium" : "text-muted-foreground"}>
                                {k.is_active ? "Active" : "Revoked"}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {k.created_at ? new Date(k.created_at).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell>
                              {k.is_active && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => setRevokeTarget(k)}
                                >
                                  Revoke
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} ({total} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
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

      {/* Create API key modal */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) setCreatedKeyOnce(null); setCreateOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              The key value is shown only once. Copy and store it securely.
            </DialogDescription>
          </DialogHeader>
          {createdKeyOnce ? (
            <div className="space-y-4">
              <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">Save this key now. It won&apos;t be shown again.</p>
              </div>
              {createdKeyOnce.api_key && (
                <div className="space-y-2">
                  <Label>API key</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={createdKeyOnce.api_key} className="font-mono text-sm" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(createdKeyOnce.api_key!);
                        toast.success("Copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => { setCreatedKeyOnce(null); setCreateOpen(false); loadKeys(); }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <CreateKeyFormGlobal
              entities={entities}
              isSubmitting={createSubmitting}
              onSubmit={async (entityId, keyName, expiresInDays) => {
                setCreateSubmitting(true);
                try {
                  const created = await adminApi.createApiKey({
                    entity_id: entityId,
                    key_name: keyName,
                    expires_in_days: expiresInDays || undefined,
                  });
                  setCreatedKeyOnce(created);
                  toast.success("API key created. Copy it now.");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to create API key.");
                } finally {
                  setCreateSubmitting(false);
                }
              }}
              onCancel={() => setCreateOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{revokeTarget?.key_name}&quot; will be revoked and will no longer work. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (!revokeTarget) return;
                setRevokeSubmitting(true);
                try {
                  await adminApi.revokeApiKey(revokeTarget.id);
                  toast.success("API key revoked.");
                  setRevokeTarget(null);
                  loadKeys();
                } catch {
                  toast.error("Failed to revoke key.");
                } finally {
                  setRevokeSubmitting(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={revokeSubmitting}
            >
              {revokeSubmitting ? "Revoking…" : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

function CreateKeyFormGlobal({
  entities,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  entities: Entity[];
  isSubmitting: boolean;
  onSubmit: (entityId: string, keyName: string, expiresInDays: number | undefined) => Promise<void>;
  onCancel: () => void;
}) {
  const [entityId, setEntityId] = useState("");
  const [keyName, setKeyName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | "">(90);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId || !keyName.trim()) return;
    await onSubmit(entityId, keyName.trim(), expiresInDays === "" ? undefined : Number(expiresInDays));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="create-entity">Entity</Label>
        <Select value={entityId} onValueChange={setEntityId} required>
          <SelectTrigger id="create-entity">
            <SelectValue placeholder="Select entity" />
          </SelectTrigger>
          <SelectContent>
            {entities.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-key-name">Key name</Label>
        <Input
          id="create-key-name"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          placeholder="e.g. Production API"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-expires">Expires in (days, optional)</Label>
        <Input
          id="create-expires"
          type="number"
          min={1}
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
          placeholder="90"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
