import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import { getApiErrorMessage } from '@/services/api'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) {
      setError('Fill in every field to create your account.')
      return
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    setIsLoading(true)
    try {
      await register(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not create your account. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-rise">
      <h1 className="font-display text-2xl font-semibold text-ink-800">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-400">Free to start. No credit card needed.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <Input label="Full name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Rao" />
        <Input label="Email" type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
        {error && (
          <p role="alert" className="rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-ink-800 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}