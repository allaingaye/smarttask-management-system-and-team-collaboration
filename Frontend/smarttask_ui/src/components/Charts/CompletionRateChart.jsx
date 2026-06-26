import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import useTasks from "../../hooks/useTasks";

// ✅ Register Chart.js components once
ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function CompletionRateChart() {
  const { tasks, loading, error } = useTasks();

  // Handle loading and error states
  if (loading) {
    return <p className="text-gray-500">Loading chart...</p>;
  }
  if (error) {
    return <p className="text-red-500">Failed to load chart data.</p>;
  }

  // Compute task stats using backend values + is_overdue
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter((t) => t.is_overdue).length;

  const data = {
    labels: ["Completed", "In Progress", "Pending", "Overdue"],
    datasets: [
      {
        data: [completed, inProgress, pending, overdue],
        backgroundColor: ["#4CAF50", "#FFC107", "#2196F3", "#F44336"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Task Completion Rate" },
    },
  };

  return <Doughnut data={data} options={options} />;
}
