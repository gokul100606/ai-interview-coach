import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { TopicPerformance } from '@/types/result'

const colorFor = (v: number) => (v >= 75 ? '#3F9142' : v >= 50 ? '#E8A33D' : '#D14B3D')

export function SkillBarChart({ data }: { data: TopicPerformance[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          dataKey="topic"
          type="category"
          width={110}
          tick={{ fontSize: 13, fill: '#3A3F63' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E1E3EE', fontSize: 13 }} cursor={{ fill: '#F2F3F7' }} />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={14}>
          {data.map((entry, i) => (
            <Cell key={i} fill={colorFor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
