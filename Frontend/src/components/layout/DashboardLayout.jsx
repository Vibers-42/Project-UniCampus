import Sidebar from './Sidebar';
import Navbar from './Navbar';
import RightWidgets from './RightWidgets';

/**
 * DashboardLayout — shared shell for all app pages.
 *
 * Props:
 *   children      — main content
 *   hideWidgets   — hide the right panel entirely
 *   rightContent  — override the right panel with custom JSX
 *                   (e.g. ResourceRightPanel on /resources)
 */
export default function DashboardLayout({ children, hideWidgets = false, rightContent }) {
  const showRight = !hideWidgets;

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar />

      {/* Main column — offset for sidebar (lg: 256px) and optional right panel (xl: 320px) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all lg:ml-64 ${showRight ? 'xl:mr-80' : ''}`}>
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Right panel — fixed, 320px wide */}
      {showRight && (
        rightContent ? (
          <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:flex flex-col overflow-y-auto">
            <div className="p-5 flex flex-col gap-4 mt-16">
              {rightContent}
            </div>
          </aside>
        ) : (
          <RightWidgets />
        )
      )}
    </div>
  );
}
