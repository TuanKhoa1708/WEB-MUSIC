import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { useLogin } from '@/hooks/useLogin'

import { Logo } from '@/components/common/Logo/Logo'
import { Input } from '@/components/common/Input/Input'
import { Button } from '@/components/common/Button/Button'
import { MusicWave } from '@/components/auth/Equalizer/Equalizer'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false)
  const { mutate: loginMutate, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (data: LoginFormData) => {
    loginMutate({ email: data.email, password: data.password })
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-x-hidden bg-[#090909]">

      {/* ── Background Image ── */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-[65%] overflow-hidden">
        <img
          src="/hero-artist.png"
          alt="Artist"
          className="w-full h-full object-cover object-center"
          style={{
            filter: 'brightness(.42) contrast(1.15) saturate(1.15) blur(2px)',
            transform: 'scale(1.05)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#090909]/50 to-[#090909]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-[#090909]/40" />
      </div>

      {/* ── Content Layout ── */}
      <div className="relative z-10 w-full max-w-[1680px] min-h-screen mx-auto flex flex-col lg:flex-row items-center">

        {/* ══ LEFT COLUMN ══ */}
        <div className="w-full lg:w-[56%] flex flex-col h-screen px-10 lg:px-20 xl:px-28 py-10">
          {/* Top: Logo */}
          <div className="pt-2">
            <Logo size="md" />
          </div>

          {/* Center: Hero text */}
          <div className="flex-1 flex items-center">
            <div className="max-w-[520px]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-[1px] bg-[#3FD6FF]" />
                <span className="text-[#3FD6FF] text-[10px] font-bold tracking-[0.2em] uppercase">
                  Your Music Universe
                </span>
              </div>

              <h1 className="font-bold leading-[1.05] mb-5 tracking-tight"
                style={{
                  fontSize: 'clamp(58px, 6vw, 86px)',
                  letterSpacing: '-0.04em'
                }}>
                <span className="text-white">Feel</span>
                <br />
                <span className="text-[#3FD6FF]">Every Beat.</span>
              </h1>

              <p className="text-[#999] text-[15px] leading-relaxed max-w-[420px] mb-6">
                Millions of songs, endless discovery.<br />
                Your perfect soundtrack awaits.
              </p>

              <div className="mt-8">
                <MusicWave className="h-7 opacity-80" />
              </div>
            </div>
          </div>

          {/* Bottom: footer */}
          <div className="pb-6 hidden lg:block">
            <p className="text-[#555] text-xs">
              © 2024 Pulse. All rights reserved. &nbsp;·&nbsp; Terms of Service &nbsp;·&nbsp; Privacy Policy
            </p>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="w-full lg:w-[44%] flex items-center justify-center px-8 lg:px-12 py-12">
          <motion.div
            className="w-full rounded-[24px]"
            style={{
              maxWidth: 580,
              padding: '48px 56px',
              background: 'rgba(13,13,13,0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 32px 64px -12px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Heading */}
            <div style={{ marginBottom: '40px' }}>
              <h2 className="text-[32px] font-bold text-white tracking-tight leading-tight mb-2">
                Welcome Back
              </h2>
              <p className="text-[#888] text-[15px]">
                Sign in to continue your music journey.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-5">
                <Input
                  label="Email address"
                  type="email"
                  icon={<Mail size={16} />}
                  error={errors.email?.message}
                  disabled={isPending}
                  {...register('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  icon={<Lock size={16} />}
                  error={errors.password?.message}
                  disabled={isPending}
                  {...register('password')}
                />
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  className="flex items-center gap-3 cursor-pointer text-left"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <div
                    className="w-5 h-5 rounded-[4px] flex items-center justify-center transition-all duration-200 shrink-0 mt-[1px]"
                    style={{
                      background: rememberMe ? '#3FD6FF' : 'transparent',
                      border: rememberMe
                        ? '2px solid #3FD6FF'
                        : '2px solid rgba(255,255,255,0.18)',
                      boxShadow: rememberMe ? '0 0 10px rgba(63,214,255,0.3)' : 'none',
                    }}
                  >
                    <AnimatePresence>
                      {rememberMe && (
                        <motion.svg
                          key="check-icon"
                          width="10" height="8" viewBox="0 0 10 8" fill="none"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="#090909" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-[#888] text-[13px] leading-relaxed hover:text-white transition-colors duration-200">
                    Remember me
                  </span>
                </button>

                <Link
                  to="/forgot-password"
                  className="text-[13px] text-[#3FD6FF] hover:text-white transition-colors duration-200 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <div className="mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isPending}
                  id="btn-sign-in"
                >
                  Sign In
                </Button>
              </div>
            </form>

            {/* Footer link */}
            <p className="text-center mt-8 text-[13px] text-[#777]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[#3FD6FF] font-semibold hover:text-white transition-colors duration-200"
                id="link-create-account"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
