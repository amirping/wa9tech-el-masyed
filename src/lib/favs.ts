import { createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'

const KEY = 'masyed-favs'

function read(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

export interface Favs {
  has: (id: string) => boolean
  toggle: (id: string) => void
  size: number
}

/** Favourite spots, kept on this phone only. */
export function useFavsState(): Favs {
  const [ids, setIds] = useState<Set<string>>(read)
  return {
    has: (id) => ids.has(id),
    size: ids.size,
    toggle: (id) => {
      const next = new Set(ids)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setIds(next)
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]))
      } catch {
        // Not critical: favourites just won't survive a reload.
      }
    },
  }
}

export const FavsContext = createContext<Favs>({ has: () => false, toggle: () => {}, size: 0 })
export const useFavs = () => useContext(FavsContext)
