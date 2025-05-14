// src/services/contentService.ts
import prisma from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';

// Tipos de conteúdo suportados
export enum ContentType {
  PHOTO = 'photo',
  VIDEO = 'video',
  TEXT = 'text',
  TITLE = 'title',
  TUTORIAL = 'tutorial',    // Novo tipo para tutoriais
  PROCEDURE = 'procedure',  // Novo tipo para procedimentos
  TROUBLESHOOTING = 'troubleshooting', // Novo tipo para solução de problemas
  EQUIPMENT = 'equipment'   // Novo tipo para documentação de equipamentos
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
  steps?: ContentStep[];     // Nova propriedade para passos estruturados
  priority?: number;         // Para ordenar tutoriais por importância
  complexity?: number;       // Número de passos em procedimentos
  createdBy: number;         // ID do usuário que criou
}

// Interface para passos estruturados
export interface ContentStep {
  title: string;
  content: string;
  order: number;
  subSteps?: ContentStep[];  // Para estrutura hierárquica
}

// Interface para atualização de conteúdo
export interface UpdateContentInput {
  title?: string;
  description?: string;
  sector?: string;
  fileData?: Buffer;
  fileName?: string;
  textContent?: string;
  steps?: ContentStep[];     // Nova propriedade para passos estruturados
  priority?: number;         // Para ordenar tutoriais por importância
  complexity?: number;       // Número de passos em procedimentos
  updatedBy: number;         // ID do usuário que atualizou
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

  // Converter passos estruturados para formato JSON, se fornecidos
  const stepsData = data.steps ? JSON.stringify(data.steps) : null;

  // Criar o registro no banco de dados
  const content = await prisma.content.create({
    data: {
      title: data.title,
      description: data.description || '',
      type: data.type,
      sector: data.sector,
      filePath,
      textContent: data.textContent,
      steps: stepsData !== null ? stepsData : Prisma.JsonNull, // Novo campo
      priority: data.priority || 0,    // Novo campo
      complexity: data.complexity || 0, // Novo campo
      views: 0,                        // Inicializar visualizações
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Se o conteúdo tiver passos e estiver armazenado como string JSON, convertê-lo de volta
  if ('steps' in content && content.steps && typeof content.steps === 'string') {
    try {
      content.steps = JSON.parse(content.steps);
    } catch (e) {
      console.error('Erro ao parsear passos:', e);
    }
  }

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

  // Processar steps JSON para todos os itens
  return contents.map(content => {
    if (content.steps && typeof content.steps === 'string') {
      try {
        return { ...content, steps: JSON.parse(content.steps) };
      } catch (e) {
        console.error('Erro ao parsear passos:', e);
      }
    }
    return content;
  });
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

  // Processar steps JSON
  if (content.steps && typeof content.steps === 'string') {
    try {
      content.steps = JSON.parse(content.steps);
    } catch (e) {
      console.error('Erro ao parsear passos:', e);
    }
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

  // Converter passos estruturados para formato JSON, se fornecidos
  const stepsData = data.steps ? JSON.stringify(data.steps) : undefined;

  // Atualizar o registro no banco de dados
  const updatedContent = await prisma.content.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      sector: data.sector,
      filePath,
      textContent: data.textContent,
      steps: stepsData,                   // Novo campo
      priority: data.priority,            // Novo campo
      complexity: data.complexity,        // Novo campo
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

  // Se o conteúdo tiver passos e estiver armazenado como string JSON, convertê-lo de volta
  if (updatedContent.steps && typeof updatedContent.steps === 'string') {
    try {
      updatedContent.steps = JSON.parse(updatedContent.steps);
    } catch (e) {
      console.error('Erro ao parsear passos:', e);
    }
  }

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

  // Processar steps JSON para todos os itens
  return contents.map(content => {
    if (content.steps && typeof content.steps === 'string') {
      try {
        return { ...content, steps: JSON.parse(content.steps) };
      } catch (e) {
        console.error('Erro ao parsear passos:', e);
      }
    }
    return content;
  });
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

  // Processar steps JSON para todos os itens
  return contents.map(content => {
    if (content.steps && typeof content.steps === 'string') {
      try {
        return { ...content, steps: JSON.parse(content.steps) };
      } catch (e) {
        console.error('Erro ao parsear passos:', e);
      }
    }
    return content;
  });
};

/**
 * Incrementa o contador de visualizações de um conteúdo
 */
export const incrementViews = async (id: number) => {
  // Verificar se o conteúdo existe
  const existingContent = await prisma.content.findUnique({ where: { id } });
  if (!existingContent) {
    const error = new Error('Conteúdo não encontrado') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  // Incrementar visualizações
  const currentViews = existingContent.views || 0;
  
  const updatedContent = await prisma.content.update({
    where: { id },
    data: {
      views: currentViews + 1,
      updatedAt: new Date()
    }
  });

  return updatedContent;
};