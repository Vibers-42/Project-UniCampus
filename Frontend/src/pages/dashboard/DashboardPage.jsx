import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark-100">
          Welcome back, {user?.fullName?.split(' ')[0] || 'there'} 👋
        </h2>
        <p className="text-dark-400 mt-1">Here&apos;s what&apos;s happening on campus today.</p>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="auth-card p-6">
          <h3 className="text-dark-400 text-sm font-medium">Role</h3>
          <p className="text-dark-100 text-lg font-semibold mt-1 capitalize">{user?.role || 'Student'}</p>
        </div>
        <div className="auth-card p-6">
          <h3 className="text-dark-400 text-sm font-medium">Department</h3>
          <p className="text-dark-100 text-lg font-semibold mt-1">{user?.department || 'Not set'}</p>
        </div>
        <div className="auth-card p-6">
          <h3 className="text-dark-400 text-sm font-medium">Year</h3>
          <p className="text-dark-100 text-lg font-semibold mt-1">
            {user?.yearOfStudy ? `${user.yearOfStudy}${['st', 'nd', 'rd', 'th'][user.yearOfStudy - 1] || 'th'} Year` : 'Not set'}
          </p>
        </div>
      </div>
      
      {/* Activity Feed Placeholder */}
      <div className="bg-dark-900/50 backdrop-blur-xl border border-dark-800 rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-dark-200 mb-4">Activity Feed</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-dark-500 text-2xl">🌱</span>
          </div>
          <p className="text-dark-300 font-medium">Your feed is quiet.</p>
          <p className="text-dark-500 text-sm mt-1">Check out events or join a study group to get started.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
