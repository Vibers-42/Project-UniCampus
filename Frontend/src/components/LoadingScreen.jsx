/**
 * @file LoadingScreen.jsx — Full-screen loading indicator
 */

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-dark-400 text-sm">Loading UniCampus...</p>
      </div>
    </div>
  );
}
