import { Link } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-slate-50 p-4">
      <div className="w-full max-w-md text-center">
        {/* Lock Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full shadow-lg shadow-red-100 mb-6">
          <FaLock className="text-red-600 text-5xl" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-xl font-semibold text-red-600 mb-4">401 Unauthorized</p>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <p className="text-slate-600 mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-slate-500">
            Please log in with valid credentials to continue.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-100"
          >
            <FaArrowLeft className="mr-2" /> Back to Login
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200"
          >
            Go to Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-slate-400 mt-6">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
}