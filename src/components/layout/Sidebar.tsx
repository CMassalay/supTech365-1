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
  Upload,
  FileCheck,
  UserPlus,
  RotateCcw,
  TrendingUp,
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

export const getNavigationByRole = (role: UserRole): NavSection[] => {
  switch (role) {
    case "reporting_entity":
      return [
        {
          label: "Reporting",
          items: [
            { title: "Submit Report", href: "/submit", icon: Upload },
            { title: "My Submissions", href: "/submissions", icon: FileText, badge: 12 },
            { title: "Resubmissions", href: "/resubmissions", icon: RotateCcw, badge: 2, badgeVariant: "warning" },
            { title: "Statistics", href: "/statistics", icon: BarChart3 },
          ],
        },
      ];
    case "compliance_officer":
    case "head_of_compliance":
      return [
        {
          label: "My Work",
          items: [
            { title: "Validation Queue", href: "/compliance/validation", icon: FileCheck, badge: 8 },
            { title: "CTR Review", href: "/compliance/ctr-review", icon: FileText, badge: 15 },
            { title: "Alerts", href: "/compliance/alerts/active", icon: AlertTriangle, badge: 3, badgeVariant: "critical" },
          ],
        },
        {
          label: "My Activity",
          items: [
            { title: "Flagged CTRs", href: "/compliance/ctr-review/flagged", icon: Flag },
          ],
        },
        ...(role === "head_of_compliance"
          ? [
              {
                label: "Management",
                items: [
                  { title: "Team Workload", href: "/compliance/workload/dashboard", icon: Users },
                  { title: "Pending Validations", href: "/compliance/validation/pending", icon: Inbox, badge: 3, badgeVariant: "warning" as const },
                  { title: "Assign Validations", href: "/compliance/validation/assign", icon: UserPlus },
                  { title: "Escalations", href: "/compliance/escalation/pending", icon: TrendingUp, badge: 4, badgeVariant: "warning" as const },
                ],
              },
            ]
          : []),
      ];
    case "analyst":
    case "head_of_analysis":
      return [
        {
          label: "Analysis",
          items: [
            { title: "My Queue", href: "/analysis-queue", icon: Inbox, badge: 6 },
            { title: "Subject Profiles", href: "/subjects", icon: Users },
            { title: "Alerts", href: "/analysis-alerts", icon: AlertTriangle, badge: 2, badgeVariant: "critical" },
          ],
        },
        {
          label: "Cases",
          items: [
            { title: "My Cases", href: "/cases", icon: FolderOpen, badge: 4 },
            { title: "Intelligence", href: "/intelligence", icon: Send },
          ],
        },
      ];
    case "director_ops":
    case "oic":
      return [
        {
          label: "Oversight",
          items: [
            { title: "Dashboards", href: "/dashboards", icon: BarChart3 },
            { title: "Cases", href: "/all-cases", icon: FolderOpen },
            { title: "Dissemination", href: "/dissemination", icon: Send, badge: 3 },
          ],
        },
        {
          label: "Audit",
          items: [
            { title: "Audit Logs", href: "/audit", icon: Shield },
            { title: "System Metrics", href: "/metrics", icon: TrendingUp },
          ],
        },
      ];
    case "tech_admin":
    case "super_admin":
      return [
        {
          label: "Administration",
          items: [
            { title: "User Management", href: "/users", icon: Users },
            { title: "Entities", href: "/entities", icon: FileText },
            { title: "Register Entity", href: "/admin/entities/register", icon: UserPlus },
            { title: "Create User", href: "/admin/users/create", icon: UserPlus },
            { title: "Security", href: "/security", icon: Shield },
            { title: "System Config", href: "/config", icon: Settings },
          ],
        },
      ];
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
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-gray-200 bg-white transition-all duration-200",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Navigation Sections (f2.md Section 3.3) */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((section, sectionIndex) => (
            <div key={section.label} className={cn(sectionIndex > 0 && "mt-4")}>
              {!isCollapsed && (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.label}
                </div>
              )}
              {isCollapsed && sectionIndex > 0 && (
                <div className="mx-3 my-2 h-px bg-gray-200" />
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  // Check exact match first
                  let isActive = location.pathname === item.href;
                  
                  // For parent routes, check if path starts with href + "/" 
                  // but exclude routes that have their own nav items in the same section
                  if (!isActive && location.pathname.startsWith(item.href + "/")) {
                    // Get all hrefs from all sections to check if current path is a direct nav item
                    const allNavHrefs = navigation.flatMap(section => section.items.map(i => i.href));
                    // Only highlight parent if current path is not exactly another nav item
                    isActive = !allNavHrefs.includes(location.pathname);
                  }
                  
                  const Icon = item.icon;

                  const navButton = (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm transition-all duration-150 min-h-[40px]",
                        isActive
                          ? "bg-primary-light text-white font-medium"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
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
                                  "bg-primary-light text-white",
                                isActive && "bg-white/20 text-white"
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
                        <TooltipContent side="right" className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-md text-sm">
                          {item.title}
                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                "min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
                                item.badgeVariant === "critical" && "bg-risk-critical text-white",
                                item.badgeVariant === "warning" && "bg-warning text-white",
                                (!item.badgeVariant || item.badgeVariant === "info") &&
                                  "bg-primary-light text-white"
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

        {/* Help & Collapse Toggle (f2.md Section 3.3) */}
        <div className="border-t border-gray-200 p-3 sticky bottom-0 bg-white">
          {!isCollapsed && (
            <Link 
              to="/help" 
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150 min-h-[40px] mb-2"
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
                    className="flex items-center justify-center h-10 w-10 mx-auto rounded-md text-gray-600 hover:bg-gray-100 transition-all duration-150"
                  >
                    <HelpCircle className="h-5 w-5" strokeWidth={2} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm">
                  Help & Support
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150 min-h-[40px] w-full",
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
