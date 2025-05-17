import { UserRole } from '../types/content.types';

// Lista de todas as permissões disponíveis no sistema
export const ALL_PERMISSIONS = [
  // Permissões de gerenciamento de usuários
  'create_user',
  'read_user',
  'update_user',
  'delete_user',
  
  // Permissões de gerenciamento de conteúdo
  'create_content',
  'read_content',
  'update_content',
  'delete_content',
  
  // Permissões específicas de setores
  'suporte',
  'tecnico',
  'noc',
  'comercial',
  'adm',
  
  // Permissão especial para super_admin
  'all'
];

// Mapeamento de funções para permissões
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  // Super Admin tem todas as permissões
  'super_admin': ['all', ...ALL_PERMISSIONS],
  
  // Admin tem permissões de gerenciamento de conteúdo
  'admin': [
    'create_content',
    'read_content',
    'update_content',
    'delete_content',
    'read_user'
  ],
  
  // Manager tem algumas permissões de gerenciamento
  'manager': [
    'create_content',
    'read_content',
    'update_content'
  ],
  
  // Usuário comum tem apenas permissões de leitura
  'user': [
    'read_content'
  ]
};

// Função para verificar se um usuário tem determinada permissão
export const hasPermission = (
  userRole: UserRole,
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  // Super Admin tem todas as permissões
  if (userRole === 'super_admin' || userPermissions.includes('all')) {
    return true;
  }
  
  // Verificar se a permissão está na lista do usuário
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Verificar se a permissão está no papel do usuário
  if (ROLE_PERMISSIONS[userRole]?.includes(requiredPermission)) {
    return true;
  }
  
  return false;
};

// Função para obter todas as permissões do usuário com base no seu papel e setor
export const getUserPermissions = (
  role: UserRole,
  sector: string | undefined
): string[] => {
  // Permissões básicas baseadas no papel
  const basePermissions = ROLE_PERMISSIONS[role] || [];
  
  // Adicionar permissão do setor do usuário
  const permissions = [...basePermissions];
  if (sector && !permissions.includes(sector) && !permissions.includes('all')) {
    permissions.push(sector);
  }
  
  return permissions;
};

// Função para obter as permissões que um administrador pode conceder
export const getGrantablePermissions = (adminRole: UserRole): string[] => {
  if (adminRole === 'super_admin') {
    // Super Admin pode conceder todas as permissões
    return ALL_PERMISSIONS;
  } else if (adminRole === 'admin') {
    // Admin pode conceder apenas permissões básicas e do seu setor
    return [
      'read_content',
      'create_content',
      'update_content'
    ];
  }
  
  // Usuários comuns não podem conceder permissões
  return [];
};