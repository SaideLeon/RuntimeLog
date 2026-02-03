import env from 'env-var';

// Acessa o objeto global window.process que definimos no index.html
// Isso garante compatibilidade mesmo que 'process' não seja nativo do navegador
const getEnvSource = () => {
  // @ts-ignore - window.process é um polyfill customizado
  if (typeof window !== 'undefined' && window.process && window.process.env) {
    // @ts-ignore
    return window.process.env;
  }
  // Fallback seguro vazio
  return {};
};

const envSource = getEnvSource();

export const config = {
  // Usa env-var para ler de forma segura. 
  // .asString() retorna undefined se não existir, evitando erros de runtime
  API_KEY: env.from(envSource).get('API_KEY').asString() || '',
  
  // Exemplo de como adicionaríamos outras variáveis no futuro com validação:
  // PUBLIC_URL: env.from(envSource).get('PUBLIC_URL').default('http://localhost:3000').asString(),
};

export const hasApiKey = (): boolean => {
  return config.API_KEY.length > 0;
};
