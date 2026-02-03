const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Tenta carregar o .env e loga o resultado
const envConfig = dotenv.config();
if (envConfig.error) {
  console.log('ℹ️  Arquivo .env não encontrado, usando variáveis de ambiente do sistema.');
} else {
  console.log('📄 Arquivo .env carregado com sucesso.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança para não expor o arquivo .env publicamente
app.use((req, res, next) => {
  if (req.path.includes('.env')) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Servir arquivos estáticos da raiz, exceto index.html (que será manipulado manualmente)
app.use(express.static(__dirname, { index: false }));

// Rota catch-all para servir o index.html e injetar a variável de ambiente
app.get('*', (req, res) => {
  const filePath = path.resolve(__dirname, 'index.html');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao carregar index.html');
    }

    // Obtém a chave do arquivo .env ou das variáveis do sistema
    // Prioriza VITE_API_KEY (Padrão Vite), fallback para API_KEY antiga
    const apiKey = process.env.VITE_API_KEY || process.env.API_KEY || '';
    
    // Procura pelo placeholder no index.html e substitui pelo valor real
    // Regex ajustada para o novo nome da variável no index.html
    const result = data.replace(
      /VITE_API_KEY:\s*['"](.*?)['"]/, 
      `VITE_API_KEY: '${apiKey}'`
    );

    res.setHeader('Content-Type', 'text/html');
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 CodeOmar rodando em http://localhost:${PORT}`);
  if (process.env.VITE_API_KEY || process.env.API_KEY) {
    console.log(`✅ VITE_API_KEY detectada.`);
  } else {
    console.warn(`⚠️  AVISO CRÍTICO: VITE_API_KEY não encontrada.`);
    console.warn(`   Certifique-se de definir VITE_API_KEY no arquivo .env`);
  }
});