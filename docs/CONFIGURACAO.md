# Configuração do GhostPad

Este documento contém todas as instruções para configurar o GhostPad, incluindo o sistema de atualização automática via GitHub.

## 📋 Sumário

- [1. Configuração Inicial](#1-configuração-inicial)
- [2. Sistema de Atualização](#2-sistema-de-atualização)
- [3. Configurações Avançadas](#3-configurações-avançadas)
- [4. Personalização](#4-personalização)
- [5. Solução de Problemas](#5-solução-de-problemas)

## 1. Configuração Inicial

### Arquivo de Configuração Principal

Todas as configurações do GhostPad ficam no arquivo `src/js/app-config.js`. Este é o local central onde você deve fazer todas as personalizações.

### Configuração Rápida

Para usar o GhostPad imediatamente:

1. Abra o arquivo `src/js/app-config.js`
2. Configure apenas o sistema de atualização (seção 2)
3. As outras configurações já estão com valores padrão funcionais

## 2. Sistema de Atualização

### Configuração Obrigatória

Para habilitar o sistema de atualização automática, configure os seguintes campos:

```javascript
export const UPDATE_CONFIG = {
  github: {
    owner: 'SEU-USUARIO-GITHUB',    // ← Seu usuário do GitHub
    repo: 'NOME-DO-REPOSITORIO',    // ← Nome do seu repositório
    enabled: true,                  // ← Habilitar sistema de atualização
  },
  // ... resto da configuração
};
```

### Exemplo Prático

Se seu repositório é `https://github.com/joaosilva/meu-ghostpad`:

```javascript
export const UPDATE_CONFIG = {
  github: {
    owner: 'joaosilva',
    repo: 'meu-ghostpad',
    enabled: true,
  },
  // ... resto permanece igual
};
```

### Configurações de Verificação

Você pode personalizar a frequência das verificações:

```javascript
intervals: {
  autoCheck: 24 * 60 * 60 * 1000,    // Verificação automática a cada 24h
  retryDelay: 5 * 60 * 1000,         // Aguarda 5 min após erro
  backgroundCheck: 5 * 60 * 1000,    // Verifica em background a cada 5 min
},
```

### Configurações de Rede

Para ambientes com proxy ou conexão lenta:

```javascript
network: {
  timeout: 10000,                     // Timeout de 10 segundos
  retries: 3,                         // Máximo 3 tentativas
  userAgent: 'GhostPad-UpdateChecker', // Identificação nas requisições
},
```

### Padrões de Nomenclatura

O sistema reconhece automaticamente os instaladores por plataforma:

- **Windows**: arquivos terminados em `-setup.exe`, `.exe`, `-win.exe`, `-windows.exe`
- **macOS**: arquivos terminados em `.dmg`, `-mac.dmg`, `-macos.dmg`
- **Linux**: arquivos terminados em `.AppImage`, `-linux.AppImage`, `.deb`, `.rpm`

## 3. Configurações Avançadas

### Informações da Aplicação

```javascript
export const APP_INFO = {
  name: 'GhostPad',
  description: 'Editor de texto discreto com proteção contra captura de tela',
  author: 'Seu Nome',
  copyright: 'Sua Empresa/Nome',
  website: 'https://seusite.com',
};
```

### Configurações da Janela

```javascript
export const WINDOW_CONFIG = {
  default: {
    width: 1000,                      // Largura inicial
    height: 800,                      // Altura inicial
    minWidth: 400,                    // Largura mínima
    minHeight: 300,                   // Altura mínima
  },
  
  security: {
    contentProtection: true,          // Proteção contra captura de tela
    // ... outras configurações de segurança
  },
  
  appearance: {
    frame: false,                     // Janela sem moldura
    backgroundColor: '#ffffff',       // Cor de fundo
    autoHideMenuBar: true,           // Ocultar barra de menu
    transparent: false,              // Transparência da janela
  }
};
```

### Configurações de Projetos

```javascript
export const PROJECT_CONFIG = {
  maxRecentProjects: 10,              // Máximo de projetos recentes
  defaultDirectory: 'Ghostpad/Projetos', // Pasta padrão (relativa a Documentos)
  
  storeDefaults: {
    temaSalvo: 'sistema',            // Tema padrão
    transparencia: 1.0,              // Transparência padrão
    sempreNoTopo: false,             // Manter janela sempre no topo
    autoUpdateCheck: true,           // Verificação automática habilitada
  },
};
```

## 4. Personalização

### Temas Disponíveis

```javascript
export const THEME_CONFIG = {
  available: ['sistema', 'claro', 'escuro'],
  default: 'sistema',
};
```

### Níveis de Transparência

```javascript
export const TRANSPARENCY_CONFIG = {
  min: 0.2,                          // Transparência mínima (20%)
  max: 1.0,                          // Transparência máxima (100% - opaco)
  step: 0.1,                         // Incremento
  default: 1.0,                      // Valor padrão
  
  presets: [
    { label: 'Opaco (100%)', value: 1.0 },
    { label: 'Semitransparente (80%)', value: 0.8 },
    { label: 'Transparência média (60%)', value: 0.6 },
    { label: 'Alta transparência (40%)', value: 0.4 }
  ]
};
```

### Editor e Teleprompter

```javascript
export const EDITOR_CONFIG = {
  teleprompter: {
    defaultSpeed: 5,                 // Velocidade padrão
    minSpeed: 0.25,                  // Velocidade mínima
    maxSpeed: 10,                    // Velocidade máxima
    maxCountdown: 10,                // Contagem regressiva máxima
    highlightEnabled: true,          // Destaque habilitado
  },
  
  formatting: {
    fonts: [                         // Fontes disponíveis
      'Arial', 'Verdana', 'Times New Roman', 
      'Courier New', 'Georgia', 'Tahoma', 'Trebuchet MS'
    ],
    fontSizes: [                     // Tamanhos de fonte
      { label: '8pt', value: '1' },
      { label: '10pt', value: '2' },
      { label: '12pt', value: '3' },
      { label: '14pt', value: '4' },
      { label: '18pt', value: '5' },
      { label: '24pt', value: '6' },
      { label: '36pt', value: '7' }
    ]
  }
};
```

## 5. Solução de Problemas

### Sistema de Atualização Não Funciona

**Problema**: "Sistema de atualização não configurado" ou erro 404

**Soluções**:

1. **Verifique as configurações**:
   ```javascript
   // ❌ Incorreto
   owner: 'SEU-USUARIO-GITHUB',
   repo: 'SEU-REPOSITORIO',
   
   // ✅ Correto  
   owner: 'seuusuario',
   repo: 'seurepositorio',
   ```

2. **Confirme que o repositório existe**: Acesse `https://github.com/OWNER/REPO` no navegador

3. **Verifique se há releases**: O repositório deve ter pelo menos uma release publicada

### Error de Rate Limiting

**Problema**: "API rate limit exceeded"

**Soluções**:
- Aguarde 1 hora para o limite ser resetado
- Configure um token GitHub (funcionalidade futura)
- Diminua a frequência de verificação

### Atualizações Não Sendo Detectadas

**Problema**: Nova versão disponível mas não aparece notificação

**Soluções**:

1. **Verifique o versionamento**: Use versionamento semântico (ex: v1.2.3)
2. **Forçar verificação**: Menu → Ajuda → Verificar Atualizações
3. **Verificar console**: Abra DevTools (F12) e veja mensagens de log

### Instalador Não Encontrado

**Problema**: "Nenhum instalador compatível encontrado"

**Soluções**:

1. **Nomeação correta dos arquivos**:
   - Windows: `GhostPad-1.2.3-setup.exe`
   - macOS: `GhostPad-1.2.3.dmg`
   - Linux: `GhostPad-1.2.3.AppImage`

2. **Upload completo**: Certifique-se que todos os arquivos foram enviados na release

### Configurações Não Salvam

**Problema**: Configurações voltam ao padrão após reiniciar

**Soluções**:
- Verifique permissões da pasta do usuário
- Execute como administrador (Windows)
- Limpe o cache: delete `%APPDATA%/ghostpad` (Windows)

## 🔧 Configuração para Desenvolvimento

### Modo Desenvolvimento

Para habilitar recursos de desenvolvimento:

```bash
npm start -- --dev
```

Ou configure diretamente no código:

```javascript
export const BUILD_CONFIG = {
  isDevelopment: true,              // Força modo desenvolvimento
  
  development: {
    enableDevTools: true,           // DevTools habilitadas
    enableF12Shortcut: true,        // Atalho F12 funcionando
    verboseLogging: true,           // Logs detalhados
  }
};
```

### Debug do Sistema de Atualização

Para debugar o sistema de atualização:

1. Abra DevTools (F12)
2. Vá para Console
3. Execute: `await window.electronAPI.checkForUpdates()`
4. Observe os logs detalhados

## 📝 Validação de Configuração

O sistema valida automaticamente suas configurações ao iniciar. Você pode verificar manualmente:

```javascript
import { validateConfig } from './src/js/app-config.js';

if (validateConfig()) {
  console.log('✅ Configuração válida');
} else {
  console.log('❌ Configuração incompleta');
}
```

## 🚀 Próximos Passos

Após configurar:

1. **Teste o sistema**: Use "Verificar Atualizações" no menu
2. **Publique uma release**: Crie uma release no GitHub para testar
3. **Configure CI/CD**: Automatize builds e releases
4. **Monitore logs**: Acompanhe o funcionamento via console

## 📞 Suporte

Se precisar de ajuda:

1. Verifique os logs no DevTools (F12)
2. Consulte as issues do repositório oficial
3. Abra uma nova issue com detalhes do problema 