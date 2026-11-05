import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { register as registerAccount } from '../features/auth/authSlice'
import { User, Mail, LockKeyhole, ArrowRight } from 'lucide-react'

function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...userData } = data

      await dispatch(registerAccount(userData)).unwrap()

      toast.success('Your PLATIFY account has been created!')
      navigate('/businesses')
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            PLATIFY
          </h1>
          <p className="text-slate-400 mt-2">
            Retail Commerce & Store Management
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-white">
            Create your account
          </h2>
          <p className="text-slate-400 mt-2 mb-8">
            Get started with your business workspace.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must contain at least 2 characters'
                    }
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
                  {...register('email', {
                    required: 'Email is required'
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-500"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must contain at least 8 characters'
                    },
                    maxLength: {
                      value: 72,
                      message: 'Password cannot exceed 72 characters'
                    }
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Confirm password
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white outline-none focus:border-indigo-500"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match'
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage