import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex w-full pt-16">
        <Sidebar />
        <main className="flex-1 ml-60 min-h-[calc(100vh-4rem)] transition-all duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
