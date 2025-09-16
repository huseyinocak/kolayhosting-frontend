// src/api/imports.js
import apiClient from '@/lib/apiClient'
import normalizeApiError from '@/utils/normalizeApiError'

export async function importPlansBulk(records) {
  try { const res = await apiClient.post('/admin/import/plans', { records }); return res.data }
  catch (error) { throw normalizeApiError(error) }
}
export async function importProvidersBulk(records) {
  try { const res = await apiClient.post('/admin/import/providers', { records }); return res.data }
  catch (error) { throw normalizeApiError(error) }
}
export async function importFeaturesBulk(records) {
  try { const res = await apiClient.post('/admin/import/features', { records }); return res.data }
  catch (error) { throw normalizeApiError(error) }
}
