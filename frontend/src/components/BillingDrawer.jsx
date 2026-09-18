import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Crown,
  Zap,
  Check,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight,
  Layers,
  FileCode2,
  FileSearch
} from "lucide-react";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createOrder } from "../features/billing.api";
import { setUserData } from "../redux/user.slice";
import api from "../utils/axios";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "₹199",
    credits: 500,
    popular: false,
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    btnColor: "bg-blue-600 hover:bg-blue-500 text-white",
    features: [
      "500 AI Credits",
      "Chat & Search Agent",
      "HTML / CSS / JS Code Studio",
      "Standard Speed"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    credits: 1000,
    popular: true,
    color: "from-indigo-500/30 to-purple-500/20 border-indigo-500/50 ring-1 ring-indigo-500/30",
    btnColor: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30",
    features: [
      "1,000 AI Credits",
      "120B Fast Code Engine",
      "Artifacts Live Preview & ZIP Export",
      "PDF Vector RAG & PPT Generation",
      "Priority Queue Access"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹1,499",
    credits: 5000,
    popular: false,
    color: "from-amber-500/20 to-rose-500/10 border-amber-500/30",
    btnColor: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white",
    features: [
      "5,000 AI Credits",
      "Unlimited High-Speed Chat",
      "All Agents Unlocked (Vision, PPT, Image)",
      "Dedicated High-Concurrency Quota",
      "24/7 Priority Support"
    ]
  }
];

export default function BillingDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const credits = userData?.credits ?? 0;
  const totalCredits = userData?.totalCredits ?? (credits > 0 ? credits : 100);
  const percentage = Math.min(100, Math.max(0, Math.round((credits / (totalCredits || 1)) * 100)));

  const handleUpgrade = async (planId) => {
    try {
      setLoadingPlan(planId);
      const data = await createOrder(planId);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Bearly AI",
        description: `${data.plan.name} Plan Upgrade`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/api/billing/verify-payment", response);
            if (verifyRes.data?.user) {
              dispatch(setUserData(verifyRes.data.user));
            }
            onClose();
          } catch (error) {
            console.error("Payment verification error:", error);
          }
        },
        theme: {
          color: "#4F46E5"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Order creation failed:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-[440px] bg-[#0c0e14] border-l border-white/[0.08] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#0e111a]/80 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
                  <Sparkles size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-white text-[16px] font-semibold">Plans & Credits</h2>
                  <p className="text-slate-400 text-[11.5px]">Power your workflow with AI</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors border-none cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Balance Card */}
            <div className="p-5 pb-2 shrink-0">
              <div className="rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] p-4.5 shadow-lg relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Current Plan
                    </span>
                    <h3 className="text-white text-xl font-bold mt-0.5 flex items-center gap-2">
                      {userData?.plan ? userData.plan.toUpperCase() : "FREE"}
                      <Crown size={17} className="text-amber-400 fill-amber-400/20" />
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Available
                    </span>
                    <p className="text-emerald-400 font-bold text-lg font-mono">
                      {credits} <span className="text-xs text-slate-400 font-sans">credits</span>
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                    <span>Usage</span>
                    <span>{percentage}% remaining</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Plans List (Scrollable) */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto [scrollbar-width:none]">
              <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                Choose a Plan
              </p>

              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl border bg-gradient-to-b ${plan.color} p-4.5 transition-all duration-200 relative group`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-0.5 rounded-full shadow-md">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold text-[15px]">{plan.name}</h4>
                      <p className="text-slate-400 text-xs mt-0.5">{plan.credits} AI credits</p>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-2xl font-bold">{plan.price}</span>
                      <span className="text-slate-400 text-[11px] block">one-time</span>
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="mt-3.5 space-y-2 border-t border-white/[0.06] pt-3">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-300 text-[12px]">
                        <Check size={13} className="text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loadingPlan === plan.id}
                    className={`mt-4 w-full py-2.5 rounded-xl text-[12.5px] font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 border-none cursor-pointer ${plan.btnColor} disabled:opacity-50`}
                  >
                    {loadingPlan === plan.id ? (
                      "Processing..."
                    ) : (
                      <>
                        Upgrade to {plan.name}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Trust Tag */}
            <div className="p-4 border-t border-white/[0.08] bg-[#0a0c10] flex items-center justify-center gap-2 shrink-0">
              <ShieldCheck size={15} className="text-emerald-400" />
              <p className="text-[11px] text-slate-400">
                Secured by Razorpay • 256-bit Encrypted Checkout
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
