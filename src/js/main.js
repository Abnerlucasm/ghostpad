import { app, BrowserWindow, Menu, dialog, ipcMain, globalShortcut } from 'electron';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações persistentes
const store = new Store({
  name: 'app-oculto-config',
  defaults: {
    temaSalvo: 'sistema',
    transparencia: 1.0,
    projetosRecentes: [],
    sempreNoTopo: false
  }
});

// Configurações da aplicação
const APP_CONFIG = {
  MAX_PROJETOS_RECENTES: 10,
  DEFAULT_WINDOW_WIDTH: 1000,
  DEFAULT_WINDOW_HEIGHT: 800
};

// Configuração do diretório de projetos
const PROJETOS_DIR = path.join(app.getPath('documents'), 'App Oculto', 'Projetos');

// Garantir que o diretório existe
if (!fs.existsSync(PROJETOS_DIR)) {
  fs.mkdirSync(PROJETOS_DIR, { recursive: true });
}

// Função para obter o caminho do projeto
function getProjetoPath(nomeProjeto) {
  if (!projetoAtual) {
    throw new Error('Nenhum projeto aberto');
  }
  if (!projetoAtual.caminhoArquivo) {
    throw new Error('Projeto não tem caminho definido');
  }
  return projetoAtual.caminhoArquivo;
}

// Variáveis globais
let mainWindow;
let projetoAtual = null;
let conteudoAtual = '';
let projetoModificado = false;

// Função para criar a janela principal
function createWindow() {
  const isDevMode = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      // Configurações de segurança
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // Permitir DevTools em desenvolvimento
      devTools: isDevMode
    },
    // Configurações da janela
    frame: false,
    show: false,
    icon: path.join(__dirname, '../images/icon.ico'),
    skipTaskbar: false, // Mostra na barra de tarefas
    type: 'normal', // Voltamos para tipo normal para garantir visibilidade
    hasShadow: true,
    autoHideMenuBar: true,
    transparent: false // Removido transparent para evitar problemas de visibilidade
  });

  // Configurações de visibilidade
  mainWindow.setBackgroundColor('#ffffff');
  mainWindow.setAlwaysOnTop(false); // Não fica sempre no topo por padrão
  
  // Habilita a proteção de conteúdo para prevenir captura
  mainWindow.setContentProtection(true);
  
  // Prevenir captura de tela
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && 
        (input.key.toLowerCase() === 'printscreen' || 
         input.key === 'p' || 
         input.key === 's')) {
      event.preventDefault();
    }
  });

  // Desabilitar menu de contexto
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Prevenir compartilhamento de tela
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['clipboard-read', 'clipboard-write'];
    callback(allowedPermissions.includes(permission));
  });

  // Desabilitar recursos que podem expor o conteúdo
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    return false;
  });

  // Bloquear recursos de captura
  mainWindow.webContents.session.setDevicePermissionHandler(() => false);
  
  // Configurações de segurança adicionais
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self'; " +
          "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
          "font-src 'self' https://cdnjs.cloudflare.com; " +
          "img-src 'self' data:;"
        ],
        'X-Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self'; " +
          "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
          "font-src 'self' https://cdnjs.cloudflare.com; " +
          "img-src 'self' data:;"
        ],
        'X-Frame-Options': ['DENY']
      }
    });
  });

  // Aplica a configuração de sempre no topo
  const sempreNoTopo = store.get('sempreNoTopo', false);
  mainWindow.setAlwaysOnTop(sempreNoTopo);

  // Carrega o arquivo index.html
  mainWindow.loadFile('index.html');
  
  // Aplicar a transparência salva
  const transparencia = store.get('transparencia', 1.0);
  mainWindow.setOpacity(transparencia);
  
  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Registrar atalho global para restaurar o foco
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (mainWindow) {
      mainWindow.focus();
      mainWindow.show();
    }
  });

  // Limpar atalho quando a janela for fechada
  mainWindow.on('closed', () => {
    globalShortcut.unregister('CommandOrControl+Shift+Space');
  });

  // Evento para quando a janela for fechada
  mainWindow.on('close', (e) => {
    if (projetoModificado) {
      e.preventDefault();
      
      // Pergunta ao usuário se deseja salvar o projeto antes de fechar
      const opcoes = {
        type: 'question',
        buttons: ['Salvar', 'Não Salvar', 'Cancelar'],
        defaultId: 0,
        title: 'Salvar alterações?',
        message: 'Deseja salvar as alterações feitas no projeto atual?'
      };
      
      dialog.showMessageBox(mainWindow, opcoes).then((resposta) => {
        if (resposta.response === 0) { // Salvar
          if (projetoAtual) {
            salvarProjeto(conteudoAtual, () => {
              projetoModificado = false;
              app.exit();
            });
          }
        } else if (resposta.response === 1) { // Não Salvar
          projetoModificado = false;
          app.exit();
        }
        // Se for Cancelar, não faz nada e volta para o aplicativo
      });
    }
  });

  // Habilitar DevTools em desenvolvimento
  if (isDevMode) {
    mainWindow.webContents.openDevTools();
    
    // Adiciona handler para F12 para alternar DevTools
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12') {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      }
    });
  }
}

