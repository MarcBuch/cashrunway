import Link from "next/link";
import CompanyList from "@/components/CompanyList";
import RiskExplanation from "@/components/RiskExplanation";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Cash Runway Tracker
              </h1>
              <p className="text-gray-600">
                Track junior mining companies&apos; cash runway to avoid dilution risk
              </p>
            </div>
            <Link
              href="/admin"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Admin
            </Link>
          </div>
        </header>

        {/* Risk Explanation */}
        <RiskExplanation />

        {/* Company List */}
        <CompanyList />
      </div>
    </main>
  );
}
