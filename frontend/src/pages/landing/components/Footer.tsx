export function Footer() {
  return (
    <footer className="bg-slate-50 pt-16 pb-8 border-t border-slate-200">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                TECHNODHA LEAVEMATE
              </span>
            </div>
            <p className="text-slate-500 font-medium">Employee Leave Management System</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Built with</span>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">Next.js / React</span>
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">Django REST</span>
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">PostgreSQL</span>
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">JWT Auth</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} TECHNODHA LEAVEMATE. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <span className="cursor-not-allowed hover:text-slate-800 transition-colors">Privacy Policy</span>
            <span className="cursor-not-allowed hover:text-slate-800 transition-colors">Terms of Service</span>
            <span className="cursor-not-allowed hover:text-slate-800 transition-colors">Responsive Design</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
