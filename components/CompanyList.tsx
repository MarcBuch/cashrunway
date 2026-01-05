"use client";

import { useEffect, useState } from "react";
import { Company } from "@/types";
import CompanyCard from "./CompanyCard";

interface CompanyListProps {
  showAdminActions?: boolean;
  onEdit?: (company: Company) => void;
  onDelete?: (id: string) => void;
}

export default function CompanyList({
  showAdminActions = false,
  onEdit,
  onDelete,
}: CompanyListProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Failed to fetch companies");
      }
      const data = await response.json();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete company");
      }

      // Refresh the list
      await fetchCompanies();

      if (onDelete) {
        onDelete(id);
      }
    } catch (err) {
      alert("Failed to delete company. Please try again.");
      console.error("Error deleting company:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading companies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">
          Error: {error}
          <button
            onClick={fetchCompanies}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">No companies found. Add one to get started!</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onEdit={showAdminActions ? onEdit : undefined}
          onDelete={showAdminActions ? handleDelete : undefined}
        />
      ))}
    </div>
  );
}
