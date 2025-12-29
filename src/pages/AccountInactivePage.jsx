import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../contexts/RBACContext';

const AccountInactivePage = () => {
  const { signOut } = useAuth();
  const { profile } = useRBAC();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Account Inactive
            </h1>
            <p className="text-gray-600 mb-4">
              Your account has been deactivated.
            </p>

            {profile && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Account:</span>{' '}
                  {profile.display_name}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-semibold">Email:</span>{' '}
                  {profile.email}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              Please contact your administrator to reactivate your account.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountInactivePage;
