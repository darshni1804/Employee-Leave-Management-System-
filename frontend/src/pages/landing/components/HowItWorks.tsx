import { motion } from "framer-motion";
import { LogIn, FileEdit, UserCheck, Activity, ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Employee Login",
    description: "Securely log into the portal using your organizational credentials.",
    icon: LogIn,
  },
  {
    title: "Apply Leave",
    description: "Select dates, choose leave type, and submit the request in clicks.",
    icon: FileEdit,
  },
  {
    title: "Manager Approves",
    description: "Managers get notified instantly and can approve with a single tap.",
    icon: UserCheck,
  },
  {
    title: "Track Status",
    description: "Monitor approval status and track your remaining balance in real-time.",
    icon: Activity,
  }
];

export function HowItWorks() {
  return (
    <section className="py-8 bg-white relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-sm font-bold tracking-wider text-indigo-600 uppercase mb-2">Simple Process</h2>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">How it works in practice</h3>
          <p className="text-base text-slate-600">
            A frictionless workflow that connects employees and managers instantly. No paperwork, no confusion.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="flex flex-col items-center text-center group relative"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-20 shadow-lg border-2 border-white">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Animated Arrow between steps on Desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 -right-[20%] lg:-right-[25%] z-0 text-indigo-300">
                      <motion.div
                        animate={{ x: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-8 h-8" />
                      </motion.div>
                    </div>
                  )}

                  <h4 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h4>
                  <p className="text-slate-600 leading-relaxed max-w-[250px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
