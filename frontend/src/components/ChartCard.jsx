export default function ChartCard({ title, children }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      {children}
    </div>
  );
}
