/** Backend origin (FastAPI). Override with VITE_API_URL in .env.development / .env.production */
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000'
