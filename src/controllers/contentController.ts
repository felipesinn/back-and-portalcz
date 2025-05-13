// src/controllers/contentController.ts
import { Request, Response } from 'express';
import { 
  createContent, 
  getAllContent, 
  getContentById, 
  updateContent, 
  deleteContent,
  getContentByType,
  getContentBySector,
  ContentType
} from '../services/contentService';

/**
 * Controlador para criar conteúdo
 */
export const createContentHandler = async (req: Request, res: Response) => {
  // @ts-ignore - O middleware de autenticação adiciona o userId ao req
  const userId = req.userId;
  
  // Processar os dados do arquivo, se existir
  let fileData = null;
  let fileName = null;
  
  if (req.file) {
    fileData = req.file.buffer;
    fileName = req.file.originalname;
  }
  
  const content = await createContent({
    ...req.body,
    fileData,
    fileName,
    createdBy: userId
  });
  
  res.status(201).json(content);
};

/**
 * Controlador para obter todo o conteúdo
 */
export const getAllContentHandler = async (req: Request, res: Response) => {
  const { sector } = req.query;
  
  const contents = await getAllContent(sector as string | undefined);
  res.status(200).json(contents);
};

/**
 * Controlador para obter conteúdo por ID
 */
export const getContentByIdHandler = async (req: Request, res: Response) => {
  const contentId = parseInt(req.params.id);
  const content = await getContentById(contentId);
  res.status(200).json(content);
};

/**
 * Controlador para atualizar conteúdo
 */
export const updateContentHandler = async (req: Request, res: Response) => {
  const contentId = parseInt(req.params.id);
  // @ts-ignore - O middleware de autenticação adiciona o userId ao req
  const userId = req.userId;
  
  // Processar os dados do arquivo, se existir
  let fileData = null;
  let fileName = null;
  
  if (req.file) {
    fileData = req.file.buffer;
    fileName = req.file.originalname;
  }
  
  const updatedContent = await updateContent(contentId, {
    ...req.body,
    fileData,
    fileName,
    updatedBy: userId
  });
  
  res.status(200).json(updatedContent);
};

/**
 * Controlador para excluir conteúdo
 */
export const deleteContentHandler = async (req: Request, res: Response) => {
  const contentId = parseInt(req.params.id);
  const result = await deleteContent(contentId);
  res.status(200).json(result);
};

/**
 * Controlador para obter conteúdo por tipo
 */
export const getContentByTypeHandler = async (req: Request, res: Response) => {
  const { type } = req.params;
  const { sector } = req.query;
  
  // Validar o tipo
  if (!Object.values(ContentType).includes(type as ContentType)) {
    return res.status(400).json({ message: 'Tipo de conteúdo inválido' });
  }
  
  const contents = await getContentByType(type as ContentType, sector as string | undefined);
  res.status(200).json(contents);
};

/**
 * Controlador para obter conteúdo por setor
 */
export const getContentBySectorHandler = async (req: Request, res: Response) => {
  const { sector } = req.params;
  const contents = await getContentBySector(sector);
  res.status(200).json(contents);
};