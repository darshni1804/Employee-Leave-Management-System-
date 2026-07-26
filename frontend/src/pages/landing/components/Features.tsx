import { motion } from "framer-motion";
import { 
  CalendarDays, 
  CheckSquare, 
  Wallet, 
  ShieldCheck, 
  Mail, 
  BarChart3, 
  Smartphone, 
  Users 
} from "lucide-react";

const features = [
  {
    title: "Employee Leave Requests",
    description: "Submit leave requests easily with a streamlined interface. Choose leave types, dates, and add remarks in seconds.",
    icon: CalendarDays,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Manager Approval Workflow",
    description: "Review, approve, or reject leave requests in real-time. Managers get a comprehensive view of team availability.",
    icon: CheckSquare,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Leave Balance Tracking",
    description: "Keep track of available, used, and accrued leaves automatically without manual spreadsheet calculations.",
    icon: Wallet,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Secure Authentication",
    description: "Enterprise-grade security with JWT authentication to ensure your organization's data remains private and protected.",
    icon: ShieldCheck,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    title: "Email Notifications",
    description: "Automated alerts keep both employees and managers in the loop regarding request statuses and approvals.",
    icon: Mail,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Analytics Dashboard",
    description: "Gain visual insights into organizational leave trends, absenteeism, and department-wise availability.",
    icon: BarChart3,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    title: "Responsive System",
    description: "Access the platform seamlessly from any device—desktop, tablet, or mobile phone with a native-like experience.",
    icon: Smartphone,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    title: "Role Based Access",
    description: "Strict role-based permissions ensuring employees, managers, and admins only see what they are authorized to.",
    icon: Users,
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-50",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export function Features() {
  return (
    <section id="features" className="py-8 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-sm font-bold tracking-wider text-blue-600 uppercase mb-2">Powerful Features</h2>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">Everything you need to manage leaves</h3>
          <p className="text-base text-slate-600">
            A comprehensive suite of tools designed to remove the friction from HR processes, freeing up time for what truly matters.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-blue-400 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bgColor} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
