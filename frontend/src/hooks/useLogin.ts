import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginRequest } from '@/types/auth'

export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      await login(data)
    },
    onSuccess: () => {
      toast.success('Welcome back! 🎵')
      navigate('/home')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Login failed. Please try again.')
    },
  })

  return mutation
}
