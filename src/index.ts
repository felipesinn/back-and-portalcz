import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configuração do CORS
app.use(cors()); 

// Configuração do logger (morgan)
app.use(morgan('dev'));

// Configuração do JSON parser para requisições
app.use(express.json());

// Rotas da API
app.use('/api', routes);

// Middleware de rota não encontrada
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));