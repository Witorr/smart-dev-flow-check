// Templates de checklist padrão para cada tecnologia
export const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  'React': [
    'Configurar ambiente React',
    'Criar estrutura de pastas',
    'Instalar dependências principais',
    'Configurar ESLint e Prettier',
    'Criar componente inicial',
    'Configurar rotas (React Router)'
  ],
  'Node.js': [
    'Configurar ambiente Node.js',
    'Criar estrutura de pastas',
    'Instalar dependências principais',
    'Configurar ESLint',
    'Criar servidor HTTP básico',
    'Configurar variáveis de ambiente'
  ],
  'TypeScript': [
    'Adicionar TypeScript ao projeto',
    'Configurar tsconfig.json',
    'Ajustar scripts para build',
    'Migrar arquivos .js para .ts'
  ],
  'Python': [
    'Configurar ambiente virtual',
    'Instalar dependências',
    'Criar estrutura de pastas',
    'Configurar linter (flake8, black)'
  ],
  'Django': [
    'Criar projeto Django',
    'Configurar settings iniciais',
    'Criar app principal',
    'Configurar banco de dados',
    'Criar superusuário'
  ],
  'Laravel': [
    'Criar projeto Laravel',
    'Configurar .env',
    'Gerar chave da aplicação',
    'Configurar autenticação',
    'Criar migrations iniciais'
  ],
  'Vue.js': [
    'Configurar ambiente Vue.js',
    'Criar estrutura de pastas',
    'Instalar dependências principais',
    'Configurar ESLint',
    'Criar componente inicial'
  ],
  'Flutter': [
    'Criar projeto Flutter',
    'Configurar pubspec.yaml',
    'Rodar app inicial',
    'Configurar estrutura de pastas'
  ],
  'Java': [
    'Configurar projeto Java',
    'Configurar build tool (Maven/Gradle)',
    'Criar estrutura de pacotes',
    'Criar classe principal'
  ],
  'C#': [
    'Criar projeto C#',
    'Configurar Solution/Project',
    'Adicionar dependências',
    'Criar classe principal'
  ],
  'Go': [
    'Configurar módulo Go',
    'Criar estrutura de pastas',
    'Criar função main',
    'Adicionar dependências'
  ]
};

// Checklist padrão para todos os projetos
export const BASE_CHECKLIST: string[] = [
  'Definir objetivo do projeto',
  'Criar repositório no Git',
  'Configurar README.md',
  'Configurar CI/CD (Github Actions, etc)',
  'Planejar milestones',
  'Configurar controle de versão',
  'Documentar requisitos principais'
];
