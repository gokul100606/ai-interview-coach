import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function ScoreTrendChart({ data }: { data: { date: string; score: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8A33D" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#E8A33D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E3EE" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          tick={{ fontSize: 12, fill: '#8B90B3' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#8B90B3' }} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E1E3EE', fontSize: 13 }}
          labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <Area type="monotone" dataKey="score" stroke="#E8A33D" strokeWidth={2.5} fill="url(#scoreFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
