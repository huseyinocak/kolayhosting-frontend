import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// __dirname yerine ESM uyumlu yolu tanımlıyoruz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // Tailwind CSS burada doğrudan plugin olarak eklenmez, PostCSS ile çalışır
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // __dirname artık tanımlı
    },
  },
})
