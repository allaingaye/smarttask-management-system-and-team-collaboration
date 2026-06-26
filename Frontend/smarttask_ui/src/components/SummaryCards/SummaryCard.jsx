export default function SummaryCard({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-6 text-center">
      <h3 className="text-gray-600">{title}</h3>
      <p className="text-3xl font-bold text-blue-700">{value}</p>
    </div>
  );
}