// Criar o template do menu
function criarMenuTemplate() {
  return [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Novo Projeto',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('abrir-modal-novo-projeto');
          }
        },
        {
          label: 'Abrir Projeto',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            abrirProjeto();
          }
        },
        {
          label: 'Salvar',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (projetoAtual) {
              mainWindow.webContents.send('solicitar-conteudo');
            }
          }
        },
        {
          label: 'Fechar Projeto',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            fecharProjetoAtual();
          }
        },
        { type: 'separator' },
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Visualização',
      submenu: [
        {
          label: 'Tema',
          submenu: [
            {
              label: 'Claro',
              type: 'radio',
              checked: store.get('temaSalvo') === 'claro',
              click: () => {
                store.set('temaSalvo', 'claro');
                mainWindow.webContents.send('alternar-tema', 'claro');
              }
            },
            {
              label: 'Escuro',
              type: 'radio',
              checked: store.get('temaSalvo') === 'escuro',
              click: () => {
                store.set('temaSalvo', 'escuro');
                mainWindow.webContents.send('alternar-tema', 'escuro');
              }
            }
          ]
        },
        {
          label: 'Transparência',
          submenu: [
            {
              label: 'Opaco (100%)',
              type: 'radio',
              checked: Math.round(store.get('transparencia') * 100) === 100,
              click: () => {
                ajustarTransparencia(1.0);
              }
            },
            {
              label: 'Semitransparente (80%)',
              type: 'radio',
              checked: Math.round(store.get('transparencia') * 100) === 80,
              click: () => {
                ajustarTransparencia(0.8);
              }
            },
            {
              label: 'Transparência média (60%)',
              type: 'radio',
              checked: Math.round(store.get('transparencia') * 100) === 60,
              click: () => {
                ajustarTransparencia(0.6);
              }
            },
            {
              label: 'Alta transparência (40%)',
              type: 'radio',
              checked: Math.round(store.get('transparencia') * 100) === 40,
              click: () => {
                ajustarTransparencia(0.4);
              }
            }
          ]
        },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre o App Oculto',
          click: () => {
            dialog.showMessageBox({
              title: 'Sobre o App Oculto',
              message: 'App Oculto v1.0.0',
              detail: 'Um editor de texto discreto que se oculta de gravações de tela e ferramentas de compartilhamento.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];
}

// Função para criar um novo projeto
function criarNovoProjeto(dados, callback) {
  // Validações de segurança
  if (!dados || typeof dados !== 'object') {
    return callback(new Error('Dados inválidos'));
  }
  
  const { nome, observacao } = dados;
  
  if (!nome || typeof nome !== 'string') {
    return callback(new Error('Nome do projeto inválido'));
  }
  
  // Cria o diálogo para salvar o arquivo JSON
  dialog.showSaveDialog(mainWindow, {
    title: 'Salvar Projeto',
    defaultPath: path.join(app.getPath('documents'), `${nome}.json`),
    filters: [
      { name: 'Arquivos JSON', extensions: ['json'] }
    ]
  }).then((resultado) => {
    if (!resultado.canceled && resultado.filePath) {
      const caminhoArquivo = resultado.filePath;
      
      // Cria o objeto do projeto
      const projeto = {
        nome: nome,
        observacao: observacao || '',
        conteudo: '',
        dataCriacao: new Date().toISOString(),
        ultimaModificacao: new Date().toISOString(),
        caminhoArquivo: caminhoArquivo
      };
      
      // Salva o arquivo JSON
      try {
        fs.writeFileSync(caminhoArquivo, JSON.stringify(projeto, null, 2), 'utf-8');
        
        // Atualiza variáveis globais
        projetoAtual = projeto;
        conteudoAtual = '';
        projetoModificado = false;
        
        // Adiciona aos projetos recentes
        adicionarProjetoRecente(projeto);
        
        // Envia o projeto para o processo de renderização
        mainWindow.webContents.send('projeto-carregado', projeto);
        
        if (callback) callback(null, projeto);
      } catch (erro) {
        console.error('Erro ao salvar o arquivo:', erro);
        if (callback) callback(erro);
      }
    }
  }).catch((erro) => {
    console.error('Erro no diálogo de salvar:', erro);
    if (callback) callback(erro);
  });
}

// Função para abrir um projeto existente
function abrirProjeto(callback) {
  // Verificar se há um projeto aberto com alterações não salvas
  if (projetoModificado) {
    const opcoes = {
      type: 'question',
      buttons: ['Salvar', 'Não Salvar', 'Cancelar'],
      defaultId: 0,
      title: 'Salvar alterações?',
      message: 'Deseja salvar as alterações feitas no projeto atual?'
    };
    
    dialog.showMessageBox(mainWindow, opcoes).then((resposta) => {
      if (resposta.response === 0) { // Salvar
        salvarProjeto(conteudoAtual, () => {
          // Continuar com a abertura do novo projeto
          exibirDialogoAbrirProjeto(callback);
        });
      } else if (resposta.response === 1) { // Não Salvar
        // Continuar com a abertura do novo projeto sem salvar
        exibirDialogoAbrirProjeto(callback);
      }
      // Se for Cancelar, não faz nada
    });
  } else {
    // Não há alterações não salvas, continuar com a abertura
    exibirDialogoAbrirProjeto(callback);
  }
}

// Função para exibir o diálogo de abrir projeto
function exibirDialogoAbrirProjeto(callback) {
  // Abre o diálogo para selecionar um arquivo de projeto
  dialog.showOpenDialog({
    title: 'Abrir Projeto',
    defaultPath: app.getPath('documents'),
    filters: [
      { name: 'Arquivos JSON', extensions: ['json'] }
    ],
    properties: ['openFile']
  }).then((resultado) => {
    if (!resultado.canceled && resultado.filePaths.length > 0) {
      const caminhoArquivo = resultado.filePaths[0];
      
      try {
        // Lê o arquivo JSON
        const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
        const dadosProjeto = JSON.parse(conteudo);
        
        // Verifica se o arquivo é válido
        if (!dadosProjeto.nome) {
          throw new Error('Arquivo de projeto inválido');
        }
        
        // Atualiza o caminho do arquivo
        dadosProjeto.caminhoArquivo = caminhoArquivo;
        
        if (!dadosProjeto.observacao) {
          dadosProjeto.observacao = '';
        }
        
        // Atualiza variáveis globais
        projetoAtual = dadosProjeto;
        conteudoAtual = dadosProjeto.conteudo || '';
        projetoModificado = false;
        
        // Adiciona aos projetos recentes
        adicionarProjetoRecente(projetoAtual);
        
        // Carrega o projeto na interface
        mainWindow.webContents.send('projeto-carregado', projetoAtual);
        
        if (callback) callback(null, projetoAtual);
      } catch (erro) {
        console.error('Erro ao abrir o projeto:', erro);
        dialog.showErrorBox(
          'Erro ao Abrir Projeto',
          'Não foi possível abrir o arquivo selecionado. Verifique se é um projeto válido.'
        );
        if (callback) callback(erro);
      }
    }
  }).catch((erro) => {
    console.error('Erro no diálogo:', erro);
    dialog.showErrorBox(
      'Erro',
      'Ocorreu um erro ao tentar abrir o diálogo de seleção de arquivo.'
    );
    if (callback) callback(erro);
  });
}

// Função para salvar o projeto
function salvarProjeto(conteudo, callback) {
  if (!projetoAtual) {
    return callback(new Error('Nenhum projeto aberto'));
  }

  try {
    const caminhoArquivo = projetoAtual.caminhoArquivo;
    if (!caminhoArquivo) {
      return callback(new Error('Caminho do arquivo não definido'));
    }

    const dados = {
      ...projetoAtual,
      conteudo: conteudo,
      ultimaModificacao: new Date().toISOString()
    };

    fs.writeFileSync(caminhoArquivo, JSON.stringify(dados, null, 2));
    projetoAtual = dados;
    projetoModificado = false;
    mainWindow.webContents.send('projeto-salvo');
    if (callback) callback(null);
  } catch (erro) {
    console.error('Erro ao salvar o projeto:', erro);
    if (callback) callback(erro);
  }
}

// Função para fechar o projeto atual
function fecharProjetoAtual(callback) {
  if (projetoModificado) {
    const opcoes = {
    type: 'question',
      buttons: ['Salvar', 'Não Salvar', 'Cancelar'],
    defaultId: 0,
      title: 'Salvar alterações?',
      message: 'Deseja salvar as alterações feitas no projeto atual?'
    };
    
    dialog.showMessageBox(mainWindow, opcoes).then((resposta) => {
      if (resposta.response === 0) { // Salvar
        salvarProjeto(conteudoAtual, () => {
          // Continuar com o fechamento do projeto
          limparProjetoAtual();
          if (callback) callback(null);
        });
      } else if (resposta.response === 1) { // Não Salvar
        // Continuar com o fechamento do projeto sem salvar
        limparProjetoAtual();
        if (callback) callback(null);
      }
      // Se for Cancelar, não faz nada
    });
  } else {
    limparProjetoAtual();
    if (callback) callback(null);
  }
}

// Função para limpar projeto atual
function limparProjetoAtual() {
  projetoAtual = null;
  conteudoAtual = '';
  projetoModificado = false;
  mainWindow.webContents.send('projeto-fechado');
}

// Função para adicionar projeto à lista de recentes
function adicionarProjetoRecente(projeto) {
  // Obtém a lista atual de projetos recentes
  let projetosRecentes = store.get('projetosRecentes', []);
  
  // Remove o projeto se já existir na lista
  projetosRecentes = projetosRecentes.filter((p) => {
    return p.caminhoArquivo !== projeto.caminhoArquivo;
  });
  
  // Adiciona o projeto no início da lista
  projetosRecentes.unshift({
    nome: projeto.nome,
    observacao: projeto.observacao,
    caminhoArquivo: projeto.caminhoArquivo,
    dataCriacao: projeto.dataCriacao,
    ultimaModificacao: projeto.ultimaModificacao
  });
  
  // Limita a lista a 10 projetos
  if (projetosRecentes.length > 10) {
    projetosRecentes = projetosRecentes.slice(0, 10);
  }
  
  // Salva a lista atualizada
  store.set('projetosRecentes', projetosRecentes);
  
  // Envia a lista atualizada para o renderer
  enviarProjetosRecentes();
}

// Função para enviar a lista de projetos recentes para o renderer
function enviarProjetosRecentes() {
  const projetosRecentes = store.get('projetosRecentes', []);
    mainWindow.webContents.send('projetos-recentes', projetosRecentes);
}

// Função para ajustar a transparência da janela
function ajustarTransparencia(valor) {
  if (!mainWindow) return;
  
  // Limita o valor entre 0.2 e 1.0
  const valorLimitado = Math.max(0.2, Math.min(1.0, valor));
  
  // Aplica a transparência
  mainWindow.setOpacity(valorLimitado);
  
  // Salva o valor nas configurações
  store.set('transparencia', valorLimitado);
  
  // Atualiza o menu
  const menu = Menu.buildFromTemplate(criarMenuTemplate());
  Menu.setApplicationMenu(menu);
  
  // Notifica o renderer
  mainWindow.webContents.send('transparencia-carregada', valorLimitado);
}

// Inicialização do aplicativo
app.whenReady().then(() => {
  createWindow();
  
  // Cria o menu da aplicação
  const menuTemplate = criarMenuTemplate();
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  
  app.on('activate', function () {
    // No macOS é comum recriar uma janela no app quando o 
    // ícone da dock é clicado e não existem outras janelas abertas.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Adicionar manipulador de atalho para F12 em modo de desenvolvimento
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    globalShortcut.register('F12', () => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.toggleDevTools();
      }
    });
  }
});

// Sai quando todas as janelas forem fechadas, exceto no macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Eventos IPC (comunicação entre processos)
ipcMain.on('criar-novo-projeto', (event, dados) => {
  criarNovoProjeto(dados, (erro) => {
    if (erro) {
      dialog.showErrorBox('Erro', `Falha ao criar o projeto: ${erro.message}`);
    }
  });
});

ipcMain.on('abrir-projeto', () => {
  abrirProjeto();
});

ipcMain.on('fechar-projeto-atual', () => {
  fecharProjetoAtual();
});

ipcMain.on('conteudo-editor', (event, conteudo) => {
  conteudoAtual = conteudo;
  projetoModificado = true;
  
  // Salva o projeto automaticamente quando o conteúdo é alterado
  salvarProjeto(conteudo, (erro) => {
    if (erro) {
      console.error('Erro ao salvar o projeto:', erro);
      event.sender.send('projeto-salvo', erro);
    } else {
      event.sender.send('projeto-salvo');
    }
  });
});

ipcMain.on('conteudo-editor-fechar', (event, conteudo) => {
  conteudoAtual = conteudo;
  salvarProjeto(conteudo, () => {
    app.exit();
});
});

ipcMain.on('solicitar-projetos-recentes', () => {
  enviarProjetosRecentes();
});

ipcMain.on('tema-alterado', (event, tema) => {
  store.set('temaSalvo', tema);
});

ipcMain.on('solicitar-tema', (event) => {
  const temaSalvo = store.get('temaSalvo', 'sistema');
  event.sender.send('tema-carregado', temaSalvo);
});

ipcMain.on('atualizar-projetos-recentes', (event, projetosAtualizados) => {
  if (Array.isArray(projetosAtualizados)) {
    store.set('projetosRecentes', projetosAtualizados);
    // Reenviar a lista atualizada
    enviarProjetosRecentes();
  }
});

ipcMain.on('ajustar-transparencia', (event, valor) => {
  // Validação do valor de transparência
  const transparencia = Math.max(0.2, Math.min(1.0, parseFloat(valor) || 1.0));
  
  // Aplica a transparência à janela
  mainWindow.setOpacity(transparencia);
  
  // Salva a transparência nas configurações
  store.set('transparencia', transparencia);
});

// Evento para solicitar o conteúdo atual do editor
ipcMain.on('solicitar-conteudo', (event) => {
  if (!projetoAtual) {
    event.sender.send('projeto-salvo', new Error('Nenhum projeto aberto'));
    return;
  }

  const editor = event.sender;
  editor.executeJavaScript('document.getElementById("editor").value', (resultado) => {
    if (resultado === undefined) {
      event.sender.send('projeto-salvo', new Error('Não foi possível obter o conteúdo do editor'));
      return;
    }

    salvarProjeto(resultado, (erro) => {
      if (erro) {
        event.sender.send('projeto-salvo', erro);
      } else {
        event.sender.send('projeto-salvo');
      }
    });
  });
});

// Eventos IPC
ipcMain.on('verificar-arquivo', (event, caminhoArquivo) => {
  try {
    const existe = fs.existsSync(caminhoArquivo);
    event.reply('arquivo-verificado', existe);
  } catch (erro) {
    console.error('Erro ao verificar arquivo:', erro);
    event.reply('arquivo-verificado', false);
  }
});

// Eventos IPC
ipcMain.on('carregar-projeto', (event, caminhoArquivo) => {
  console.log('Carregando projeto do caminho:', caminhoArquivo);
  
  try {
    if (!caminhoArquivo || typeof caminhoArquivo !== 'string') {
      throw new Error('Caminho do arquivo inválido');
    }

    // Lê o arquivo JSON
    const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
    const dadosProjeto = JSON.parse(conteudo);
    
    console.log('Dados do projeto lidos:', dadosProjeto);
    
    // Verifica se o arquivo é válido
    if (!dadosProjeto.nome) {
      throw new Error('Arquivo de projeto inválido: nome não encontrado');
    }
    
    // Cria uma cópia profunda do objeto para evitar problemas de referência
    const projetoCompleto = JSON.parse(JSON.stringify({
      nome: dadosProjeto.nome || '',
      observacao: dadosProjeto.observacao || '',
      conteudo: dadosProjeto.conteudo || '',
      dataCriacao: dadosProjeto.dataCriacao || new Date().toISOString(),
      ultimaModificacao: dadosProjeto.ultimaModificacao || new Date().toISOString(),
      caminhoArquivo: caminhoArquivo
    }));
    
    // Atualiza variáveis globais
    projetoAtual = projetoCompleto;
    conteudoAtual = projetoCompleto.conteudo;
    projetoModificado = false;
    
    // Adiciona aos projetos recentes
    adicionarProjetoRecente(projetoAtual);
    
    console.log('Enviando projeto para a interface:', projetoCompleto);
    
    // Carrega o projeto na interface
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('projeto-carregado', projetoCompleto);
    } else {
      console.error('Janela principal não está disponível');
    }
  } catch (erro) {
    console.error('Erro ao carregar o projeto:', erro);
    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog.showErrorBox(
        'Erro ao Carregar Projeto',
        `Não foi possível carregar o arquivo selecionado: ${erro.message}`
      );
    }
  }
});

