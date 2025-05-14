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
  ContentType,
  incrementViews
} from '../services/contentService';

export const createContentHandler = async (req: Request, res: Response) => {
  try {
    // Log para depuração
    console.log("Corpo da requisição:", req.body);
    
    // Validar campos obrigatórios
    if (!req.body.title) {
      return res.status(400).json({ message: "O campo 'title' é obrigatório" });
    }
    
    if (!req.body.type) {
      return res.status(400).json({ message: "O campo 'type' é obrigatório" });
    }
    
    if (!req.body.sector) {
      return res.status(400).json({ message: "O campo 'sector' é obrigatório" });
    }
    
    // @ts-ignore - O middleware de autenticação adiciona o userId ao req
    const userId = req.userId || 1; // Valor padrão para testes
    
    // Processar os dados do arquivo, se existir
    let fileData = null;
    let fileName = undefined;
    
    if (req.file) {
      fileData = req.file.buffer;
      fileName = req.file.originalname;
    }
    
    // Prepare os dados com tipos corretos
    const contentData = {
      title: req.body.title,
      description: req.body.description || "",
      type: req.body.type,
      sector: req.body.sector,
      textContent: req.body.textContent,
      steps: req.body.steps ? 
        (typeof req.body.steps === 'string' ? JSON.parse(req.body.steps) : req.body.steps) : 
        undefined,
      priority: req.body.priority ? parseInt(req.body.priority) : 0,
      complexity: req.body.complexity ? parseInt(req.body.complexity) : 0,
      fileData: fileData || undefined,
      fileName,
      createdBy: userId
    };
    
    console.log("Dados preparados para o serviço:", {
      title: contentData.title,
      type: contentData.type,
      sector: contentData.sector,
      createdBy: contentData.createdBy
    });
    
    const content = await createContent(contentData);
    console.log("Conteúdo criado com sucesso:", content.id);
    
    res.status(201).json(content);
  } catch (error) {
    console.error("Erro ao criar conteúdo:", error);
    res.status(500).json({ 
      message: "Erro ao criar conteúdo", 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
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
    // Converter valores de string para número/boolean quando necessário
    priority: req.body.priority ? parseInt(req.body.priority) : undefined,
    complexity: req.body.complexity ? parseInt(req.body.complexity) : undefined,
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

/**
 * Controlador para incrementar visualizações
 */
export const incrementViewsHandler = async (req: Request, res: Response) => {
  const contentId = parseInt(req.params.id);
  const updatedContent = await incrementViews(contentId);
  res.status(200).json({ success: true, views: updatedContent.views });
};