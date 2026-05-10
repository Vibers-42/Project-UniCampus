import Sidebar from './Sidebar';
import Navbar from './Navbar';
import RightWidgets from './RightWidgets';

export default function DashboardLayout({ children, hideWidgets = false, rightSidebar }) {
  const showRightPanel = !hideWidgets || rightSidebar;

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all lg:ml-64 ${showRightPanel ? 'xl:mr-80' : ''}`}>
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {showRightPanel && (
        rightSidebar ? rightSidebar : <RightWidgets />
      )}
    </div>
  );
}
