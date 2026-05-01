"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Upload,
  Download,
  Eye,
  BookmarkPlus,
  Lightbulb,
  BookText,
  ArrowUpRight,
  Filter,
  FileText,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard-header";

export default function StudentResources() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myResources, setMyResources] = useState([]);
  const [approvedResources, setApprovedResources] = useState([]);
  const [activeTab, setActiveTab] = useState("my-resources");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!storedUser) {
          router.push("/login");
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== "student") {
          router.push(`/dashboard/${parsedUser.role}`);
          return;
        }
        setUser(parsedUser);
        fetchResources();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const myResourcesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/student/my-resources`,
        {
          credentials: "include",
        headers: { ...( typeof window !== "undefined" && localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {} ) },
        },
      );

      const approvedResourcesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources?status=approved`,
        {
          credentials: "include",
        headers: { ...( typeof window !== "undefined" && localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {} ) },
        },
      );

      if (myResourcesResponse.ok) {
        const myResourcesData = await myResourcesResponse.json();
        setMyResources(myResourcesData.resources || []);
      }

      if (approvedResourcesResponse.ok) {
        const approvedResourcesData = await approvedResourcesResponse.json();
        setApprovedResources(approvedResourcesData.resources || []);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load resources. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMyResources = myResources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredApprovedResources = approvedResources.filter(
    (resource) =>
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.uploadedByName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500";
      case "rejected":
        return "bg-red-500";
      case "pending":
        return "bg-amber-500";
      default:
        return "bg-gray-400";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "past-exam":
        return <FileText className="h-5 w-5" />;
      case "mini-project":
        return <Lightbulb className="h-5 w-5" />;
      case "final-project":
        return <BookmarkPlus className="h-5 w-5" />;
      case "thesis":
        return <BookText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const ResourceCard = ({ resource, isMyResource = false }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-lg ${
                resource.type === "past-exam"
                  ? "bg-blue-100 text-blue-600"
                  : resource.type === "mini-project"
                    ? "bg-purple-100 text-purple-600"
                    : resource.type === "final-project"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {getTypeIcon(resource.type)}
            </div>
            <div>
              <h3 className="font-bold text-lg line-clamp-1">
                {resource.title}
              </h3>
              <p className="text-gray-500 text-sm">{resource.department}</p>
            </div>
          </div>
          {isMyResource && (
            <div
              className={`h-3 w-3 rounded-full ${getStatusColor(resource.status)}`}
            ></div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {isMyResource ? (
              <div className="text-sm text-gray-500">
                Supervisor: {resource.supervisorName || "N/A"}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                By: {resource.uploadedByName}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Link href={`/resources/${resource.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full flex items-center gap-1 border-gray-200"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
              </Button>
            </Link>

            {(resource.status === "approved" || !isMyResource) && (
              <Link href={`/resources/${resource.id}/download`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full flex items-center gap-1 border-gray-200"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {isMyResource && (
          <div className="mt-3">
            <Badge
              className={`${
                resource.status === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : resource.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {resource.status.charAt(0).toUpperCase() +
                resource.status.slice(1)}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-tr from-gray-50 to-gray-100">
        <DashboardHeader />
        <div className="container flex-1 items-center justify-center flex">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-tr from-gray-50 to-gray-100">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl overflow-hidden">
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-bold">
                  Academic Resources Hub
                </h1>
                <p className="mt-2 text-blue-100 max-w-xl">
                  Access, manage and explore a collection of academic resources.
                </p>
              </div>
              <Link href="/upload">
                <Button
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-blue-50 gap-2 rounded-xl shadow-lg"
                >
                  <Upload className="h-5 w-5" />
                  Upload New Resource
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search by title, type, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 rounded-lg border-gray-200 w-full"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 py-6 border-gray-200"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </Button>
          </div>

          <div className="mb-6">
            <div className="bg-white p-1 rounded-xl shadow-md border border-gray-100 flex">
              <button
                onClick={() => setActiveTab("my-resources")}
                className={`rounded-lg text-base py-3 px-6 flex-1 ${activeTab === "my-resources" ? "bg-blue-600 text-white" : "text-gray-600"}`}
              >
                My Resources
              </button>
              <button
                onClick={() => setActiveTab("approved")}
                className={`rounded-lg text-base py-3 px-6 flex-1 ${activeTab === "approved" ? "bg-blue-600 text-white" : "text-gray-600"}`}
              >
                Approved Resources
              </button>
            </div>
          </div>

          {activeTab === "my-resources" && (
            <div className="space-y-6">
              {filteredMyResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      isMyResource={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <Upload className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No resources uploaded yet
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Start by uploading your first resource.
                  </p>
                  <Link href="/upload">
                    <Button className="gap-2 rounded-xl">
                      <ArrowUpRight className="h-4 w-4" />
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "approved" && (
            <div className="space-y-6">
              {filteredApprovedResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApprovedResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <BookOpen className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No approved resources found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Try adjusting your search criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border border-gray-100">
              <div className="bg-blue-100 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Uploads</p>
                <h4 className="text-2xl font-bold">{myResources.length}</h4>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border border-gray-100">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <BookmarkPlus className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <h4 className="text-2xl font-bold">
                  {myResources.filter((r) => r.status === "approved").length}
                </h4>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 border border-gray-100">
              <div className="bg-amber-100 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <h4 className="text-2xl font-bold">
                  {myResources.filter((r) => r.status === "pending").length}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
