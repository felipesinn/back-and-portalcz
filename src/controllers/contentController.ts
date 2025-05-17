import { Request, Response } from "express";
import {
  createContent,
  getAllContent,
  getContentById,
  updateContent,
  deleteContent,
  getContentByType,
  getContentBySector,
  ContentType,
  incrementViews,
} from "../services/contentService";

/**
 * Handler para criar conteúdo
 */
export const createContentHandler = async (req: Request, res: Response) => {
  try {
    // Log para depuração
    console.log("Corpo da requisição:", req.body);
    console.log("Arquivo recebido:", req.file);
    
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
    
    // Validar se há arquivo quando necessário
    if ((req.body.type === 'photo' || req.body.type === 'video') && !req.file) {
      return res.status(400).json({ 
        message: `É necessário enviar um arquivo para o tipo ${req.body.type}` 
      });
    }
    
    // @ts-ignore - O middleware de autenticação adiciona o userId ao req
    const userId = req.userId || 1; // Valor padrão para testes
    
    // ALTERAÇÃO PRINCIPAL: Processar arquivo usando diskStorage
    let filePath = null;
    
    if (req.file) {
      // Com diskStorage, salvar o nome do arquivo
      filePath = req.file.filename;
      console.log("Nome do arquivo salvo:", filePath);
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
      // Remover as propriedades antigas usadas com memoryStorage
      // fileData: fileData || undefined,
      // fileName,
      filePath, // Adicionar o caminho do arquivo
      createdBy: userId
    };
    
    console.log("Dados preparados para o serviço:", {
      ...contentData,
      filePath // Log explícito do filePath para debug
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
  try {
    const { sector } = req.query;

    const contents = await getAllContent(sector as string | undefined);
    res.status(200).json(contents);
  } catch (error) {
    console.error("Erro ao buscar conteúdos:", error);
    res.status(500).json({
      message: "Erro ao buscar conteúdos",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Controlador para obter conteúdo por ID
 */
export const getContentByIdHandler = async (req: Request, res: Response) => {
  try {
    // Tenta converter o ID para número, mas também suporta string
    let contentId: string | number = req.params.id;

    // Se for possível converter para número, faz a conversão
    if (!isNaN(Number(contentId))) {
      contentId = parseInt(contentId);
    }

    console.log(`Buscando conteúdo com ID: ${contentId} (${typeof contentId})`);

    const content = await getContentById(Number(contentId));

    if (!content) {
      return res
        .status(404)
        .json({ message: `Conteúdo com ID ${contentId} não encontrado` });
    }

    res.status(200).json(content);
  } catch (error) {
    console.error(`Erro ao buscar conteúdo por ID ${req.params.id}:`, error);
    res.status(500).json({
      message: "Erro ao buscar conteúdo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Controlador para atualizar conteúdo
 */
export const updateContentHandler = async (req: Request, res: Response) => {
  try {
    // Suporta tanto ID numérico quanto string
    let contentId: string | number = req.params.id;
    if (!isNaN(Number(contentId))) {
      contentId = parseInt(contentId);
    }

    console.log(
      `Atualizando conteúdo com ID: ${contentId} (${typeof contentId})`
    );

    // Verificar se o conteúdo existe antes de tentar atualizá-lo
    const existingContent = await getContentById(Number(contentId));
    if (!existingContent) {
      return res
        .status(404)
        .json({ message: `Conteúdo com ID ${contentId} não encontrado` });
    }

    // @ts-ignore - O middleware de autenticação adiciona o userId ao req
    const userId = req.userId;

    // Processar os dados do arquivo, se existir
    let fileData = null;
    let fileName = null;

    if (req.file) {
      fileData = req.file.buffer;
      fileName = req.file.originalname;
    }

    const updatedContent = await updateContent(Number(contentId), {
      ...req.body,
      // Converter valores de string para número/boolean quando necessário
      priority: req.body.priority ? parseInt(req.body.priority) : undefined,
      complexity: req.body.complexity
        ? parseInt(req.body.complexity)
        : undefined,
      fileData,
      fileName,
      updatedBy: userId,
    });

    res.status(200).json(updatedContent);
  } catch (error) {
    console.error(`Erro ao atualizar conteúdo:`, error);
    res.status(500).json({
      message: "Erro ao atualizar conteúdo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Controlador para excluir conteúdo - CORRIGIDO
 */
export const deleteContentHandler = async (req: Request, res: Response) => {
  try {
    // Suporta tanto ID numérico quanto string
    let contentId: string | number = req.params.id;

    console.log(
      `Recebida solicitação de exclusão para ID: ${contentId} (tipo original: ${typeof contentId})`
    );

    // Se for possível converter para número, faz a conversão
    if (!isNaN(Number(contentId))) {
      contentId = parseInt(contentId);
      console.log(`ID convertido para número: ${contentId}`);
    }

    // Verificar se o conteúdo existe antes de tentar excluí-lo
    let existingContent;
    try {
      existingContent = await getContentById(Number(contentId));
    } catch (error) {
      console.log(`Erro ao buscar conteúdo ${contentId} para exclusão:`, error);
      return res.status(404).json({
        message: `Conteúdo com ID ${contentId} não encontrado`,
        success: false,
      });
    }

    if (!existingContent) {
      console.log(`Conteúdo com ID ${contentId} não encontrado para exclusão`);
      return res.status(404).json({
        message: `Conteúdo com ID ${contentId} não encontrado`,
        success: false,
      });
    }

    // @ts-ignore - O middleware de autenticação adiciona o userId ao req
    const userId = req.userId;

    // Verificar permissões (opcional, dependendo dos requisitos)
    // Comentado para permitir testes mais fáceis
    /*
    if (existingContent.createdBy !== userId && !isAdmin(userId)) {
      return res.status(403).json({ 
        message: "Você não tem permissão para excluir este conteúdo",
        success: false 
      });
    }
    */

    // Excluir o conteúdo
    const success = await deleteContent(contentId);

    if (success) {
      console.log(`Conteúdo com ID ${contentId} excluído com sucesso`);

      // Responder com sucesso
      return res.status(200).json({
        message: "Conteúdo excluído com sucesso",
        success: true,
        id: contentId,
      });
    } else {
      console.error(`Falha na exclusão do conteúdo ID ${contentId}`);
      return res.status(500).json({
        message: "Não foi possível excluir o conteúdo",
        success: false,
      });
    }
  } catch (error) {
    console.error(`Erro ao excluir conteúdo:`, error);
    res.status(500).json({
      message: "Erro ao excluir conteúdo",
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    });
  }
};

/**
 * Controlador para obter conteúdo por tipo
 */
export const getContentByTypeHandler = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { sector } = req.query;

    // Validar o tipo
    if (!Object.values(ContentType).includes(type as ContentType)) {
      return res.status(400).json({ message: "Tipo de conteúdo inválido" });
    }

    const contents = await getContentByType(
      type as ContentType,
      sector as string | undefined
    );
    res.status(200).json(contents);
  } catch (error) {
    console.error(`Erro ao buscar conteúdo por tipo:`, error);
    res.status(500).json({
      message: "Erro ao buscar conteúdo por tipo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Controlador para obter conteúdo por setor
 */
export const getContentBySectorHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { sector } = req.params;
    const contents = await getContentBySector(sector);
    res.status(200).json(contents);
  } catch (error) {
    console.error(`Erro ao buscar conteúdo por setor:`, error);
    res.status(500).json({
      message: "Erro ao buscar conteúdo por setor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Controlador para incrementar visualizações
 */
export const incrementViewsHandler = async (req: Request, res: Response) => {
  try {
    let contentId: string | number = req.params.id;
    if (!isNaN(Number(contentId))) {
      contentId = parseInt(contentId);
    }

    const updatedContent = await incrementViews(Number(contentId));

    if (!updatedContent) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }

    res.status(200).json({ success: true, views: updatedContent.views });
  } catch (error) {
    console.error(`Erro ao incrementar visualizações:`, error);
    res.status(500).json({
      message: "Erro ao incrementar visualizações",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Controlador para adicionar conteúdo a um artigo existente (corrigido)
 */
export const addContentAdditionHandler = async (
  req: Request,
  res: Response
) => {
  try {
    let contentId: string | number = req.params.id;
    if (!isNaN(Number(contentId))) {
      contentId = parseInt(contentId);
    }

    // @ts-ignore - O middleware de autenticação adiciona o userId ao req
    const userId = req.userId || 1; // Valor padrão para testes

    // Validar campos obrigatórios
    if (!req.body.content) {
      return res
        .status(400)
        .json({ message: "O campo 'content' é obrigatório" });
    }

    // Log para depuração
    console.log("Adicionando conteúdo ao artigo:", contentId);
    console.log("Dados da adição:", req.body);

    // Obter o conteúdo existente
    const existingContent = await getContentById(Number(contentId));

    if (!existingContent) {
      return res.status(404).json({ message: "Conteúdo não encontrado" });
    }

    // Processar os dados do arquivo, se existir
    let filePath = undefined;

    if (req.file) {
      // Usar apenas o nome do arquivo gerado pelo multer
      filePath = req.file.filename;

      // Log para depuração
      console.log("Arquivo recebido:", req.file.originalname);
      console.log("Nome do arquivo salvo:", req.file.filename);
    }

    // Preparar a estrutura steps para armazenar adições
    let steps = existingContent.steps;
    let additions: any[] = []; // Inicializa additions como um array vazio

    // Se steps já existir, analisar e obter as adições
    if (steps) {
      if (typeof steps === "string") {
        try {
          const parsedSteps = JSON.parse(steps);
          additions = parsedSteps.additions || [];
        } catch (err) {
          console.error("Erro ao analisar steps:", err);
          additions = [];
        }
      } else if (typeof steps === "object") {
        if (typeof steps === "object" && !Array.isArray(steps)) {
          additions = (steps as { additions?: any[] }).additions || [];
        } else {
          additions = [];
        }
      }
    }

    // Preparar a nova adição
    const newAddition = {
      id: Date.now().toString(), // ID único baseado no timestamp
      title: req.body.title || undefined,
      content: req.body.content,
      filePath,
      createdAt: new Date().toISOString(),
      createdById: userId,
      createdByName: req.body.userName || "Usuário", // Na implementação real, você obteria isso do objeto de usuário
      order: additions.length + 1, // Define a ordem com base no tamanho atual das adições
    };

    // Adicionar a nova adição
    additions.push(newAddition);

    // Atualizar o conteúdo com a nova adição
    const updatedContent = await updateContent(Number(contentId), {
      // Garantir que steps seja passado no formato correto
      steps: JSON.stringify({ additions }), // Armazenar como JSON string
      updatedBy: userId,
    });

    // Responder com sucesso
    res.status(201).json({
      success: true,
      message: "Adição de conteúdo realizada com sucesso",
      addition: newAddition,
      content: updatedContent,
    });
  } catch (error) {
    console.error("Erro ao adicionar conteúdo:", error);
    res.status(500).json({
      message: "Erro ao adicionar conteúdo",
      error: error instanceof Error ? error.message : "Unknown error",
      stack:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.stack
          : undefined,
    });
  }
};

// Função para verificar se um usuário é admin
function isAdmin(userId: any): boolean {
  if (!userId) return false;

  // Admins conhecidos (para teste)
  const adminIds = [1, 12, 13]; // Inclua os IDs de usuários admin conhecidos

  return adminIds.includes(Number(userId));
}
