/**
 * @file AuthLayout.jsx — Shared layout for auth pages
 *
 * Provides the consistent visual wrapper for all auth pages:
 * centered glassmorphism card, gradient background, UniCampus branding.
 */

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
            UniCampus
          </h1>
          <p className="text-dark-500 text-xs mt-1 tracking-widest uppercase">
            Aditya University
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {title && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-dark-100">{title}</h2>
              {subtitle && <p className="text-dark-400 text-sm mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
