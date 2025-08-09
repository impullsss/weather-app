
import React, { useState } from 'react'
import { suggestAddress } from '../api/dadata'
import useDebounce from '../hooks/useDebounce'

export default function SearchBar({ onSelect }) {
  const [q, setQ] = useState('')
  const [suggests, setSuggests] = useState([])
  const debQ = useDebounce(q, 300)

  React.useEffect(() => {
    let mounted = true
    if (!debQ) { setSuggests([]); return }
    suggestAddress(debQ).then(s => {
      if (mounted) setSuggests(s.map(item => ({ value: item.value, data: item.data })))
    }).catch(()=> setSuggests([]))
    return ()=> mounted = false
  }, [debQ])

  return (
    <div className="searchbar">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Введите город" />
      <button onClick={() => onSelect(q)}>Получить погоду</button>

      <ul className="suggests">
        {suggests.map((s, i) => (
          <li key={i} onClick={() => { setQ(s.value); onSelect(s.value) }}>{s.value}</li>
        ))}
      </ul>
    </div>
  )
}
