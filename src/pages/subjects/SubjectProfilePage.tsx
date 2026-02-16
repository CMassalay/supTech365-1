import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";

function SubjectProfilePage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: "Analysis", href: "/" },
    { label: "Subject Profiles", href: "/subjects" },
    { label: "Profile", href: "#" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/subjects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Subject Profile
        </h1>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Profile details</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Subject ID: <span className="font-mono">{uuid ?? "—"}</span>
            </p>
            <p className="text-muted-foreground">
              Full subject profile (identifiers, attributes, statistics, and linked reports) will be displayed here when the subject profiling API is connected.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default SubjectProfilePage;
