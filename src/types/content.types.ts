// src/types/content.types.ts

// Tipos de conteúdo
export enum ContentType {
  PHOTO = 'photo',
  VIDEO = 'video',
  TEXT = 'text',
  TITLE = 'title'
}

// Setores da empresa
export type SectorType = 'suporte' | 'tecnico' | 'noc' | 'comercial' | 'adm';
export type UserRole = 'super_admin' | 'admin' | 'user';
export type UserSector = 'suporte' | 'tecnico' | 'noc' | 'comercial' | 'adm';

// Interface para criador/editor
export interface ContentCreator {
  id: string;
  name: string;
  email: string;
}

// Interface para item de conteúdo
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  sector: SectorType;
  filePath?: string;
  textContent?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  creator: ContentCreator;
  updater?: ContentCreator;
}

// Interface para criar novo conteúdo
export interface CreateContentData {
  title: string;
  description?: string;
  type: ContentType;
  sector: SectorType;
  file?: File;
  textContent?: string;
}

// Interface para atualizar conteúdo existente
export interface UpdateContentData {
  title?: string;
  description?: string;
  sector?: SectorType;
  file?: File;
  textContent?: string;
}