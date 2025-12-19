/// &lt;reference types="vite/client" /&gt;

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
