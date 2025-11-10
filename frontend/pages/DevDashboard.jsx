import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DevDashboard = () => {
  // State for the "Register School" form
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setSchoolName('');
    setAddress('');
    setContactPhone('');
    setAdminUsername('');
    setAdminPassword('');
  };

  const handleRegisterSchool = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/schools/register', {
        schoolName,
        address,
        contactPhone,
        adminUsername,
        adminPassword,
      });

      toast.success(data.message);
      clearForm();
    } catch (error) {
      const message = error.response?.data?.message || 'School registration failed';
      toast.error(message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Developer Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Register School Card */}
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            Register New School
          </h2>
          <form onSubmit={handleRegisterSchool} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                School Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                School Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <hr className="my-2" />

            <h3 className="text-lg font-medium text-gray-700">
              Create School Admin
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Admin Username
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register School & Admin'}
            </button>
          </form>
        </div>

        {/* Other Dev Panels (e.g., list of schools) can go here */}
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            All Schools
          </h2>
          <p className="text-gray-600">
            (A list of all registered schools will appear here soon...)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevDashboard;