require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

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
    const apiKey = process.env.API_KEY || '';
    
    // Procura pelo placeholder no index.html e substitui pelo valor real
    // Regex procura por: API_KEY: '' ou API_KEY: 'valor_antigo'
    const result = data.replace(
      /API_KEY:\s*['"](.*?)['"]/, 
      `API_KEY: '${apiKey}'`
    );

    res.setHeader('Content-Type', 'text/html');
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 CodeOmar rodando em http://localhost:${PORT}`);
  if (process.env.API_KEY) {
    console.log(`✅ API_KEY carregada com sucesso (Length: ${process.env.API_KEY.length})`);
  } else {
    console.warn(`⚠️  AVISO: API_KEY não encontrada no .env ou variáveis de ambiente.`);
  }
});