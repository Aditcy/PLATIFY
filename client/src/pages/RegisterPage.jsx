
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { register as registerAccount } from '../features/auth/authSlice'
import { User, Mail, LockKeyhole, ArrowRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const { theme, toggleTheme } = useTheme()

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
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 py-8 text-[var(--text-primary)] sm:px-6">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] sm:right-8 sm:top-8"
      >
        {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            PLATIFY
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Retail Commerce & Store Management
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-xl sm:p-8">
          <h2 className="text-2xl font-semibold">
            Create your account
          </h2>
          <p className="mb-8 mt-2 text-[var(--text-muted)]">
            Get started with your business workspace.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-[var(--text-muted)]" size={18} />
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--app-bg)] py-3 pl-10 pr-4 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
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
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-[var(--text-muted)]" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--app-bg)] py-3 pl-10 pr-4 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                  {...register('email', {
                    required: 'Email is required'
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 text-[var(--text-muted)]" size={18} />
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--app-bg)] py-3 pl-10 pr-4 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
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
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                Confirm password
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--app-bg)] px-4 py-3 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match'
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--accent)] transition hover:opacity-80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
