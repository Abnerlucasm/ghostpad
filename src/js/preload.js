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
}); 