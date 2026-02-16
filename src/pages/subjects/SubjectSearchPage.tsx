import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search } from "lucide-react";

function SubjectSearchPage() {
  const [query, setQuery] = useState("");

  const breadcrumbItems = [
    { label: "Analysis", icon: <Users className="h-5 w-5" /> },
    { label: "Subject Profiles" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      // TODO: wire to subject search API and show results or navigate to profile
    }
  };

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Subject Profiles
        </h1>
        <p className="text-muted-foreground">
          Search and browse subject profiles by name, identifier, or account number. (Feature in progress.)
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects by name, ID, or account..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  minLength={2}
                />
              </div>
              <Button type="submit" disabled={query.trim().length < 2}>
                Search
              </Button>
            </form>
            {query.trim().length > 0 && query.trim().length < 2 && (
              <p className="text-sm text-muted-foreground mt-2">Enter at least 2 characters to search.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Search results will appear here when the subject profiling API is connected.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default SubjectSearchPage;
