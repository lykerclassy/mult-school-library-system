import { useAuth } from '../context/AuthContext';

const DeveloperDashboard = () => {
  const { userInfo } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Developer Dashboard</h1>
        <p className="text-gray-600">Welcome, {userInfo?.name || 'Developer'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <ul className="space-y-2">
            <li>Total Schools: 0</li>
            <li>Active Users: 0</li>
            <li>System Status: Active</li>
          </ul>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Add New School
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              View System Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
