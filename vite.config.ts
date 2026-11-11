import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // aceita também as variáveis NEXT_PUBLIC_* criadas pela integração Supabase do Vercel
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  // no instalador (vite build --mode electron) os arquivos são lidos do disco,
  // então os caminhos precisam ser relativos
  base: mode === 'electron' ? './' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
