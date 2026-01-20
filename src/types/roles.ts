export type UserRole =
  | "reporting_entity"
  | "compliance_officer"
  | "head_of_compliance"
  | "analyst"
  | "head_of_analysis"
  | "director_ops"
  | "oic"
  | "tech_admin";

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
};
