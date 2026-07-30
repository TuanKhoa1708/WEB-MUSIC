import { motion } from 'framer-motion'

import { Logo } from './Logo'
import { MusicWave } from './Equalizer'

export function HeroPanel() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image with slow zoom */}
      <div className="absolute inset-0 hero-zoom">
        <img
          src="/hero-artist.png"
          alt="Artist"
          className="w-full h-full object-cover object-center"
          style={{
            filter: 'brightness(.42) contrast(1.15) saturate(1.15) blur(2px)',
            transform: 'scale(1.05)',
          }}
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#090909]/50 to-[#090909]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-[#090909]/40" />

      {/* Cyan ambient radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 25% 55%, rgba(63,214,255,0.07) 0%, transparent 55%)',
        }}
      />

      {/* ── CONTENT LAYOUT ── */}
      <div className="relative h-full flex flex-col px-10 lg:px-20 xl:px-28 py-10">

        {/* TOP: Logo */}
        <div className="flex-shrink-0 pt-2">
          <Logo size="md" />
        </div>

        {/* MIDDLE: Tagline — vertically centered */}
        <div className="flex-1 flex items-center">
          <div className="max-w-[520px]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Label */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[1px] bg-[#3FD6FF]" />
              <span className="text-[#3FD6FF] text-[10px] font-bold tracking-[0.2em] uppercase">
                Your Music Universe
              </span>
            </div>

            {/* Heading */}
            <h1
              className="font-bold leading-[1.05] mb-5 tracking-tight"
              style={{
                fontSize: 'clamp(58px, 6vw, 86px)',
                letterSpacing: '-0.04em',
              }}
            >
              <span className="text-white">Feel</span>
              <br />
              <span className="text-[#3FD6FF]">Every Beat.</span>
            </h1>

            <p className="text-[#999] text-[15px] leading-relaxed max-w-[420px] mb-6">
              Millions of songs, endless discovery.<br />
              Your perfect soundtrack awaits.
            </p>

            {/* Waveform */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <MusicWave className="h-7 opacity-80" />
            </motion.div>
          </motion.div>
          </div>
        </div>

      </div>
    </div>
  )
}
