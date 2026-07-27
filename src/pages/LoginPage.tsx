import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { useLogin } from '@/hooks/useLogin'

import { HeroPanel } from '@/components/HeroPanel'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

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
    /* Full viewport height, no scroll on outer shell */
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#090909' }}>

      {/* ══ LEFT: Hero Panel ══ */}
      <motion.div
        className="hidden lg:flex lg:w-[54%] xl:w-[57%] h-full flex-shrink-0 relative"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeroPanel />
      </motion.div>

      {/* ══ RIGHT: Auth Panel ══ */}
      <div
        className="flex-1 h-full flex flex-col items-center justify-center px-10 lg:px-16 xl:px-20 relative overflow-y-auto"
        style={{
          background: 'linear-gradient(155deg, #111111 0%, #0a0a0a 50%, #090909 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.045)',
        }}
      >
        {/* Ambient background glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(63,214,255,0.06) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(63,214,255,0.04) 0%, transparent 50%)',
          }}
        />

        {/* ── Auth Card ── */}
        <motion.div
          className="relative w-full mx-auto rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/[0.05]"
          style={{ maxWidth: 580, padding: '48px 56px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(24px)' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile-only Logo */}
          <motion.div className="lg:hidden mb-8" variants={itemVariants}>
            <Logo size="md" />
          </motion.div>

          {/* Heading */}
          <motion.div className="mb-7" variants={itemVariants}>
            <h2
              className="font-extrabold mb-3 leading-[1.1]"
              style={{
                fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.78) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome Back
            </h2>
            <p className="text-[#7A7A7A] text-[0.875rem] leading-relaxed">
              Sign in to continue your music journey.
            </p>
          </motion.div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <motion.div className="flex flex-col gap-8" variants={itemVariants}>
              <Input
                label="Email address"
                type="email"
                icon={<Mail size={15} />}
                error={errors.email?.message}
                disabled={isPending}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                icon={<Lock size={15} />}
                error={errors.password?.message}
                disabled={isPending}
                {...register('password')}
              />
            </motion.div>

            {/* Remember + Forgot */}
            <motion.div
              className="flex items-center justify-between mt-6"
              variants={itemVariants}
            >
              <button
                type="button"
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <div
                  className="w-[17px] h-[17px] rounded-[4px] flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  style={{
                    background: rememberMe ? '#3FD6FF' : 'transparent',
                    border: rememberMe
                      ? '1.5px solid #3FD6FF'
                      : '1.5px solid rgba(255,255,255,0.14)',
                    boxShadow: rememberMe ? '0 0 12px rgba(63,214,255,0.35)' : 'none',
                  }}
                >
                  <AnimatePresence>
                    {rememberMe && (
                      <motion.svg
                        key="check-icon"
                        width="9" height="7" viewBox="0 0 9 7" fill="none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <path
                          d="M1 3L3.2 5.5L8 1"
                          stroke="#090909" strokeWidth="1.7"
                          strokeLinecap="round" strokeLinejoin="round"
                        />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-[#707070] text-[0.82rem] group-hover:text-white transition-colors duration-200">
                  Remember me
                </span>
              </button>

              <Link
                to="/forgot-password"
                className="text-[0.82rem] text-[#3FD6FF] hover:text-white transition-colors duration-200 font-medium"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit */}
            <motion.div className="mt-8" variants={itemVariants}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isPending}
                id="btn-sign-in"
              >
                Sign In
              </Button>
            </motion.div>
          </form>



          {/* Footer link */}
          <motion.p
            className="text-center mt-8 text-[0.875rem] text-[#7A7A7A]"
            variants={itemVariants}
          >
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[#3FD6FF] font-semibold hover:text-white transition-colors duration-200"
              id="link-create-account"
            >
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
