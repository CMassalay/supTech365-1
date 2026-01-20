import { useAuth } from "@/contexts/AuthContext";
import { UserRole, ROLE_LABELS } from "@/types/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roles: UserRole[] = [
  "reporting_entity",
  "compliance_officer",
  "head_of_compliance",
  "analyst",
  "head_of_analysis",
  "director_ops",
  "oic",
  "tech_admin",
];

export function RoleSwitcher() {
  const { user, setRole } = useAuth();

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-dashed">
      <span className="text-sm font-medium text-muted-foreground">Demo Role:</span>
      <Select value={user?.role} onValueChange={(value) => setRole(value as UserRole)}>
        <SelectTrigger className="w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
