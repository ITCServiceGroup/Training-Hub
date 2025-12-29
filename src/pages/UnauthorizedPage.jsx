import { Link } from 'react-router-dom';
import { useRBAC } from '../contexts/RBACContext';

const UnauthorizedPage = () => {
  const { profile, getRoleDisplayName } = useRBAC();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You do not have permission to access this page.
            </p>

            {profile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Your Role:</span>{' '}
                  {getRoleDisplayName(profile.role)}
                </p>
                {profile.markets?.name && (
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Market:</span>{' '}
                    {profile.markets.name}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              If you believe this is an error, please contact your system administrator.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Home
            </Link>
            <Link
              to="/admin"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