// Eventos IPC
ipcMain.on('alternar-sempre-topo', (event, valor) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(valor);
    store.set('sempreNoTopo', valor);
  }
});

// Função para excluir o projeto atual
function excluirProjetoAtual(callback) {
  if (!projetoAtual || !projetoAtual.caminhoArquivo) {
    return callback(new Error('Nenhum projeto aberto para excluir'));
  }

  const opcoes = {
    type: 'warning',
    buttons: ['Excluir', 'Cancelar'],
    defaultId: 1,
    title: 'Confirmar Exclusão',
    message: 'Tem certeza que deseja excluir este projeto?',
    detail: 'Esta ação não pode ser desfeita.'
  };

  dialog.showMessageBox(mainWindow, opcoes).then((resposta) => {
    if (resposta.response === 0) { // Excluir
      try {
        // Remove o arquivo
        fs.unlinkSync(projetoAtual.caminhoArquivo);
        
        // Remove da lista de projetos recentes
        const projetosRecentes = store.get('projetosRecentes', []);
        const novosProjetosRecentes = projetosRecentes.filter(p => 
          p.caminhoArquivo !== projetoAtual.caminhoArquivo
        );
        store.set('projetosRecentes', novosProjetosRecentes);
        
        // Limpa o projeto atual
        limparProjetoAtual();
        
        // Notifica o renderer
        mainWindow.webContents.send('projeto-excluido');
        
        if (callback) callback(null);
      } catch (erro) {
        console.error('Erro ao excluir o projeto:', erro);
        if (callback) callback(erro);
      }
    } else {
      // Cancelar
      if (callback) callback(null);
    }
  });
}

