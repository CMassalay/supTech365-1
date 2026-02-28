import { useLocation, Link } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Inbox,
  FileText,
  AlertTriangle,
  Clock,
  Flag,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  FolderOpen,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Upload,
  FileCheck,
  UserPlus,
  UserRoundPlus,
  RotateCcw,
  TrendingUp,
  Home,
  ClipboardList,
  Crown,
  Lock,
  Building2,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/roles";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeVariant?: "info" | "warning" | "critical";
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const HOME_SECTION: NavSection = {
  label: "Main",
  items: [{ title: "Dashboard", href: "/", icon: Home }],
};

const withHome = (sections: NavSection[]) => [HOME_SECTION, ...sections];

export const getNavigationByRole = (role: UserRole): NavSection[] => {
  switch (role) {
    case "reporting_entity":
      return withHome([
        {
          label: "Reporting",
          items: [
            { title: "Submit Report", href: "/submit", icon: Upload },
            { title: "My Submissions", href: "/submissions", icon: FileText },
            { title: "Resubmissions", href: "/resubmissions", icon: RotateCcw },
            { title: "Statistics", href: "/statistics", icon: BarChart3 },
            { title: "My Entity", href: "/my-entity", icon: Building2 },
            { title: "API Credentials", href: "/api-credentials", icon: Key },
          ],
        },
        {
          label: "Compliance & Validation",
          items: [
            { title: "Validation Queue", href: "/compliance/validation", icon: FileCheck },
            { title: "Manual Validation Queue", href: "/compliance/validation-queue", icon: Inbox },
            { title: "Validation Audit Logs", href: "/compliance/validation-audit-logs", icon: Shield },
            { title: "CTR Review", href: "/compliance/ctr-review", icon: FileText },
          ],
        },
      ]);
    case "compliance_officer":
      return withHome([
        {
          label: "Compliance",
          items: [
            { title: "Manual Validation", href: "/compliance/manual-validation", icon: Inbox },
            { title: "Manual Validation History", href: "/compliance/manual-validation/history", icon: Clock },
            { title: "CTR Review", href: "/compliance/ctr-review", icon: FileText },
            { title: "CTR Review History", href: "/compliance/ctr-review/history", icon: Clock },
            { title: "Escalated CTR", href: "/compliance/ctr-review/escalated", icon: AlertTriangle },
          ],
        },
      ]);
    case "head_of_compliance":
      return withHome([
        {
          label: "Management",
          items: [
            { title: "CTR/STR Management Hub", href: "/compliance/validation/all", icon: FileText },
            { title: "Escalations", href: "/compliance/escalation/pending", icon: TrendingUp },
            { title: "Team Workload", href: "/supervisor/workload", icon: Users },
            { title: "System Audit Logs", href: "/audit", icon: Shield },
          ],
        },
      ]);
    case "analyst":
      return withHome([
        {
          label: "STR Analysis",
          items: [
            { title: "Manual Validation", href: "/analysis/manual-validation", icon: Inbox },
            { title: "Manual Validation History", href: "/analysis/manual-validation/history", icon: Clock },
            { title: "STR Review", href: "/analysis/str-review", icon: FileText },
            { title: "STR Review History", href: "/analysis/str-review/history", icon: Clock },
            { title: "Escalated CTR", href: "/analysis/escalated-ctr", icon: AlertTriangle },
            { title: "Subject Profiles", href: "/subjects", icon: Users },
            { title: "Alerts", href: "/analysis-alerts", icon: AlertTriangle },
            { title: "My Cases", href: "/cases", icon: FolderOpen },
            { title: "Intelligence", href: "/intelligence", icon: Send },
          ],
        },
      ]);
    case "head_of_analysis":
      return withHome([
        {
          label: "Analysis",
          items: [
            { title: "Manual Validation Queue", href: "/compliance/validation-queue", icon: Inbox },
            { title: "My Queue", href: "/analysis-queue", icon: ClipboardList },
            { title: "Subject Profiles", href: "/subjects", icon: Users },
            { title: "Alerts", href: "/analysis-alerts", icon: AlertTriangle },
          ],
        },
        {
          label: "Cases",
          items: [
            { title: "My Cases", href: "/cases", icon: FolderOpen },
            { title: "Intelligence", href: "/intelligence", icon: Send },
          ],
        },
        {
          label: "Management",
          items: [
            { title: "Assignment Queue", href: "/supervisor/assignment-queue", icon: ClipboardList },
            { title: "Team Workload", href: "/supervisor/workload", icon: Users },
          ],
        },
      ]);
    case "director_ops":
    case "oic":
      return withHome([
        {
          label: "Oversight",
          items: [
            { title: "Dashboards", href: "/dashboards", icon: BarChart3 },
            { title: "Validation Queue", href: "/compliance/validation", icon: FileCheck },
            { title: "Cases", href: "/all-cases", icon: FolderOpen },
            { title: "Dissemination", href: "/dissemination", icon: Send },
          ],
        },
        {
          label: "Audit",
          items: [
            { title: "Audit Logs", href: "/audit", icon: Shield },
            { title: "System Metrics", href: "/metrics", icon: TrendingUp },
          ],
        },
      ]);
    case "tech_admin":
      return withHome([
        {
          label: "Administration",
          items: [
            { title: "User Management", href: "/users", icon: Users },
            { title: "Entities", href: "/entities", icon: FileText },
            { title: "Roles", href: "/admin/roles", icon: ShieldCheck },
            { title: "Register Entity", href: "/admin/entities/register", icon: UserPlus },
            { title: "Create User", href: "/admin/users/create", icon: UserRoundPlus },
            { title: "Create Super Admin", href: "/admin/super-admin", icon: Crown },
            { title: "Active Sessions", href: "/sessions", icon: Clock },
            { title: "Security", href: "/security", icon: Lock },
            { title: "System Config", href: "/config", icon: Settings },
          ],
        },
      ]);
    case "super_admin":
      return withHome([
        {
          label: "Reporting",
          items: [
            { title: "Submit Report", href: "/submit", icon: Upload },
            { title: "My Submissions", href: "/submissions", icon: FileText },
            { title: "Resubmissions", href: "/resubmissions", icon: RotateCcw },
            { title: "Statistics", href: "/statistics", icon: BarChart3 },
            { title: "My Entity", href: "/my-entity", icon: Building2 },
            { title: "API Credentials", href: "/api-credentials", icon: Key },
          ],
        },
        {
          label: "Compliance & Validation",
          items: [
            { title: "Assignment Queue", href: "/supervisor/assignment-queue", icon: ClipboardList },
            { title: "Team Workload", href: "/supervisor/workload", icon: Users },
            { title: "Validation Queue", href: "/compliance/validation", icon: FileCheck },
            { title: "Manual Validation Queue", href: "/compliance/validation-queue", icon: Inbox },
            { title: "Validation Audit Logs", href: "/compliance/validation-audit-logs", icon: Shield },
            { title: "CTR Review", href: "/compliance/ctr-review", icon: FileText },
          ],
        },
        {
          label: "Administration",
          items: [
            { title: "User Management", href: "/users", icon: Users },
            { title: "Entities", href: "/entities", icon: FileText },
            { title: "Roles", href: "/admin/roles", icon: ShieldCheck },
            { title: "Register Entity", href: "/admin/entities/register", icon: UserPlus },
            { title: "Create User", href: "/admin/users/create", icon: UserRoundPlus },
            { title: "Create Super Admin", href: "/admin/super-admin", icon: Crown },
            { title: "Active Sessions", href: "/sessions", icon: Clock },
            { title: "Security", href: "/security", icon: Lock },
            { title: "System Config", href: "/config", icon: Settings },
          ],
        },
      ]);
    default:
      return [];
  }
};

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const navigation = user ? getNavigationByRole(user.role) : [];

  // Hide sidebar on mobile (mobile nav panel handles navigation)
  if (isMobile) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-sidebar-border bg-sidebar transition-all duration-200",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-full flex-col">
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((section, sectionIndex) => (
            <div key={section.label} className={cn(sectionIndex > 0 && "mt-4")}>
              {!isCollapsed && (
                <div className="nav-section-label px-4">
                  {section.label}
                </div>
              )}
              {isCollapsed && sectionIndex > 0 && (
                <div className="mx-3 my-2 h-px bg-sidebar-border" />
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  let isActive = location.pathname === item.href;
                  if (!isActive && location.pathname.startsWith(item.href + "/")) {
                    const allNavHrefs = navigation.flatMap(section => section.items.map(i => i.href));
                    isActive = !allNavHrefs.includes(location.pathname);
                  }
                  const Icon = item.icon;

                  const navButton = (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all duration-150 min-h-[40px]",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        isCollapsed && "justify-center px-0 mx-2"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                "ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
                                item.badgeVariant === "critical" && "bg-risk-critical text-white",
                                item.badgeVariant === "warning" && "bg-warning text-white",
                                (!item.badgeVariant || item.badgeVariant === "info") &&
                                  "bg-sidebar-primary text-sidebar-primary-foreground",
                                isActive && "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                              )}
                            >
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error border-2 border-white" />
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={300}>
                        <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2 bg-sidebar border border-sidebar-border text-sidebar-foreground px-3 py-2 rounded-lg text-sm">
                          {item.title}
                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                "min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
                                item.badgeVariant === "critical" && "bg-risk-critical text-white",
                                item.badgeVariant === "warning" && "bg-warning text-white",
                                (!item.badgeVariant || item.badgeVariant === "info") &&
                                  "bg-sidebar-primary text-sidebar-primary-foreground"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{navButton}</div>;
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3 sticky bottom-0 bg-sidebar">
          {!isCollapsed && (
            <Link
              to="/help"
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-150 min-h-[40px] mb-2"
            >
              <HelpCircle className="h-5 w-5" strokeWidth={2} />
              <span>Help & Support</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="mb-2">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    to="/help"
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-all duration-150"
                  >
                    <HelpCircle className="h-5 w-5" strokeWidth={2} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-sidebar border border-sidebar-border text-sidebar-foreground px-3 py-2 rounded-lg text-sm">
                  Help & Support
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-150 min-h-[40px] w-full",
              isCollapsed && "justify-center px-0"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
