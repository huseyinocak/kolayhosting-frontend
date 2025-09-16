// src/components/admin/ScoreWeightsPanel.jsx
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToastContext } from '@/hooks/toast-utils'
import { getScoreWeights, updateScoreWeights } from '@/api/adminSettings'

const clamp = (v) => Math.max(0, Math.min(100, Number(v)||0))

export default function ScoreWeightsPanel() {
  const { toast } = useToastContext()
  const [w, setW] = useState({ price:25, performance:25, support:25, refund:25 })
  const total = w.price + w.performance + w.support + w.refund

  useEffect(() => { (async () => { const initial = await getScoreWeights(); if (initial) setW(initial) })() }, [])

  const onChange = (key, val) => setW(prev => ({ ...prev, [key]: clamp(val) }))

  const onSave = async () => {
    const norm = { ...w }
    const sum = Math.max(1, norm.price + norm.performance + norm.support + norm.refund)
    Object.keys(norm).forEach(k => norm[k] = Math.round(100 * norm[k] / sum))
    await updateScoreWeights(norm)
    setW(norm)
    toast({ title: 'Ağırlıklar kaydedildi', description: `Toplam %${norm.price+norm.performance+norm.support+norm.refund}` })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skor Ağırlıkları</CardTitle>
        <CardDescription>Fiyat, performans, destek ve iade ağırlıkları (toplam 100).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          ['price','Fiyat'],
          ['performance','Performans'],
          ['support','Destek'],
          ['refund','İade Süresi'],
        ].map(([key,label]) => (
          <div key={key} className="grid grid-cols-3 items-center gap-2">
            <Label htmlFor={key}>{label}</Label>
            <input id={key} type="range" min="0" max="100" value={w[key]} onChange={e=>onChange(key, e.target.value)} />
            <Input type="number" min="0" max="100" value={w[key]} onChange={e=>onChange(key, e.target.value)} />
          </div>
        ))}

        <div className={total===100 ? 'text-sm text-green-600' : 'text-sm text-amber-600'}>Toplam: {total}</div>
        <div className="flex justify-end"><Button onClick={onSave}>Kaydet</Button></div>
      </CardContent>
    </Card>
  )
}
