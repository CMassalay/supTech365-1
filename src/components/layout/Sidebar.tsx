import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
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

const getNavigationByRole = (role: UserRole): NavSection[] => {
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
            { title: "Validation Queue", href: "/validation", icon: FileCheck, badge: 8 },
            { title: "CTR Review", href: "/ctr-review", icon: FileText, badge: 15 },
            { title: "Alerts", href: "/alerts", icon: AlertTriangle, badge: 3, badgeVariant: "critical" },
          ],
        },
        {
          label: "My Activity",
          items: [
            { title: "Recent Reports", href: "/recent", icon: Clock },
            { title: "Flagged CTRs", href: "/flagged", icon: Flag },
          ],
        },
        ...(role === "head_of_compliance"
          ? [
              {
                label: "Management",
                items: [
                  { title: "Team Workload", href: "/workload", icon: Users },
                  { title: "Escalations", href: "/escalations", icon: TrendingUp, badge: 4, badgeVariant: "warning" as const },
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
      return [
        {
          label: "Administration",
          items: [
            { title: "User Management", href: "/users", icon: Users },
            { title: "Entities", href: "/entities", icon: FileText },
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navigation = user ? getNavigationByRole(user.role) : [];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-sidebar-border bg-sidebar transition-all duration-200",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((section, sectionIndex) => (
            <div key={section.label} className={cn(sectionIndex > 0 && "mt-4")}>
              {!isCollapsed && (
                <div className="nav-section-label">{section.label}</div>
              )}
              {isCollapsed && sectionIndex > 0 && (
                <div className="mx-3 my-2 h-px bg-sidebar-border" />
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;

                  const navButton = (
                    <Link
                      to={item.href}
                      className={cn(
                        "nav-item",
                        isActive && "nav-item-active",
                        isCollapsed && "justify-center px-0 mx-2"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                "ml-auto min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
                                item.badgeVariant === "critical" && "bg-risk-critical text-white",
                                item.badgeVariant === "warning" && "bg-risk-high text-white",
                                (!item.badgeVariant || item.badgeVariant === "info") &&
                                  "bg-primary-light text-white",
                                isActive && "bg-white/20 text-sidebar-primary-foreground"
                              )}
                            >
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
                          {item.title}
                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                "min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
                                item.badgeVariant === "critical" && "bg-risk-critical text-white",
                                item.badgeVariant === "warning" && "bg-risk-high text-white",
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

        {/* Help & Collapse Toggle */}
        <div className="border-t border-sidebar-border p-2">
          {!isCollapsed && (
            <Link to="/help" className="nav-item mb-2">
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "nav-item w-full",
              isCollapsed && "justify-center px-0"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
