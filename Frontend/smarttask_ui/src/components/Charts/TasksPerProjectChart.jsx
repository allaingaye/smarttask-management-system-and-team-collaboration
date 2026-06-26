import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useProjects from "../../hooks/useProjects";
import useTasks from "../../hooks/useTasks";

// ✅ Register Chart.js components once
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TasksPerProjectChart() {
  const { projects, loading: loadingProjects, error: errorProjects } = useProjects();
  const { tasks, loading: loadingTasks, error: errorTasks } = useTasks();

  // Handle loading and error states
  if (loadingProjects || loadingTasks) {
    return <p className="text-gray-500">Loading chart...</p>;
  }
  if (errorProjects || errorTasks) {
    return <p className="text-red-500">Failed to load chart data.</p>;
  }

  // Build chart data
  const labels = projects.map((p) => p.name);
  const counts = projects.map(
    (p) => tasks.filter((t) => t.project === p.id).length
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Tasks per Project",
        data: counts,
        backgroundColor: "#6366F1",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Tasks per Project" },
    },
  };

  return <Bar data={data} options={options} />;
}
