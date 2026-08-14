import { Link } from 'react-router-dom'
import { ArrowRight, Target, Brain, TrendingUp, FileText, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Waveform } from '@/components/ui/Waveform'

const heroWave = [30, 55, 40, 80, 60, 95, 70, 45, 85, 65, 50, 90, 35, 75, 55]

const features = [
  {
    icon: Target,
    title: 'Role-matched questions',
    body: 'Tell us the role and we generate an interview built around what that job actually asks — not a generic bank.',
  },
  {
    icon: FileText,
    title: 'Reads your resume',
    body: 'Upload it once. Questions reference your real projects, stack, and experience instead of ignoring them.',
  },
  {
    icon: Brain,
    title: 'Evaluates every answer',
    body: 'Technical accuracy, relevance, clarity, and completeness — scored the moment you finish answering.',
  },
  {
    icon: TrendingUp,
    title: 'Adapts as you go',
    body: 'Answer well and the next question steps up. Struggle, and it meets you where you are instead of piling on.',
  },
]

const steps = [
  { label: 'Set up', body: 'Pick a role, interview type, and difficulty. Upload a resume if you want it personalized.' },
  { label: 'Practice', body: 'Answer questions one at a time, at your own pace, in a focused distraction-free room.' },
  { label: 'Improve', body: 'Get a scored report with a study roadmap built from exactly what you got wrong.' },
]

export default function Landing() {
  return (
    <div className="bg-paper">
      {/* Nav */}
      <header className="container-page flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800">
            <Sparkles className="h-4 w-4 text-ember-400" />
          </div>
          <span className="font-display text-lg font-semibold text-ink-800">Coach</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container-page grid grid-cols-1 gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full bg-ember-50 px-3 py-1 text-xs font-medium text-ember-700">
            Built for technical interviews
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-ink-800 sm:text-5xl lg:text-[3.4rem]">
            Practice smarter.
            <br />
            Interview better.
            <br />
            <span className="text-ember-600">Get hired.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-500">
            A personalized AI interview coach that asks questions built around your resume and target role, then
            scores every answer like a real interviewer would.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/register">
              <Button size="lg">
                Start practicing free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="text-sm font-medium text-ink-500 hover:text-ink-800">
              Already have an account?
            </Link>
          </div>
        </div>

        <div className="animate-rise [animation-delay:150ms]">
          <div className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-cardHover sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Live evaluation</p>
                <p className="mt-1 font-display text-lg font-semibold text-ink-800">
                  &ldquo;Explain how React's reconciliation works.&rdquo;
                </p>
              </div>
            </div>
            <Waveform values={heroWave} animated className="mt-6 h-20" barClassName="w-2" />
            <div className="mt-6 grid grid-cols-4 gap-3 border-t border-ink-100 pt-5 font-mono">
              {[
                ['Technical', 88],
                ['Relevance', 91],
                ['Clarity', 76],
                ['Overall', 85],
              ].map(([label, val]) => (
                <div key={label as string}>
                  <p className="text-[11px] uppercase text-ink-300">{label}</p>
                  <p className="text-lg font-semibold text-ink-800">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-16 sm:py-24">
        <h2 className="font-display text-2xl font-semibold text-ink-800 sm:text-3xl">
          Everything a real interview prep session needs
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl2 border border-ink-100 bg-white p-6 transition-shadow hover:shadow-cardHover">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-50">
                <Icon className="h-5 w-5 text-ink-700" />
              </div>
              <h3 className="mt-4 font-semibold text-ink-800">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-800 py-16 sm:py-24">
        <div className="container-page">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Three steps, start to finish</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.label}>
                <p className="font-mono text-sm text-ember-400">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 font-display text-xl font-semibold text-white">{s.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-200">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 text-center sm:py-24">
        <CheckCircle2 className="mx-auto h-8 w-8 text-sage" />
        <h2 className="mx-auto mt-4 max-w-lg font-display text-2xl font-semibold text-ink-800 sm:text-3xl">
          Your next interview shouldn't be the first time you say the answer out loud.
        </h2>
        <Link to="/register" className="mt-8 inline-block">
          <Button size="lg">
            Create your first interview <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      <footer className="border-t border-ink-100 py-8">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-sm text-ink-300 sm:flex-row">
          <span>© 2026 AI Interview Coach</span>
          <span>Practice smarter. Interview better. Get hired.</span>
        </div>
      </footer>
    </div>
  )
}
