import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { config } from 'dotenv'; 


// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': config().parsed,
  },
  plugins: [
    tailwindcss(),
    react()
  ],
})
