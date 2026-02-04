export type UserRole =
  | "reporting_entity"
  | "compliance_officer"
  | "head_of_compliance"
  | "analyst"
  | "head_of_analysis"
  | "director_ops"
  | "oic"
  | "tech_admin"
  | "super_admin";

/** Map backend role (e.g. SUPER_ADMIN) to app UserRole */
export function mapBackendRole(backendRole: string): UserRole {
  const normalized = backendRole?.toLowerCase().replace(/-/g, "_") || "";
  const mapping: Record<string, UserRole> = {
    super_admin: "super_admin",
    tech_admin: "tech_admin",
    reporting_entity: "reporting_entity",
    compliance_officer: "compliance_officer",
    head_of_compliance: "head_of_compliance",
    analyst: "analyst",
    head_of_analysis: "head_of_analysis",
    director_ops: "director_ops",
    oic: "oic",
  };
  return mapping[normalized] ?? "compliance_officer";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
  badgeVariant?: "info" | "warning" | "critical";
  children?: NavigationItem[];
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  reporting_entity: "Reporting Entity User",
  compliance_officer: "Compliance Officer",
  head_of_compliance: "Head of Compliance",
  analyst: "Analyst",
  head_of_analysis: "Head of Analysis",
  director_ops: "Director of Operations",
  oic: "Officer in Charge",
  tech_admin: "Tech Administrator",
  super_admin: "Super Administrator",
};

export const ROLE_WORKSPACES: Record<UserRole, string[]> = {
  reporting_entity: ["reporting"],
  compliance_officer: ["compliance"],
  head_of_compliance: ["compliance", "rules", "audit"],
  analyst: ["analysis", "cases"],
  head_of_analysis: ["analysis", "cases", "rules", "audit"],
  director_ops: ["cases", "audit"],
  oic: ["cases", "audit", "admin"],
  tech_admin: ["admin"],
  super_admin: ["admin"],
};
