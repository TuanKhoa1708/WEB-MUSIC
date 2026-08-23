import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES } from '@/constants/roles'
import type { LoginRequest } from '@/types/auth'

function getRoleRedirect(role: string): string {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard'
    case ROLES.ARTIST:
      return '/artist/dashboard'
    default:
      return '/home'
  }
}

export function useLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      return login(data)
    },
    onSuccess: (user) => {
      toast.success('Welcome back! 🎵')
      const redirect = user?.role ? getRoleRedirect(user.role) : '/home'
      navigate(redirect)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Login failed. Please try again.')
    },
  })

  return mutation
}

