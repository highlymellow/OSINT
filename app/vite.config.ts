import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // ── OSINT Data Proxies (CORS bypass) ────────────────────
      // GDELT DOC 2.0 API — conflict event intelligence
      '/proxy/gdelt': {
        target: 'https://api.gdeltproject.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/gdelt/, ''),
        secure: true,
      },
      // USGS Earthquake feed
      '/proxy/usgs': {
        target: 'https://earthquake.usgs.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/usgs/, ''),
        secure: true,
      },
      // RestCountries API
      '/proxy/countries': {
        target: 'https://restcountries.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/countries/, ''),
        secure: true,
      },
      // Wikipedia REST API
      '/proxy/wiki': {
        target: 'https://en.wikipedia.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/wiki/, ''),
        secure: true,
      },
      // AllOrigins CORS proxy for RSS feeds
      // Direct RSS source proxies (no AllOrigins dependency)
      '/proxy/rss-aljazeera': {
        target: 'https://www.aljazeera.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/rss-aljazeera/, ''),
        secure: true,
      },
      '/proxy/rss-bbc': {
        target: 'https://feeds.bbci.co.uk',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/rss-bbc/, ''),
        secure: true,
      },
      '/proxy/rss-nyt': {
        target: 'https://rss.nytimes.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/rss-nyt/, ''),
        secure: true,
      },
      // NASA FIRMS fire data
      '/proxy/firms': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/firms/, ''),
        secure: true,
      },
      // ReliefWeb (UN OCHA) — RSS feed on main site (API v2 requires registration)
      '/proxy/reliefweb': {
        target: 'https://reliefweb.int',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/reliefweb/, ''),
        secure: true,
      },
      // GDACS (UN disaster alert system)
      '/proxy/gdacs': {
        target: 'https://www.gdacs.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/gdacs/, ''),
        secure: true,
      },
      // NOAA weather alerts
      '/proxy/weather': {
        target: 'https://api.weather.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/weather/, ''),
        secure: true,
      },
      // CelesTrak satellite TLE data
      '/proxy/celestrak': {
        target: 'https://celestrak.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/celestrak/, ''),
        secure: true,
      },
      // OpenSky Network — aircraft tracking
      '/proxy/opensky': {
        target: 'https://opensky-network.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/opensky/, ''),
        secure: true,
      },
      // adsb.lol — free unlimited aircraft data
      '/proxy/adsb': {
        target: 'https://api.adsb.lol',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/adsb/, ''),
        secure: true,
      },
      // FastAPI backend (when running)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
