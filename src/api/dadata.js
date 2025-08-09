import axios from 'axios'

const DADATA_TOKEN = import.meta.env.VITE_DADATA_KEY

export async function suggestAddress(query) {
  if (!query) return []
  const res = await axios.post(
    'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
    { query, count: 5 },
    { headers: { 'Authorization': `Token ${DADATA_TOKEN}`, 'Content-Type': 'application/json' } }
  )
  return res.data.suggestions || []
}
