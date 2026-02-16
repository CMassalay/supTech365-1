import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authApi, entityApi } from "@/lib/api";
import type { EntityApiKey } from "@/lib/api";
import { Key, Loader2, AlertCircle, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const MASKED_KEY = "••••••••••••••••••••";

function ApiCredentialsPage() {
  const [entityId, setEntityId] = useState<string | null>(null);
  const [keys, setKeys] = useState<EntityApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [plaintextKey, setPlaintextKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    authApi
      .getProfile()
      .then((profile) => {
        const eid = (profile as { entity_id?: string | null }).entity_id ?? null;
        if (cancelled) return;
        setEntityId(eid);
        if (!eid) {
          setKeys([]);
          setLoading(false);
          return;
        }
        return entityApi.getEntityApiKeys(eid, true);
      })
      .then((list) => {
        if (cancelled) return;
        if (Array.isArray(list)) setKeys(list);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load credentials.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <Key className="h-5 w-5" /> },
    { label: "API Credentials" },
  ];

  const hasActiveKey = keys.some((k) => k.is_active);

  if (loading) {
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
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Key className="h-6 w-6 text-primary" />
          API Credentials
        </h1>

        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 text-sm text-blue-900 dark:text-blue-100">
          <strong>API keys</strong> are used to submit reports via the API. Use &quot;Show&quot; to reveal your key (requires password re-entry when backend is available).
        </div>

        {keys.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Key className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">No API Credentials</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                No API credentials have been issued for your entity. Contact your administrator to request API access.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((k) => {
                      const isRevealed = revealedId === k.id;
                      const displayKey = isRevealed && plaintextKey ? plaintextKey : (k.key_prefix ? `${k.key_prefix}${MASKED_KEY}` : MASKED_KEY);
                      return (
                        <TableRow key={k.id} className={!k.is_active ? "opacity-70" : ""}>
                          <TableCell className="font-mono text-sm">{displayKey}</TableCell>
                          <TableCell>{k.key_name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={k.is_active ? "default" : "secondary"}
                              className={
                                k.is_active
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                                  : k.revoked_at
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                                    : "bg-muted text-muted-foreground"
                              }
                            >
                              {k.is_active ? "Active" : k.revoked_at ? "Revoked" : "Expired"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {k.created_at ? new Date(k.created_at).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : "Never"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "Never"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (isRevealed) {
                                    setRevealedId(null);
                                    setPlaintextKey(null);
                                  } else {
                                    // TODO: re-auth modal then POST .../credentials/reveal
                                    toast.info("Reveal requires backend endpoint and re-authentication.");
                                  }
                                }}
                              >
                                {isRevealed ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                                {isRevealed ? "Hide" : "Show"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!isRevealed}
                                onClick={() => {
                                  const toCopy = isRevealed ? plaintextKey : null;
                                  if (toCopy) {
                                    navigator.clipboard.writeText(toCopy);
                                    toast.success("Copied to clipboard");
                                  } else if (!isRevealed) {
                                    toast.info("Reveal the key first to copy.");
                                  }
                                }}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {hasActiveKey && (
              <div>
                <Button
                  variant="outline"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => toast.info("Regenerate requires backend endpoint and re-authentication.")}
                >
                  Regenerate Key
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Regenerating will revoke the current key and issue a new one. Available when backend supports it.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default ApiCredentialsPage;
