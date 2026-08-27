/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BSCSCAN_API_KEY?: string;
  readonly VITE_ETHERSCAN_API_KEY?: string;
  readonly VITE_TRONGRID_API_KEY?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
