import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      // Make env variables available in the app
      'import.meta.env.VITE_GEOAPIFY_API_KEY': JSON.stringify(env.VITE_GEOAPIFY_API_KEY),
      'import.meta.env.VITE_OPENWEATHER_API_KEY': JSON.stringify(env.VITE_OPENWEATHER_API_KEY),
    }
  }
})
