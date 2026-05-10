// eslint-disable-next-line no-unused-vars
import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ResourcesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
            <span className="text-3xl">📚</span> Academic Resources
          </h2>
          <p className="text-dark-400 mt-1">Access study materials, past papers, and class notes shared by your peers.</p>
        </div>
      </div>

      <div className="auth-card py-24 text-center border-dashed border-dark-700 bg-dark-900/40">
        <div className="text-5xl mb-4">🚧</div>
        <h3 className="text-dark-200 font-semibold text-lg mb-2">Resources module is under development</h3>
        <p className="text-dark-400 text-sm max-w-md mx-auto">
          We're currently building the frontend for the Academic Resources module. Check back soon to share and download study materials!
        </p>
      </div>
    </DashboardLayout>
  );
}