// Eventos IPC
ipcMain.on('excluir-projeto-atual', () => {
  excluirProjetoAtual((erro) => {
    if (erro) {
      dialog.showErrorBox(
        'Erro ao Excluir Projeto',
        `Não foi possível excluir o projeto: ${erro.message}`
      );
    }
  });
});

// Eventos IPC
ipcMain.on('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('close-window', () => {
  mainWindow.close();
});

ipcMain.on('start-resize', (event, direction) => {
  const point = mainWindow.getBounds();
  const { x, y } = point;
  const { width, height } = mainWindow.getSize();
  
  switch (direction) {
    case 'top':
      mainWindow.setBounds({ x, y: y + height - 1, width, height: 1 });
      mainWindow.beginBoundsTransaction('resize', 'top');
      break;
    case 'right':
      mainWindow.setBounds({ x, y, width: 1, height });
      mainWindow.beginBoundsTransaction('resize', 'right');
      break;
    case 'bottom':
      mainWindow.setBounds({ x, y, width, height: 1 });
      mainWindow.beginBoundsTransaction('resize', 'bottom');
      break;
    case 'left':
      mainWindow.setBounds({ x: x + width - 1, y, width: 1, height });
      mainWindow.beginBoundsTransaction('resize', 'left');
      break;
    case 'top-left':
      mainWindow.setBounds({ x: x + width - 1, y: y + height - 1, width: 1, height: 1 });
      mainWindow.beginBoundsTransaction('resize', 'top-left');
      break;
    case 'top-right':
      mainWindow.setBounds({ x, y: y + height - 1, width: 1, height: 1 });
      mainWindow.beginBoundsTransaction('resize', 'top-right');
      break;
    case 'bottom-left':
      mainWindow.setBounds({ x: x + width - 1, y, width: 1, height: 1 });
      mainWindow.beginBoundsTransaction('resize', 'bottom-left');
      break;
    case 'bottom-right':
      mainWindow.setBounds({ x, y, width: 1, height: 1 });
      mainWindow.beginBoundsTransaction('resize', 'bottom-right');
      break;
  }
}); 