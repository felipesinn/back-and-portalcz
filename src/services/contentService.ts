// src/services/contentService.ts
import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Tipos de conteúdo suportados
export enum ContentType {
  PHOTO = 'photo',
  VIDEO = 'video',
  TEXT = 'text',
  TITLE = 'title'
}

// Interface para dados de criação de conteúdo
export interface CreateContentInput {
  title: string;
  description?: string;
  type: ContentType;
  sector: string;
  fileData?: Buffer;
  fileName?: string;
  textContent?: string;
  createdBy: number; // ID do usuário que criou
}

// Interface para atualização de conteúdo
export interface UpdateContentInput {
  title?: string;
  description?: string;
  sector?: string;
  fileData?: Buffer;
  fileName?: string;
  textContent?: string;
  updatedBy: number; // ID do usuário que atualizou
}

// Diretório para armazenar arquivos
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Garantir que o diretório de upload exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Criar novo conteúdo
 */
export const createContent = async (data: CreateContentInput) => {
  let filePath = null;

  // Se houver um arquivo, salvá-lo no sistema de arquivos
  if (data.fileData && data.fileName) {
    const fileExtension = path.extname(data.fileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    filePath = path.join(UPLOAD_DIR, uniqueFileName);
    
    // Garantir que o diretório exista
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    // Salvar o arquivo
    fs.writeFileSync(filePath, data.fileData);
    filePath = uniqueFileName; // Salvar apenas o nome do arquivo no banco
  }

  // Criar o registro no banco de dados
  const content = await prisma.content.create({
    data: {
      title: data.title,
      description: data.description || '',
      type: data.type,
      sector: data.sector,
      filePath,
      textContent: data.textContent,
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  return content;
};

/**
 * Buscar todo o conteúdo
 */
export const getAllContent = async (sector?: string) => {
  // Filtrar por setor se especificado
  const filter = sector ? { where: { sector } } : undefined;
  
  const contents = await prisma.content.findMany({
    where: filter?.where,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      updater: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return contents;
};

/**
 * Buscar conteúdo por ID
 */
export const getContentById = async (id: number) => {
  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      updater: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  if (!content) {
    const error = new Error('Conteúdo não encontrado') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  return content;
};

/**
 * Atualizar conteúdo
 */
export const updateContent = async (id: number, data: UpdateContentInput) => {
  // Verificar se o conteúdo existe
  const existingContent = await prisma.content.findUnique({ where: { id } });
  if (!existingContent) {
    const error = new Error('Conteúdo não encontrado') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  let filePath = existingContent.filePath;

  // Se houver um novo arquivo, atualizar
  if (data.fileData && data.fileName) {
    // Remover o arquivo antigo, se existir
    if (existingContent.filePath) {
      const oldFilePath = path.join(UPLOAD_DIR, existingContent.filePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Salvar o novo arquivo
    const fileExtension = path.extname(data.fileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const newFilePath = path.join(UPLOAD_DIR, uniqueFileName);
    
    fs.writeFileSync(newFilePath, data.fileData);
    filePath = uniqueFileName;
  }

  // Atualizar o registro no banco de dados
  const updatedContent = await prisma.content.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      sector: data.sector,
      filePath,
      textContent: data.textContent,
      updatedBy: data.updatedBy,
      updatedAt: new Date()
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      updater: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return updatedContent;
};

/**
 * Excluir conteúdo
 */
export const deleteContent = async (id: number) => {
  // Verificar se o conteúdo existe
  const existingContent = await prisma.content.findUnique({ where: { id } });
  if (!existingContent) {
    const error = new Error('Conteúdo não encontrado') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  // Remover o arquivo, se existir
  if (existingContent.filePath) {
    const filePath = path.join(UPLOAD_DIR, existingContent.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Excluir o registro do banco de dados
  await prisma.content.delete({ where: { id } });
  
  return { message: 'Conteúdo excluído com sucesso' };
};

/**
 * Buscar conteúdo por tipo
 */
export const getContentByType = async (type: ContentType, sector?: string) => {
  const whereClause = sector 
    ? { type, sector } 
    : { type };
  
  const contents = await prisma.content.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return contents;
};

/**
 * Buscar conteúdo por setor
 */
export const getContentBySector = async (sector: string) => {
  const contents = await prisma.content.findMany({
    where: { sector },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return contents;
};