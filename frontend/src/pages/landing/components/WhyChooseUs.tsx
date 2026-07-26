import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Smartphone, RefreshCw, LayoutDashboard } from "lucide-react";

const benefits = [
  {
    title: "Fast Approvals",
    description: "One-click approvals for managers, instantly notifying the team.",
    icon: Zap,
    topColor: "bg-[#0b1b60]", 
    frontColor: "bg-[#050d36]",
    badgeColor: "bg-[#0b1b60]",
    iconColor: "text-[#0b1b60]",
    staggerClass: "lg:mt-0"
  },
  {
    title: "Easy Management",
    description: "Centralized dashboard to view team availability and pending requests.",
    icon: LayoutDashboard,
    topColor: "bg-[#183296]",
    frontColor: "bg-[#0d1e63]", 
    badgeColor: "bg-[#183296]",
    iconColor: "text-[#183296]",
    staggerClass: "lg:mt-16"
  },
  {
    title: "Simple Interface",
    description: "Intuitive design requiring zero training for your employees.",
    icon: CheckCircle2,
    topColor: "bg-[#0370c9]", 
    frontColor: "bg-[#014d8f]",
    badgeColor: "bg-[#0370c9]",
    iconColor: "text-[#0370c9]",
    staggerClass: "lg:mt-32"
  },
  {
    title: "Real-time Updates",
    description: "Live synchronization of leave balances and approval statuses.",
    icon: RefreshCw,
    topColor: "bg-[#00a6e0]", 
    frontColor: "bg-[#007ba6]",
    badgeColor: "bg-[#00a6e0]",
    iconColor: "text-[#00a6e0]",
    staggerClass: "lg:mt-32"
  },
  {
    title: "Secure Data",
    description: "Enterprise-grade encryption and strict role-based access.",
    icon: Shield,
    topColor: "bg-[#04b5a2]", 
    frontColor: "bg-[#028576]",
    badgeColor: "bg-[#04b5a2]",
    iconColor: "text-[#04b5a2]",
    staggerClass: "lg:mt-16"
  },
  {
    title: "Mobile Friendly",
    description: "Seamlessly works across all devices, from desktop to mobile.",
    icon: Smartphone,
    topColor: "bg-[#1cc08b]", 
    frontColor: "bg-[#128f66]",
    badgeColor: "bg-[#1cc08b]",
    iconColor: "text-[#1cc08b]",
    staggerClass: "lg:mt-0"
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-10 lg:py-16 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-16">
          <h2 className="text-sm font-bold tracking-wider text-blue-600 uppercase mb-2">Why Choose Us</h2>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">The Modern HR Advantage</h3>
          <p className="text-base text-slate-600">
            Ditch the spreadsheets and legacy tools. Experience a leave management system built for speed, security, and simplicity.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-16 lg:gap-y-0 lg:pb-16 max-w-[1400px] mx-auto pt-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex flex-col items-center w-full group pt-32 ${benefit.staggerClass}`}
              >
                {/* Badge and Line */}
                {/* -ml-[18px] aligns the badge with the center of the left-skewed top face */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -ml-[18px] flex flex-col items-center z-20">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl ${benefit.badgeColor}`}>
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${benefit.iconColor}`} />
                    </div>
                  </div>
                  {/* Dashed line */}
                  <div className="w-px h-24 border-l border-dashed border-slate-300 mt-2 opacity-80"></div>
                  {/* Dot on the platform */}
                  <div className="w-1.5 h-1.5 rounded-full bg-white absolute bottom-[-3px] shadow-sm z-30"></div>
                </div>

                {/* Platform */}
                <div className="relative w-full px-2 z-10">
                  {/* Top Face - Skewed left to match Image 1 */}
                  <div className={`h-16 w-full origin-bottom skew-x-[30deg] border-t border-l border-white/10 ${benefit.topColor}`}></div>
                  {/* Front Face - Thicker block to match Image 1 */}
                  <div className={`h-8 w-full shadow-lg ${benefit.frontColor}`}></div>
                </div>

                {/* Text below */}
                <div className="mt-8 text-center px-1 relative z-0">
                  <h4 className="font-bold text-slate-800 text-[15px]">{benefit.title}</h4>
                  <p className="text-[13px] text-slate-500 mt-3 leading-relaxed hidden lg:block">{benefit.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
