import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import path from 'path';
import fs from 'fs';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o Express
const app = express();

// Definir porta
const PORT = process.env.PORT || 3000;

// Definir caminho para uploads - PADRONIZADO
const uploadsPath = path.join(__dirname, '../uploads');

// Garantir que o diretório existe
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Diretório de uploads criado:', uploadsPath);
}

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ extended: true, limit: '80mb' }));

// Configurar Express para servir arquivos estáticos - CORRIGIDO
app.use('/api/uploads', express.static(uploadsPath));
console.log('Servindo uploads de:', uploadsPath);

// Rotas
app.use('/api', routes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware global de tratamento de erros
app.use(errorHandler);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});