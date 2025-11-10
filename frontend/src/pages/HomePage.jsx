import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome to School Library System</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">About Our Library</h2>
          <p className="text-gray-600 mb-4">
            Our digital library system provides easy access to educational resources,
            books, and materials for students and staff. Browse our collection,
            manage borrowings, and track your reading history all in one place.
          </p>
          
          {!isAuthenticated && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">Get Started</h3>
              <p className="text-gray-600">
                Please login to access the full features of our library system.
              </p>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
            <ul className="list-disc list-inside text-gray-600">
              <li>Browse Books</li>
              <li>My Borrowings</li>
              <li>Reading History</li>
              <li>Account Settings</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
