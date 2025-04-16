# GhostPad

Um aplicativo desktop Electron que permite criar e editar textos de forma oculta, não sendo detectável por gravadores de tela, compartilhamento de tela e capturas de tela.

## Instruções de Uso

### Primeiros Passos
1. Ao abrir o aplicativo, você verá a tela inicial com a lista de projetos recentes (se houver)
2. Use o botão "Novo Projeto" para criar um novo documento ou "Abrir Projeto" para carregar um existente
3. O aplicativo salva automaticamente suas alterações

### Edição de Texto
- Use a barra de ferramentas para formatar seu texto:
  - Títulos (H1, H2, H3)
  - Negrito (Ctrl+B)
  - Itálico (Ctrl+I)
  - Sublinhado (Ctrl+U)
  - Tachado
  - Alinhamentos (esquerda, centro, direita)
  - Listas ordenadas e não ordenadas

### Modos de Visualização
- **Modo Normal**: Exibe todas as funcionalidades e controles
- **Modo Compacto**: Pressione o botão "Modo Compacto" ou use ESC para alternar
  - Remove todas as interfaces exceto o editor
  - Ideal para foco total no conteúdo
  - Pressione ESC novamente para sair

### Personalização
- **Tema**: Clique no botão "Tema" para escolher entre:
  - Sistema (segue o tema do sistema operacional)
  - Claro
  - Escuro
- **Transparência**: Use o controle deslizante para ajustar a transparência da janela
- **Sempre no Topo**: Mantenha o aplicativo sempre visível sobre outras janelas

### Atalhos do Teclado
- `ESC` - Sair do modo compacto
- `Ctrl/Cmd + S` - Salvar projeto
- `Ctrl/Cmd + N` - Novo projeto
- `Ctrl/Cmd + O` - Abrir projeto
- `Ctrl/Cmd + W` - Fechar projeto
- `Ctrl/Cmd + B` - Negrito
- `Ctrl/Cmd + I` - Itálico
- `Ctrl/Cmd + U` - Sublinhado
- `Ctrl/Cmd + Shift + Space` - Restaurar foco da aplicação

### Segurança
- O aplicativo é invisível para:
  - Gravadores de tela (OBS, etc)
  - Capturas de tela (PrintScreen)
  - Compartilhamento de tela
  - Modo fullscreen
- Os projetos são salvos localmente em formato JSON
- Salvamento automático previne perda de dados

## Recursos Principais

- **Invisibilidade Total**
  - Invisível para gravadores de tela (OBS, etc)
  - Bloqueio de capturas de tela (PrintScreen)
  - Não aparece em compartilhamentos de tela
  - Invisível em modo fullscreen
  - Proteção contra detecção por outros aplicativos

- **Editor de Texto Rico**
  - Formatação completa de texto
  - Diferentes níveis de títulos (H1, H2, H3)
  - Negrito, itálico, sublinhado e tachado
  - Alinhamento de texto (esquerda, centro, direita)
  - Listas ordenadas e não ordenadas
  - Barra de ferramentas intuitiva

- **Gestão de Projetos**
  - Criar novos projetos com nome e observações
  - Abrir projetos existentes
  - Salvar alterações automaticamente
  - Lista de projetos recentes com acesso rápido
  - Excluir projetos da lista de recentes
  - Detalhes do projeto (data de criação, última modificação)

- **Interface Adaptável**
  - Modo compacto com atalho ESC
  - Temas: Sistema, Claro e Escuro
  - Controle de transparência da janela
  - Opção "Sempre no Topo"
  - Redimensionamento da janela
  - Controles de janela personalizados (minimizar, maximizar, fechar)

- **Armazenamento e Segurança**
- Armazenamento local em formato JSON
  - Salvamento automático de alterações
  - Confirmação antes de fechar projeto não salvo
  - Proteção contra perda de dados

## Instalação

Para instalar e executar o aplicativo localmente:

1. Certifique-se de ter o Node.js instalado (versão 14 ou superior recomendada)
2. Clone ou baixe este repositório
3. Abra um terminal na pasta do projeto
4. Execute os seguintes comandos:

```bash
# Instala as dependências
npm install

# Inicia o aplicativo
npm start
```

## Desenvolvimento

Para executar o aplicativo em modo de desenvolvimento:

```bash
npm run dev
```

## Construção

Para compilar o aplicativo para distribuição:

```bash
npm run build
```

Os arquivos executáveis serão gerados na pasta `dist`.

## Estrutura do Projeto

```
ghostpad/
├── node_modules/         # Dependências instaladas
├── src/                  # Código-fonte da aplicação
│   ├── css/             # Arquivos de estilo
│   │   ├── styles.css   # Estilos base
│   │   ├── tema-claro.css # Tema claro
│   │   └── tema-escuro.css # Tema escuro
│   ├── js/              # Arquivos JavaScript
│   │   ├── main.js      # Processo principal (Electron)
│   │   ├── preload.js   # Script de pré-carregamento
│   │   └── renderer.js  # Processo de renderização
│   └── images/          # Imagens e ícones
├── index.html           # Página principal
├── package.json         # Dependências e configuração
└── README.md           # Documentação
```

## Tecnologias Utilizadas

- Electron - Framework para aplicações desktop
- Node.js - Ambiente de execução JavaScript
- HTML/CSS/JavaScript - Interface do usuário
- Electron Store - Armazenamento de configurações
- Font Awesome - Ícones da interface

## Considerações de Segurança

O GhostPad implementa várias camadas de proteção para garantir a invisibilidade do conteúdo:

- Proteção contra capturas de tela usando `setContentProtection`
- Bloqueio de compartilhamento de tela
- Prevenção de PrintScreen
- Invisibilidade em gravadores de tela
- Ocultação da janela em workspaces

## Próximas Atualizações

- Criptografia dos dados armazenados
- Temas personalizados
- Sincronização em nuvem
- Mais opções de formatação de texto
- Suporte a imagens e anexos
- Modo de apresentação
- Backup automático 