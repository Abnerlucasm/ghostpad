const { contextBridge, ipcRenderer } = require('electron');

// Expor funcionalidades seguras para o processo de renderização
contextBridge.exposeInMainWorld('electron', {
  // Projetos
  criarNovoProjeto: (dados) => ipcRenderer.send('criar-novo-projeto', dados),
  abrirProjeto: () => ipcRenderer.send('abrir-projeto'),
  fecharProjeto: () => ipcRenderer.send('fechar-projeto-atual'),
  salvarProjeto: () => ipcRenderer.send('solicitar-conteudo'),
  excluirProjeto: () => ipcRenderer.send('excluir-projeto-atual'),
  carregarProjeto: (caminho) => {
    console.log('Enviando solicitação para carregar projeto:', caminho);
    ipcRenderer.send('carregar-projeto', caminho);
  },
  verificarArquivo: (caminho, callback) => {
    if (typeof callback !== 'function') {
      console.error('Callback inválido fornecido para verificarArquivo');
      return;
    }
    ipcRenderer.send('verificar-arquivo', caminho);
    ipcRenderer.once('arquivo-verificado', (event, existe) => callback(existe));
  },

  // Editor
  enviarConteudoEditor: (conteudo) => ipcRenderer.send('conteudo-editor', conteudo),
  solicitarConteudo: () => ipcRenderer.send('solicitar-conteudo'),

  // Tema e Transparência
  alternarTema: (tema) => ipcRenderer.send('tema-alterado', tema),
  solicitarTema: (callback) => {
    if (typeof callback !== 'function') {
      console.error('Callback inválido fornecido para solicitarTema');
      return;
    }
    ipcRenderer.send('solicitar-tema');
    ipcRenderer.once('tema-carregado', (event, tema) => callback(tema));
  },
  ajustarTransparencia: (valor) => ipcRenderer.send('ajustar-transparencia', valor),
  solicitarTransparencia: () => ipcRenderer.send('solicitar-transparencia'),
  alternarSempreTopo: (valor) => ipcRenderer.send('alternar-sempre-topo', valor),

  // Projetos Recentes
  solicitarProjetosRecentes: () => ipcRenderer.send('solicitar-projetos-recentes'),
  atualizarProjetosRecentes: (projetos) => ipcRenderer.send('atualizar-projetos-recentes', projetos),

  // Eventos
  onProjetoCarregado: (callback) => {
    if (typeof callback !== 'function') {
      console.error('Callback inválido fornecido para onProjetoCarregado');
      return;
    }
    console.log('Registrando listener para projeto-carregado');
    ipcRenderer.removeAllListeners('projeto-carregado');
    ipcRenderer.on('projeto-carregado', (event, projeto) => {
      console.log('Projeto recebido no preload:', projeto);
      if (projeto && typeof projeto === 'object') {
        callback(projeto);
      } else {
        console.error('Projeto inválido recebido no preload:', projeto);
        callback(null);
      }
    });
  },
  onProjetoExcluido: (callback) => {
    ipcRenderer.removeAllListeners('projeto-excluido');
    ipcRenderer.on('projeto-excluido', () => callback());
  },
  onProjetoFechado: (callback) => {
    ipcRenderer.removeAllListeners('projeto-fechado');
    ipcRenderer.on('projeto-fechado', () => callback());
  },
  onProjetoSalvo: (callback) => {
    ipcRenderer.removeAllListeners('projeto-salvo');
    ipcRenderer.on('projeto-salvo', () => callback());
  },
  onProjetosRecentes: (callback) => {
    if (typeof callback !== 'function') {
      console.error('Callback inválido fornecido para onProjetosRecentes');
      return;
    }
    ipcRenderer.removeAllListeners('projetos-recentes');
    ipcRenderer.on('projetos-recentes', (event, projetos) => callback(projetos));
  },
  onTemaCarregado: (callback) => {
    ipcRenderer.removeAllListeners('tema-carregado');
    ipcRenderer.on('tema-carregado', (event, tema) => callback(tema));
  },
  onTransparenciaCarregada: (callback) => {
    ipcRenderer.removeAllListeners('transparencia-carregada');
    ipcRenderer.on('transparencia-carregada', (event, valor) => callback(valor));
  },

  // Controles da janela
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  startResize: (direction) => ipcRenderer.send('start-resize', direction),

  // ==================== UPDATE SERVICE APIs ====================
  
  // Verificar atualizações manualmente
  checkForUpdates: async (showDialog = true) => {
    try {
      return await ipcRenderer.invoke('check-for-updates', showDialog);
    } catch (error) {
      console.error('Erro ao verificar atualizações via preload:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter status das atualizações
  getUpdateStatus: async () => {
    try {
      return await ipcRenderer.invoke('get-update-status');
    } catch (error) {
      console.error('Erro ao obter status de atualização via preload:', error);
      return { success: false, error: error.message };
    }
  },

  // Configurar verificação automática
  setAutoUpdateCheck: async (enabled) => {
    try {
      return await ipcRenderer.invoke('set-auto-update-check', enabled);
    } catch (error) {
      console.error('Erro ao configurar verificação automática via preload:', error);
      return { success: false, error: error.message };
    }
  },

  // Obter configuração de verificação automática
  getAutoUpdateSetting: async () => {
    try {
      return await ipcRenderer.invoke('get-auto-update-setting');
    } catch (error) {
      console.error('Erro ao obter configuração de atualização via preload:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== FIM DAS UPDATE SERVICE APIs ====================

  // Informações da aplicação
  getAppVersion: async () => {
    try {
      return await ipcRenderer.invoke('get-app-version');
    } catch (error) {
      console.error('Erro ao obter versão da aplicação:', error);
      return 'N/A';
    }
  },

  getAppInfo: async () => {
    try {
      return await ipcRenderer.invoke('get-app-info');
    } catch (error) {
      console.error('Erro ao obter informações da aplicação:', error);
      return {};
    }
  },

  showAbout: async () => {
    try {
      return await ipcRenderer.invoke('show-about');
    } catch (error) {
      console.error('Erro ao mostrar sobre:', error);
    }
  },

  // API para criação de projetos
  criarNovoProjetoModal: async (dadosProjeto) => {
    try {
      return await ipcRenderer.invoke('criar-novo-projeto', dadosProjeto);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw error;
    }
  },

  // Eventos de modais
  onShowAboutModal: (callback) => {
    ipcRenderer.removeAllListeners('show-about-modal');
    ipcRenderer.on('show-about-modal', callback);
  },
}); 