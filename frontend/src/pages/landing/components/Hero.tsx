import { motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2, PieChart, Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative pt-16 pb-8 lg:pt-20 lg:pb-10 overflow-hidden bg-white">
      {/* Background glowing blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-100/50 blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-medium text-sm mb-6 border border-blue-100"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Modern HR Software
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
            >
              Smart Employee <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Leave Management
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Simplify leave requests, approvals, leave tracking, and workforce management with a secure and efficient platform built for modern organizations.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/login"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold overflow-hidden transition-all hover:bg-blue-700 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] w-full sm:w-auto"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 transition-all hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </button>
            </motion.div>
          </div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative w-full max-w-lg mx-auto lg:max-w-none"
          >
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-2xl overflow-hidden p-6">
              
              {/* Dashboard Header Mock */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-slate-200 rounded-md mb-2"></div>
                    <div className="h-3 w-16 bg-slate-100 rounded-md"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 relative"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
                  </motion.div>
                </div>
              </div>

              {/* Stats Row Mock */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">12</div>
                    <div className="text-xs text-slate-500 font-medium">Leaves Available</div>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">3</div>
                    <div className="text-xs text-slate-500 font-medium">Pending Requests</div>
                  </div>
                </motion.div>
              </div>

              {/* Floating Cards (Leaves Mock) */}
              <div className="relative h-40">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute top-0 left-0 right-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 z-20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 mb-1">Annual Leave</div>
                      <div className="text-xs text-slate-500">Oct 24 - Oct 28</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold">
                      Pending
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute top-16 left-4 right-0 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 z-10 scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 mb-1">Sick Leave</div>
                      <div className="text-xs text-slate-500">Sep 10 - Sep 11</div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approved
                    </motion.div>
                  </div>
                </motion.div>
              </div>
              
              {/* Decorative Glass Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
