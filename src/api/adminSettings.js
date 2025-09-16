// src/api/adminSettings.js
import apiClient from '@/lib/apiClient'
import normalizeApiError from '@/utils/normalizeApiError'

export async function getScoreWeights() {
  try {
    const res = await apiClient.get('/admin/settings/score-weights')
    return res.data?.data || res.data
  } catch (error) {
    const ls = localStorage.getItem('scoreWeights')
    return ls ? JSON.parse(ls) : { price:25, performance:25, support:25, refund:25 }
  }
}
export async function updateScoreWeights(payload) {
  try {
    const res = await apiClient.put('/admin/settings/score-weights', payload)
    return res.data
  } catch (error) {
    localStorage.setItem('scoreWeights', JSON.stringify(payload))
    return { ok: true, persisted: 'local' }
  }
}
