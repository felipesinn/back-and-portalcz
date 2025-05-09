FROM node:22-slim

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci

# Copiar código fonte e arquivos de configuração
COPY . .

# Gerar cliente do Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Expor porta da aplicação
EXPOSE 3000

# Comando para executar a aplicação
CMD [ "npm", "start" ]