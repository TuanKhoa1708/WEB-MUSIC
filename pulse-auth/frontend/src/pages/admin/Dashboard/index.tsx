import { motion } from 'framer-motion'
import { LayoutDashboard } from 'lucide-react'

export function AdminDashboardPage() {
  return (
    <div style={{ padding: "clamp(16px, 3vw, 28px)", minHeight: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[11px] bg-[#3FD6FF]/10 border border-[#3FD6FF]/20 flex items-center justify-center text-[#3FD6FF]">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-white tracking-[-0.03em] m-0">
              Dashboard
            </h1>
            <p className="text-[13px] text-[#888] mt-0.5 m-0">
              Overview of Pulse platform metrics
            </p>
          </div>
        </div>

        <div className="mt-12 p-10 rounded-2xl border border-dashed border-white/5 text-center">
          <div className="text-[32px] mb-3">🚀</div>
          <p className="text-[#666] text-sm m-0">
            Dashboard metrics coming soon.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
