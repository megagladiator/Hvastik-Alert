"use client"

import { useState, useEffect } from "react"

export default function DebugEnvPage() {
  const [envInfo, setEnvInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      // Client-side environment variables
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      
      // Browser info
      userAgent: navigator.userAgent,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port,
      origin: window.location.origin,
      
      // Timestamp
      timestamp: new Date().toISOString()
    }
    
    setEnvInfo(info)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Environment Information</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-2">NODE_ENV</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {envInfo.nodeEnv || 'Not set'}
            </code>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-2">SUPABASE_URL</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">
              {envInfo.supabaseUrl || 'Not set'}
            </code>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-2">SUPABASE_ANON_KEY</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {envInfo.supabaseAnonKey || 'Not set'}
            </code>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-2">Hostname</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {envInfo.hostname}
            </code>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-2">Protocol</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {envInfo.protocol}
            </code>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-2">Port</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {envInfo.port || 'Default'}
            </code>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-2">Origin</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {envInfo.origin}
            </code>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Expected vs Actual</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">Expected NODE_ENV:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">production</code>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${envInfo.nodeEnv === 'production' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">Actual NODE_ENV:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{envInfo.nodeEnv || 'Not set'}</code>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">Expected Base URL:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://hvostikalert.ru</code>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${envInfo.nodeEnv === 'production' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">Actual Base URL:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {envInfo.nodeEnv === 'production' ? 'https://hvostikalert.ru' : 'http://localhost:3000'}
            </code>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">🚨 Diagnosis</h2>
        
        {envInfo.nodeEnv !== 'production' ? (
          <div className="text-yellow-800">
            <p className="font-medium mb-2">❌ Problem Found:</p>
            <p>NODE_ENV is not set to 'production' on the server.</p>
            <p className="mt-2">This means the code is using localhost URLs instead of production URLs.</p>
            <p className="mt-2 font-medium">Solution: Set NODE_ENV=production on the server.</p>
          </div>
        ) : (
          <div className="text-green-800">
            <p className="font-medium mb-2">✅ Environment looks correct:</p>
            <p>NODE_ENV is set to 'production', so the issue might be elsewhere.</p>
          </div>
        )}
      </div>
    </div>
  )
}
