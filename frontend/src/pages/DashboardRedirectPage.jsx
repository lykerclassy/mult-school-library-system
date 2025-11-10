import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirectPage = () => {
  const navigate = useNavigate();
  const { userInfo, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Handle role-based routing
    switch (userInfo?.role) {
      case 'DEVELOPER':
        navigate('/developer-dashboard');
        break;
      case 'SCHOOL_ADMIN':
        navigate('/school-dashboard');
        break;
      case 'LIBRARIAN':
        navigate('/librarian-dashboard');
        break;
      default:
        console.error('Unknown role:', userInfo?.role);
        navigate('/');
    }
  }, [userInfo, isAuthenticated, navigate]);

  return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="text-xl">Redirecting to your dashboard...</div>
    </div>
  );
};

export default DashboardRedirectPage;
