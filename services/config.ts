import env from 'env-var';

// Helper robusto para pegar variáveis de ambiente
// Tenta: 1. import.meta.env (Padrão Vite)
// Tenta: 2. window.process.env (Nosso Polyfill / Node servers)
const getEnvValue = (key: string): string => {
  // 1. Tentar import.meta.env (Vite Standard)
  try {
    // @ts-ignore - import.meta pode não existir em todos os contextos de TS
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore access errors
  }

  // 2. Tentar window.process.env (Polyfill do server.js)
  try {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.process && window.process.env && window.process.env[key]) {
       // @ts-ignore
       return window.process.env[key];
    }
  } catch (e) {
    // Ignore
  }

  return '';
};

export const config = {
  // Busca VITE_API_KEY usando a lógica híbrida
  API_KEY: getEnvValue('VITE_API_KEY'),
};

export const hasApiKey = (): boolean => {
  return config.API_KEY.length > 0;
};