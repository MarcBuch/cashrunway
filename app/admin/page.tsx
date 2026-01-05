"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CompanyForm from "@/components/CompanyForm";
import CompanyList from "@/components/CompanyList";
import { Company, CompanyInput } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(
    undefined
  );
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (data: CompanyInput) => {
    try {
      const url = editingCompany
        ? `/api/companies/${editingCompany.id}`
        : "/api/companies";
      const method = editingCompany ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save company");
      }

      // Reset form and refresh
      setEditingCompany(undefined);
      setShowForm(false);
      router.refresh();
    } catch (error) {
      throw error; // Re-throw to let CompanyForm handle it
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingCompany(undefined);
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-600">
                Manage company data and cash runway metrics
              </p>
            </div>
            <div className="flex gap-4">
              {!showForm && (
                <button
                  onClick={() => {
                    setEditingCompany(undefined);
                    setShowForm(true);
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Add Company
                </button>
              )}
              <Link
                href="/"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCompany ? "Edit Company" : "Add New Company"}
            </h2>
            <CompanyForm
              company={editingCompany}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Company List with Admin Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Companies</h2>
          <CompanyList
            showAdminActions={true}
            onEdit={handleEdit}
            onDelete={() => {
              // Refresh is handled in CompanyList
              router.refresh();
            }}
          />
        </div>
      </div>
    </main>
  );
}
