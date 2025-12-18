import React, { useEffect, useState } from "react";

export default function DashboardTotals() {
  const [sheet, setSheet] = useState(null);

  useEffect(() => {
    fetch(
      "https://opensheet.elk.sh/2PACX-1vQclZvKpPugj7vtMuKG_I6UZ5QPzRRR-dKhRutTZ4xSz-PcKuP4DnoVNv85uoOTTnxxPh5s1tjvjD0q/Sheet1"
    )
      .then((res) => res.json())
      .then((data) => {
        const row = data[0]; // first row contains totals

        setSheet({
          teamMembers: Number(row["Team Members"]),
          avgPerformance: row["Avg. Performance"],
          totalLead: Number(row["Total Lead"]),
          pendingLead: Number(row["Peanding Lead"]),
        });
      });
  }, []);

  if (!sheet) return <h2>Loading...</h2>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-8">Team Performance Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-blue-500">
          <p className="text-gray-600">Team Members</p>
          <h3 className="text-3xl font-bold text-blue-600">{sheet.teamMembers}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-green-500">
          <p className="text-gray-600">Avg. Performance</p>
          <h3 className="text-3xl font-bold text-green-600">{sheet.avgPerformance}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-purple-500">
          <p className="text-gray-600">Total Lead</p>
          <h3 className="text-3xl font-bold text-purple-600">{sheet.totalLead}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-red-500">
          <p className="text-gray-600">Pending Lead</p>
          <h3 className="text-3xl font-bold text-red-600">{sheet.pendingLead}</h3>
        </div>

      </div>
    </div>
  );
}
