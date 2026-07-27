import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, AtSign, Mail, Lock } from 'lucide-react'
import { useRegister } from '@/hooks/useRegister'

import { Logo } from '@/components/Logo'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

import { MusicWave } from '@/components/Equalizer'

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms & Privacy Policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [agreeTerms, setAgreeTerms] = useState(false)
  const { mutate: registerMutate, isPending } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  const onSubmit = (data: SignupFormData) => {
    registerMutate({
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      password: data.password,
    })
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
            filter:
              'brightness(.42) contrast(1.15) saturate(1.15) blur(2px)',
            transform: 'scale(1.05)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#090909]/50 to-[#090909]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-[#090909]/40" />
      </div>

      {/* ── Content Layout ── */}
      <div
        className="
    relative
    z-10
    w-full
    max-w-[1680px]
    min-h-screen
    mx-auto
    flex
    flex-col
    lg:flex-row
    items-center
  "
      >

        {/* ══ LEFT COLUMN ══ */}
        <div
          className="
    w-full
    lg:w-[56%]
    flex
    flex-col
    h-screen
    px-10
    lg:px-20
    xl:px-28
    py-10
  "
        >

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
          <div className="pb-6">
            <p className="text-[#555] text-xs">
              © 2024 Pulse. All rights reserved. &nbsp;·&nbsp; Terms of Service &nbsp;·&nbsp; Privacy Policy
            </p>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div
          className="
        w-full
        lg:w-[44%]
        flex
        items-center
        justify-center
        px-8
        lg:px-12
        py-12
    "
        >
          {/*
            Per spec:
            - Card Width: 500px
            - Min Height: 780px
            - Padding (All sides): 40px
            - Padding Left (Inside): 40px
            - Input Height: 56px
            - Spacing Between Fields: 20px
            - Border Radius: 24px
            - Card Blur: 16px
            - Border: 1px solid rgba(255,255,255,0.06)
          */}
          <motion.div
            className="w-full rounded-[24px]"
            style={{
              maxWidth: 580,
              minHeight: 780,
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
            <div className="mb-10">
              <h2 className="text-[32px] font-bold text-white tracking-tight leading-tight mb-2">
                Create Account
              </h2>
              <p className="text-[#888] text-[15px]">Join millions of music lovers.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 flex flex-col">
              <div className="flex flex-col gap-5">
                <Input
                  label="Full Name"
                  type="text"
                  icon={<User size={16} />}
                  error={errors.fullName?.message}
                  disabled={isPending}
                  {...register('fullName')}
                />
                <Input
                  label="Username"
                  type="text"
                  icon={<AtSign size={16} />}
                  error={errors.username?.message}
                  disabled={isPending}
                  {...register('username')}
                />
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
                <Input
                  label="Confirm Password"
                  type="password"
                  icon={<Lock size={16} />}
                  error={errors.confirmPassword?.message}
                  disabled={isPending}
                  {...register('confirmPassword')}
                />
              </div>

              {/* Terms checkbox */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  className="flex items-start gap-3 cursor-pointer text-left w-full"
                  onClick={() => {
                    const next = !agreeTerms
                    setAgreeTerms(next)
                    setValue('agreeTerms', next as true, { shouldValidate: true })
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-[4px] flex items-center justify-center transition-all duration-200 shrink-0 mt-[1px]"
                    style={{
                      background: agreeTerms ? '#3FD6FF' : 'transparent',
                      border: agreeTerms
                        ? '2px solid #3FD6FF'
                        : errors.agreeTerms
                          ? '2px solid rgba(239,68,68,0.6)'
                          : '2px solid rgba(255,255,255,0.18)',
                      boxShadow: agreeTerms ? '0 0 10px rgba(63,214,255,0.3)' : 'none',
                    }}
                  >
                    {agreeTerms && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#090909" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[#888] text-[13px] leading-relaxed">
                    I agree to the{' '}
                    <span className="text-[#3FD6FF]">Terms of Service</span>
                    {' '}&{' '}
                    <span className="text-[#3FD6FF]">Privacy Policy</span>
                  </span>
                </button>
                {errors.agreeTerms && (
                  <motion.p
                    className="text-red-400 text-[11.5px] ml-8"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.agreeTerms.message as string}
                  </motion.p>
                )}
              </div>

              {/* Submit button — margin-top: 30px per spec */}
              <div className="mt-8">
                <Button type="submit" variant="primary" fullWidth isLoading={isPending}>
                  Create Account
                </Button>
              </div>
            </form>

            {/* Bottom link — padding-bottom accounted by container's 40px padding */}
            <p className="text-center mt-auto pt-10 text-[13px] text-[#777]">
              Already have an account?{' '}
              <Link to="/" className="text-[#3FD6FF] font-semibold hover:text-white transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}