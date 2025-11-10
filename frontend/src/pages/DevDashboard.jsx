import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building, Loader2 } from 'lucide-react'; // npm install lucide-react

const DevDashboard = () => {
  // --- State for the "Register School" form ---
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  // --- State for the "All Schools" list ---
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  // Function to fetch all schools
  const fetchSchools = async () => {
    try {
      const { data } = await axios.get('/schools'); // Removed extra /api
      setSchools(data);
    } catch (error) {
      console.error('Fetch error:', error.response || error);
      toast.error('Failed to fetch schools');
    }
    setLoadingSchools(false);
  };

  // Fetch schools when the component loads
  useEffect(() => {
    fetchSchools();
  }, []); // Empty array means this runs once on mount

  // Clear form fields
  const clearForm = () => {
    setSchoolName('');
    setAddress('');
    setContactPhone('');
    setAdminEmail('');
    setAdminPassword('');
  };

  // --- Handler for the "Register School" form submission ---
  const handleRegisterSchool = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      console.log('Sending request with data:', {
        schoolName,
        address,
        contactPhone,
        adminEmail,
        adminPassword,
      });

      const { data } = await axios.post('/schools/register', { // Removed extra /api
        schoolName,
        address,
        contactPhone,
        adminEmail,
        adminPassword,
      });

      console.log('Response:', data);
      toast.success(data.message);
      clearForm(); // Clear the form on success
      fetchSchools(); // Refresh the list of schools
    } catch (error) {
      console.error('Registration error:', error.response || error);
      const message = error.response?.data?.message || 'School registration failed';
      toast.error(message);
    }
    setLoadingForm(false);
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Developer Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* === COLUMN 1: REGISTER SCHOOL FORM === */}
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            Register New School
          </h2>
          <form onSubmit={handleRegisterSchool} className="space-y-4">
            {/* School Details */}
            <h3 className="text-lg font-medium text-indigo-600">
              School Details
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <hr className="my-4" />

            {/* Admin Details */}
            <h3 className="text-lg font-medium text-indigo-600">
              Create School Admin
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingForm}
              className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingForm ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {loadingForm ? 'Registering...' : 'Register School & Admin'}
            </button>
          </form>
        </div>

        {/* === COLUMN 2: ALL SCHOOLS LIST === */}
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            All Registered Schools
          </h2>
          {loadingSchools ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
          ) : schools.length === 0 ? (
            <p className="text-center text-gray-500">
              No schools registered yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {schools.map((school) => (
                <li
                  key={school._id}
                  className="flex items-start space-x-4 rounded-md border border-gray-200 p-4"
                >
                  <div className="flex-shrink-0">
                    <Building className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {school.name}
                    </h3>
                    <p className="text-sm text-gray-600">{school.address}</p>
                    <p className="text-sm text-gray-600">
                      {school.contactPhone}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevDashboard;
