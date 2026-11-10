
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { login } from '../features/auth/authSlice'
import { LockKeyhole, Mail, ArrowRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)
  const { theme, toggleTheme } = useTheme()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    try {
      await dispatch(login(data)).unwrap()
      toast.success('Welcome back to PLATIFY!')
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
            Welcome back
          </h2>
          <p className="mb-8 mt-2 text-[var(--text-muted)]">
            Sign in to manage your business.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--app-bg)] py-3 pl-10 pr-4 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                  {...register('password', {
                    required: 'Password is required'
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[var(--accent)] transition hover:opacity-80">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
