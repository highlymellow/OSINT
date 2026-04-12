/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MERIDIAN_LIVE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
