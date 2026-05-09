import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Top bar */}
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
            UniCampus
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-dark-200 text-sm font-medium">{user?.fullName || 'Student'}</p>
              <p className="text-dark-500 text-xs">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-dark-400 hover:text-dark-200 border border-dark-700/50 rounded-lg hover:bg-dark-800 transition-all"
              id="logout-btn"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-100">
            Welcome, {user?.fullName?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-dark-400 mt-1">Here&apos;s your UniCampus dashboard.</p>
        </div>

        {/* Profile completion prompt */}
        {user?.profileCompletionPercent < 100 && (
          <div className="mb-6 p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-dark-200 font-medium">Complete your profile</p>
              <p className="text-dark-400 text-sm mt-0.5">
                Your profile is {user?.profileCompletionPercent || 0}% complete.
              </p>
            </div>
            <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                style={{ width: `${user?.profileCompletionPercent || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="auth-card">
            <h3 className="text-dark-400 text-sm font-medium">Role</h3>
            <p className="text-dark-100 text-lg font-semibold mt-1 capitalize">{user?.role || 'Student'}</p>
          </div>
          <div className="auth-card">
            <h3 className="text-dark-400 text-sm font-medium">Department</h3>
            <p className="text-dark-100 text-lg font-semibold mt-1">{user?.department || 'Not set'}</p>
          </div>
          <div className="auth-card">
            <h3 className="text-dark-400 text-sm font-medium">Year</h3>
            <p className="text-dark-100 text-lg font-semibold mt-1">
              {user?.yearOfStudy ? `${user.yearOfStudy}${['st', 'nd', 'rd', 'th'][user.yearOfStudy - 1] || 'th'} Year` : 'Not set'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
