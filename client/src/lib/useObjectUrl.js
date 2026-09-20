import { useEffect, useMemo } from 'react'

/** Preview URL for a File the user picked; released automatically when the file changes or the component unmounts. */
export function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return url
}
