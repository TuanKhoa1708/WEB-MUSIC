import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerService } from '@/services/auth.service'
import type { RegisterRequest } from '@/types/auth'

export function useRegister() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (data: RegisterRequest) => registerService(data),
    onSuccess: () => {
      toast.success('Account created! Please sign in. 🎉')
      navigate('/')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Registration failed. Please try again.')
    },
  })

  return mutation
}
