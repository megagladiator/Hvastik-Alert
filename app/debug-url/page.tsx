"use client"

import { useEffect, useState } from 'react'

export default function DebugUrlPage() {
  const [urlInfo, setUrlInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      searchParams: Object.fromEntries(new URLSearchParams(window.location.search)),
      hashParams: Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)))
    }
    
    console.log('🔍 URL Debug Info:', info)
    setUrlInfo(info)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">URL Debug Information</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Full URL:</h2>
          <code className="break-all">{urlInfo.href}</code>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Pathname:</h2>
          <code>{urlInfo.pathname}</code>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Search (Query Parameters):</h2>
          <code>{urlInfo.search}</code>
          <pre className="mt-2 text-sm">{JSON.stringify(urlInfo.searchParams, null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Hash (Fragment):</h2>
          <code>{urlInfo.hash}</code>
          <pre className="mt-2 text-sm">{JSON.stringify(urlInfo.hashParams, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
