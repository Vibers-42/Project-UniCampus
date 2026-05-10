export default function RightSidebar() {
  return (
    <div className="hidden lg:block space-y-6">
      <div className="auth-card p-5 border border-primary-500/10 bg-gradient-to-b from-dark-900 to-dark-900/80">
        <h3 className="text-dark-100 font-semibold mb-3 flex items-center gap-2">
          <span className="text-xl">🤖</span> AI Doubt Solver
        </h3>
        <p className="text-dark-400 text-xs mb-4 leading-relaxed">Ask any academic question and get instant AI-powered answers.</p>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Type your doubt..." 
            className="input-field text-sm py-2.5 pr-10 bg-dark-950 border-dark-800" 
          />
          <button className="absolute right-2 top-2.5 text-primary-500 hover:text-primary-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="auth-card p-5">
        <h3 className="text-dark-100 font-semibold mb-4 text-sm uppercase tracking-wider text-primary-400">📅 Upcoming Events</h3>
        <div className="space-y-4">
          <div className="flex gap-3 items-center group cursor-pointer">
            <div className="bg-dark-950 border border-dark-800 rounded-xl p-2 text-center min-w-[3.5rem] group-hover:border-primary-500/50 transition-colors">
              <div className="text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">MAY</div>
              <div className="text-dark-100 font-bold text-lg leading-none">15</div>
            </div>
            <div>
              <h4 className="text-dark-200 text-sm font-medium group-hover:text-primary-400 transition-colors">Hackathon 2026</h4>
              <p className="text-dark-500 text-xs mt-0.5">Main Campus Auditorium</p>
            </div>
          </div>
          <div className="flex gap-3 items-center group cursor-pointer">
            <div className="bg-dark-950 border border-dark-800 rounded-xl p-2 text-center min-w-[3.5rem] group-hover:border-primary-500/50 transition-colors">
              <div className="text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">MAY</div>
              <div className="text-dark-100 font-bold text-lg leading-none">18</div>
            </div>
            <div>
              <h4 className="text-dark-200 text-sm font-medium group-hover:text-primary-400 transition-colors">Tech Talk: Web3</h4>
              <p className="text-dark-500 text-xs mt-0.5">Virtual Session</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-card p-5">
        <h3 className="text-dark-100 font-semibold mb-4 text-sm uppercase tracking-wider text-primary-400">🔥 Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
          {['#ReactJS', '#Internships', '#DataScience', '#Exams', '#CampusLife'].map(tag => (
            <span key={tag} className="chip bg-dark-900 border-dark-800 text-dark-300 hover:text-primary-400 hover:border-primary-500/30 cursor-pointer transition-colors text-xs py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
