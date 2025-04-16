// Classes de utilidade
class DOMManager {
  // Elementos da interface
  static elements = {
    editorContainer: document.getElementById('editor-container'),
    editorTextarea: document.getElementById('editor'),
    projetoInfo: document.getElementById('projeto-info'),
    statusBar: document.getElementById('status-bar'),
    projetosRecentes: document.getElementById('projetos-recentes'),
    listaProjetosRecentes: document.getElementById('lista-projetos-recentes'),
    notification: document.getElementById('notification'),
    bemVindo: document.getElementById('bem-vindo'),
    projetoInfoContainer: document.getElementById('projeto-info-container'),
    projetoNomeDisplay: document.getElementById('projeto-nome-display'),
    projetoObservacaoDisplay: document.getElementById('projeto-observacao-display'),
    projetoDataCriacao: document.getElementById('projeto-data-criacao'),
    projetoUltimaModificacao: document.getElementById('projeto-ultima-modificacao'),
    
    // Elementos do modal
    modalNovoProjeto: document.getElementById('modal-novo-projeto'),
    nomeProjeto: document.getElementById('nome-projeto'),
    observacaoProjeto: document.getElementById('observacao-projeto'),
    
    // Botões
    btnNovoProjeto: document.getElementById('novo-projeto'),
    btnAbrirProjeto: document.getElementById('abrir-projeto'),
    btnSalvar: document.getElementById('salvar'),
    btnFecharProjeto: document.getElementById('fechar-projeto'),
    btnFecharModal: document.getElementById('fechar-modal'),
    btnCancelarProjeto: document.getElementById('cancelar-projeto'),
    btnCriarProjeto: document.getElementById('criar-projeto'),
    btnHome: document.getElementById('btn-home'),
    btnModoCompacto: document.getElementById('modo-compacto'),
    
    // Alternador de tema
    temaSwitch: document.getElementById('tema-switch'),
    
    // Controle de transparência
    transparenciaSlider: document.getElementById('transparencia-slider'),
    
    // Containers principais
    conteudoPrincipal: document.getElementById('conteudo-principal'),
    painelLateral: document.getElementById('painel-lateral'),
    header: document.querySelector('.header'),
    controleContainer: document.querySelector('.controles-container'),
    container: document.querySelector('.container')
  };

  // Mostra notificação
  static mostrarNotificacao(mensagem, tipo = 'success') {
    this.elements.notification.textContent = mensagem;
    this.elements.notification.className = 'notification';
    
    if (tipo === 'error') {
      this.elements.notification.classList.add('error');
    }
    
    this.elements.notification.classList.add('show');
    setTimeout(() => {
      this.elements.notification.classList.remove('show');
    }, 2000);
  }

  // Exibe a tela de boas-vindas
  static exibirTelaBoasVindas() {
    this.elements.conteudoPrincipal.style.display = 'none';
    this.elements.bemVindo.style.display = 'block';
    this.elements.projetosRecentes.style.display = 'block';
    this.elements.btnSalvar.style.display = 'none';
    this.elements.btnModoCompacto.style.display = 'none';
    this.elements.btnFecharProjeto.style.display = 'none';
    this.elements.projetoInfo.innerHTML = `
      <img src="src/images/logo.png" alt="GhostPad Logo" class="logo" style="width: 28px; height: 28px; border-radius: 50%;">
      <span style="font-weight: bold; font-size: 1.2em; color: var(--cor-destaque);">GhostPad</span>
    `;
    this.elements.projetoInfoContainer.style.display = 'none';
    
    // Esconde o botão de excluir
    const btnExcluirProjeto = document.getElementById('excluir-projeto');
    if (btnExcluirProjeto) {
      btnExcluirProjeto.style.display = 'none';
    }
    
    // Garante que o modo compacto esteja desativado
    this.desativarModoCompacto();
  }

  // Exibe o editor
  static exibirEditor() {
    this.elements.bemVindo.style.display = 'none';
    this.elements.projetosRecentes.style.display = 'none';
    this.elements.conteudoPrincipal.style.display = 'flex';
    this.elements.btnSalvar.style.display = 'inline-block';
    this.elements.btnModoCompacto.style.display = 'inline-block';
    this.elements.btnFecharProjeto.style.display = 'inline-block';
    this.elements.editorContainer.style.display = 'flex';
    this.elements.projetoInfoContainer.style.display = 'block';
    
    // Mostra o botão de excluir
    const btnExcluirProjeto = document.getElementById('excluir-projeto');
    if (btnExcluirProjeto) {
      btnExcluirProjeto.style.display = 'block';
    }
    
    // Garante que o editor esteja visível e utilizável
    const editor = document.getElementById('editor');
    if (editor) {
      editor.style.display = 'block';
      editor.style.visibility = 'visible';
      editor.style.height = '100%';
      editor.focus();
    }
  }
  
  // Ajusta a transparência da janela
  static ajustarTransparencia(valor) {
    electron.ajustarTransparencia(valor);
  }

  // Inicializa controle de transparência
  static inicializarControleTransparencia() {
    if (this.elements.transparenciaSlider) {
      this.elements.transparenciaSlider.addEventListener('input', (e) => {
        const valor = parseFloat(e.target.value);
        this.ajustarTransparencia(valor);
      });
      
      // Solicita o valor salvo de transparência
      electron.solicitarTransparencia();
    }
  }

  // Ativa o modo compacto
  static ativarModoCompacto() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.classList.add('modo-compacto');
    
    // Ajusta a altura do editor
    const editorContainer = document.querySelector('#editor-container');
    if (editorContainer) {
      editorContainer.style.height = 'calc(100vh - 60px)';
    }
    
    // Cria botão de saída do modo compacto
    const exitBtn = document.createElement('button');
    exitBtn.id = 'exit-compact-mode';
    exitBtn.className = 'exit-compact-btn';
    exitBtn.innerHTML = '<i class="fas fa-expand"></i>';
    exitBtn.title = 'Sair do modo compacto';
    exitBtn.addEventListener('click', () => {
      DOMManager.desativarModoCompacto();
    });
    
    document.body.appendChild(exitBtn);
  }
  
  // Desativa o modo compacto
  static desativarModoCompacto() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.classList.remove('modo-compacto');
    
    // Restaura a altura do editor
    const editorContainer = document.querySelector('#editor-container');
    if (editorContainer) {
      editorContainer.style.height = 'calc(100vh - 200px)';
    }
    
    // Remove o botão de saída
    const exitBtn = document.getElementById('exit-compact-mode');
    if (exitBtn) {
      exitBtn.remove();
    }
  }
  
  // Alterna entre modo compacto e normal
  static alternarModoCompacto() {
    const container = document.querySelector('.container');
    const avisoSair = document.querySelector('.aviso-sair');
    if (!container) return;
    
    if (container.classList.contains('modo-compacto')) {
      container.classList.remove('modo-compacto');
      if (avisoSair) avisoSair.style.display = 'none';
    } else {
      container.classList.add('modo-compacto');
      if (avisoSair) avisoSair.style.display = 'flex';
    }
  }

  static configurarEditorVisibilidade(editor) {
    if (!editor) return;
    
    try {
    const editorIframe = document.querySelector('.tox-edit-area__iframe');
    const tinymceWrapper = document.querySelector('.tox.tox-tinymce');
      const editorContainer = document.querySelector('#editor-container');
    
    if (tinymceWrapper) {
      tinymceWrapper.style.display = 'block';
      tinymceWrapper.style.height = '100%';
      tinymceWrapper.style.visibility = 'visible';
      tinymceWrapper.style.opacity = '1';
    }
    
    if (editorIframe) {
      editorIframe.style.display = 'block';
      editorIframe.style.visibility = 'visible';
      editorIframe.style.height = '100%';
        editorIframe.style.width = '100%';
        editorIframe.style.border = 'none';
        
        // Garante que o conteúdo seja editável
        const doc = editorIframe.contentDocument || editorIframe.contentWindow.document;
        if (doc && doc.body) {
          doc.body.setAttribute('contenteditable', 'true');
          doc.designMode = 'on';
          doc.body.style.backgroundColor = 'white';
          doc.body.style.color = 'black';
          doc.body.style.padding = '10px';
        }
      }
      
      if (editorContainer) {
        editorContainer.style.display = 'flex';
        editorContainer.style.flexDirection = 'column';
        editorContainer.style.height = 'calc(100vh - 200px)';
    }
    
    editor.execCommand('mceAutoResize');
    editor.focus();
      
      // Força a reinicialização do editor se necessário
      if (!editor.initialized) {
        editor.remove();
        ProjetoManager.reinicializarTinyMCE();
      }
    } catch (erro) {
      console.error('Erro ao configurar visibilidade do editor:', erro);
    }
  }

  static renderizarProjetosRecentes() {
    const listaProjetosRecentes = DOMManager.elements.listaProjetosRecentes;
    
    // Limpa a lista atual
    listaProjetosRecentes.innerHTML = '';
    
    if (this.projetosRecentes.length === 0) {
      const mensagem = document.createElement('li');
      mensagem.textContent = 'Nenhum projeto recente';
      mensagem.className = 'sem-projetos';
      listaProjetosRecentes.appendChild(mensagem);
      return;
    }
    
    // Adiciona cada projeto à lista
    this.projetosRecentes.forEach(projeto => {
      const item = document.createElement('li');
      item.className = 'projeto-recente-item';
      
      // Container para o nome e botão
      const container = document.createElement('div');
      container.className = 'projeto-recente-container';
      
      // Nome do projeto
      const nomeElement = document.createElement('div');
      nomeElement.className = 'projeto-info-item';
      nomeElement.textContent = projeto.nome || 'Projeto sem nome';
      
      // Botão de excluir
      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'btn-excluir-projeto';
      btnExcluir.innerHTML = '<i class="fas fa-times-circle"></i>';
      btnExcluir.title = 'Excluir projeto';
      
      // Adiciona elementos ao container
      container.appendChild(nomeElement);
      container.appendChild(btnExcluir);
      item.appendChild(container);
      
      // Adiciona evento de clique para abrir o projeto
      nomeElement.addEventListener('click', () => {
        this.carregarProjetoRecente(projeto);
      });
      
      // Adiciona evento de clique para excluir o projeto
      btnExcluir.addEventListener('click', (e) => {
        e.stopPropagation();
        this.excluirProjetoRecente(projeto);
      });
      
      listaProjetosRecentes.appendChild(item);
    });
  }
}

class TemaManager {
  static temaAtual = 'sistema';
  static temaSistema = null;

  static inicializar() {
    // Verifica o tema do sistema
    this.verificarTemaSistema();
    
    // Adiciona listener para mudanças no tema do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.verificarTemaSistema();
      if (this.temaAtual === 'sistema') {
        this.aplicarTemaSistema();
      }
    });

    // Inicializa o dropdown de tema
    this.inicializarDropdownTema();
  }

  static verificarTemaSistema() {
    this.temaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }

  static inicializarDropdownTema() {
    const dropdown = document.querySelector('.tema-dropdown');
    const dropdownBtn = dropdown?.querySelector('.tema-dropdown-btn');
    const dropdownContent = dropdown?.querySelector('.tema-dropdown-content');
    
    if (!dropdown || !dropdownBtn || !dropdownContent) return;

    // Carrega o tema salvo
    electron.solicitarTema((temaSalvo) => {
      if (temaSalvo) {
        this.temaAtual = temaSalvo;
        this.atualizarTextoDropdown();
        this.aplicarTema();
      }
    });

    // Controla a exibição do dropdown
    let isOpen = false;

    // Função para abrir o dropdown
    const openDropdown = () => {
      isOpen = true;
      dropdownContent.style.visibility = 'visible';
      dropdownContent.style.opacity = '1';
      dropdownBtn.querySelector('.fa-chevron-down').style.transform = 'rotate(180deg)';
    };

    // Função para fechar o dropdown
    const closeDropdown = () => {
      isOpen = false;
      dropdownContent.style.visibility = 'hidden';
      dropdownContent.style.opacity = '0';
      dropdownBtn.querySelector('.fa-chevron-down').style.transform = 'rotate(0)';
    };

    // Toggle do dropdown ao clicar no botão
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isOpen) {
        openDropdown();
      }
    });

    // Adiciona listeners para os itens do dropdown
    const itensTema = dropdownContent.querySelectorAll('a');
    itensTema.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const novoTema = e.currentTarget.dataset.tema;
        this.temaAtual = novoTema;
        this.atualizarTextoDropdown();
        this.aplicarTema();
        electron.alternarTema(novoTema);
        closeDropdown();
      });
    });
  }

  static atualizarTextoDropdown() {
    const textoDropdown = document.querySelector('.tema-texto');
    if (!textoDropdown) return;

    const textos = {
      'sistema': 'Sistema',
      'claro': 'Claro',
      'escuro': 'Escuro'
    };

    textoDropdown.textContent = textos[this.temaAtual] || textos['sistema'];
  }

  static aplicarTema() {
    // Remove classes de tema existentes
    document.body.classList.remove('tema-claro', 'tema-escuro');
    
    if (this.temaAtual === 'sistema') {
      this.aplicarTemaSistema();
    } else {
      document.body.classList.add(`tema-${this.temaAtual}`);
    }
  }

  static aplicarTemaSistema() {
    document.body.classList.add(`tema-${this.temaSistema}`);
  }
}

class ProjetoManager {
  static projetoAtual = null;
  static projetosRecentes = [];

  constructor() {
    this.editor = document.querySelector('.editor');
    this.avisoSair = document.querySelector('.aviso-sair');
    this.modoCompacto = false;
    
    // Adiciona evento para ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modoCompacto) {
        this.sairModoCompacto();
      }
    });
  }

  static inicializar() {
    electron.solicitarProjetosRecentes();
  }

  static carregarProjeto(projeto) {
    this.projetoAtual = projeto;
    
    // Atualiza a interface
    DOMManager.exibirEditor();
    
    // Atualiza as informações do projeto
    DOMManager.elements.projetoInfo.textContent = `Projeto: ${projeto.nome}`;
    DOMManager.elements.projetoNomeDisplay.textContent = projeto.nome;
    DOMManager.elements.projetoObservacaoDisplay.textContent = projeto.observacao || '(Nenhuma observação)';
    DOMManager.elements.projetoDataCriacao.textContent = this.formatarData(projeto.dataCriacao);
    DOMManager.elements.projetoUltimaModificacao.textContent = this.formatarData(projeto.ultimaModificacao);
    
    // Define o conteúdo do editor
    const editor = document.getElementById('editor');
    if (editor) {
      editor.innerHTML = projeto.conteudo || '';
      editor.focus();
    }
    
    DOMManager.elements.statusBar.textContent = `Projeto carregado: ${projeto.nome}`;
  }

  static salvarProjeto() {
    if (!ProjetoManager.projetoAtual) {
      DOMManager.mostrarNotificacao('Nenhum projeto aberto para salvar');
      return;
    }

    const editor = document.getElementById('editor');
    if (!editor) {
      DOMManager.mostrarNotificacao('Editor não encontrado');
      return;
    }

    const conteudo = editor.innerHTML;
    if (!conteudo) {
      DOMManager.mostrarNotificacao('Nenhum conteúdo para salvar');
      return;
    }

    // Envia o conteúdo diretamente para o processo principal
    electron.enviarConteudoEditor(conteudo);
  }

  static fecharProjeto() {
    electron.fecharProjeto();
    DOMManager.exibirTelaBoasVindas();
  }

  static formatarData(dataString) {
    const data = new Date(dataString);
    return `${data.toLocaleDateString()} ${data.toLocaleTimeString()}`;
  }

  static carregarProjetoRecente(projetoData) {
    try {
      if (!projetoData || !projetoData.caminhoArquivo) {
        DOMManager.mostrarNotificacao('Dados do projeto inválidos', 'error');
        return;
      }

      console.log('Carregando projeto recente:', projetoData);

      // Verifica se o arquivo ainda existe
      electron.verificarArquivo(projetoData.caminhoArquivo, (existe) => {
        if (!existe) {
          DOMManager.mostrarNotificacao('Arquivo do projeto não encontrado', 'error');
          
          // Remover o projeto da lista de recentes
          const projetosRecentesAtualizados = ProjetoManager.projetosRecentes.filter(p => 
            p.caminhoArquivo !== projetoData.caminhoArquivo
          );
          
          ProjetoManager.projetosRecentes = projetosRecentesAtualizados;
          electron.atualizarProjetosRecentes(projetosRecentesAtualizados);
          ProjetoManager.renderizarProjetosRecentes();
          return;
        }
        
        console.log('Solicitando carregamento do projeto:', projetoData.caminhoArquivo);
        electron.carregarProjeto(projetoData.caminhoArquivo);
      });

    } catch (erro) {
      console.error('Erro ao carregar projeto recente:', erro);
      DOMManager.mostrarNotificacao('Erro ao carregar o projeto', 'error');
    }
  }
  
  // Método para excluir um projeto da lista de recentes
  static excluirProjetoRecente(projeto) {
    if (!projeto || !projeto.caminhoArquivo) return;
    
    // Remove o projeto da lista
    ProjetoManager.projetosRecentes = ProjetoManager.projetosRecentes.filter(p => 
      p.caminhoArquivo !== projeto.caminhoArquivo
    );
    
    // Atualiza a lista no processo principal
    electron.atualizarProjetosRecentes(ProjetoManager.projetosRecentes);
    
    // Atualiza a visualização
    ProjetoManager.renderizarProjetosRecentes();
    
    DOMManager.mostrarNotificacao('Projeto removido da lista de recentes');
  }

  entrarModoCompacto() {
    this.modoCompacto = true;
    document.body.classList.add('modo-compacto');
    this.avisoSair.style.display = 'flex';
  }

  sairModoCompacto() {
    this.modoCompacto = false;
    document.body.classList.remove('modo-compacto');
    this.avisoSair.style.display = 'none';
  }

  static renderizarProjetosRecentes() {
    const listaProjetosRecentes = document.getElementById('lista-projetos-recentes');
    if (!listaProjetosRecentes) {
      console.error('Elemento lista-projetos-recentes não encontrado');
      return;
    }
    
    // Limpa a lista atual
    listaProjetosRecentes.innerHTML = '';
    
    if (!this.projetosRecentes || this.projetosRecentes.length === 0) {
      const mensagem = document.createElement('li');
      mensagem.textContent = 'Nenhum projeto recente';
      mensagem.className = 'sem-projetos';
      listaProjetosRecentes.appendChild(mensagem);
      return;
    }
    
    // Adiciona cada projeto à lista
    this.projetosRecentes.forEach(projeto => {
      const item = document.createElement('li');
      item.className = 'projeto-recente-item';
      
      // Container para o nome e botão
      const container = document.createElement('div');
      container.className = 'projeto-recente-container';
      
      // Nome do projeto
      const nomeElement = document.createElement('div');
      nomeElement.className = 'projeto-info-item';
      nomeElement.textContent = projeto.nome || 'Projeto sem nome';
      
      // Botão de excluir
      const btnExcluir = document.createElement('button');
      btnExcluir.className = 'btn-excluir-projeto';
      btnExcluir.innerHTML = '<i class="fas fa-times-circle"></i>';
      btnExcluir.title = 'Excluir projeto';
      
      // Adiciona elementos ao container
      container.appendChild(nomeElement);
      container.appendChild(btnExcluir);
      item.appendChild(container);
      
      // Adiciona evento de clique para abrir o projeto
      nomeElement.addEventListener('click', () => {
        ProjetoManager.carregarProjetoRecente(projeto);
      });
      
      // Adiciona evento de clique para excluir o projeto
      btnExcluir.addEventListener('click', (e) => {
        e.stopPropagation();
        ProjetoManager.excluirProjetoRecente(projeto);
      });
      
      listaProjetosRecentes.appendChild(item);
    });
  }
}

class ModalManager {
  static abrirModalNovoProjeto() {
    // Limpa os campos do formulário
    DOMManager.elements.nomeProjeto.value = '';
    DOMManager.elements.observacaoProjeto.value = '';
    
    // Exibe o modal
    DOMManager.elements.modalNovoProjeto.style.display = 'flex';
    
    // Garante que o foco esteja no primeiro campo após um breve atraso
    setTimeout(() => {
      DOMManager.elements.nomeProjeto.focus();
    }, 100);
  }

  static fecharModalNovoProjeto() {
    DOMManager.elements.modalNovoProjeto.style.display = 'none';
  }

  static criarNovoProjeto() {
    const nome = DOMManager.elements.nomeProjeto.value.trim();
    
    if (!nome) {
      DOMManager.mostrarNotificacao('O nome do projeto é obrigatório', 'error');
      return;
    }
    
    const dados = {
      nome: nome,
      observacao: DOMManager.elements.observacaoProjeto.value.trim()
    };
    
    electron.criarNovoProjeto(dados);
    ModalManager.fecharModalNovoProjeto();
  }
}

class EditorManager {
  constructor() {
    this.editor = null;
    this.toolbar = null;
    this.initialize();
  }

  initialize() {
    // Aguarda o DOM estar completamente carregado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  setupElements() {
    this.editor = document.getElementById('editor');
    this.toolbar = document.querySelector('.editor-toolbar');
    
    if (this.toolbar) {
      this.setupToolbar();
    }
  }

  setupToolbar() {
    if (!this.toolbar) return;
    
    this.toolbar.addEventListener('click', (e) => {
      if (e.target.classList.contains('toolbar-btn')) {
        const command = e.target.dataset.command;
        this.execCommand(command);
      }
    });
  }

  execCommand(command) {
    if (!this.editor) return;
    document.execCommand(command, false, null);
    this.editor.focus();
  }

  getContent() {
    return this.editor ? this.editor.value : '';
  }

  setContent(content) {
    if (this.editor) {
      this.editor.value = content;
    }
  }

  clear() {
    if (this.editor) {
      this.editor.value = '';
    }
  }
}

// Eventos para os elementos da interface
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa gerenciadores
  TemaManager.inicializar();
  ProjetoManager.inicializar();
  DOMManager.inicializarControleTransparencia();
  
  // Garantir que a tela inicial seja exibida corretamente
  DOMManager.exibirTelaBoasVindas();
  
  // Controles da janela
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const closeBtn = document.getElementById('close-btn');
  
  minimizeBtn.addEventListener('click', () => {
    electron.minimizeWindow();
  });
  
  maximizeBtn.addEventListener('click', () => {
    electron.maximizeWindow();
  });
  
  closeBtn.addEventListener('click', () => {
    electron.closeWindow();
  });

  // Redimensionamento da janela
  const resizeHandles = document.querySelectorAll('.resize-handle');
  resizeHandles.forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const direction = handle.classList[1];
      electron.startResize(direction);
    });
  });
  
  // Event listeners para os botões
  DOMManager.elements.btnNovoProjeto.addEventListener('click', ModalManager.abrirModalNovoProjeto);
  DOMManager.elements.btnAbrirProjeto.addEventListener('click', () => electron.abrirProjeto());
  DOMManager.elements.btnSalvar.addEventListener('click', ProjetoManager.salvarProjeto);
  DOMManager.elements.btnModoCompacto.addEventListener('click', DOMManager.alternarModoCompacto);
  DOMManager.elements.btnFecharProjeto.addEventListener('click', ProjetoManager.fecharProjeto);
  DOMManager.elements.btnFecharModal.addEventListener('click', ModalManager.fecharModalNovoProjeto);
  DOMManager.elements.btnCancelarProjeto.addEventListener('click', ModalManager.fecharModalNovoProjeto);
  DOMManager.elements.btnCriarProjeto.addEventListener('click', ModalManager.criarNovoProjeto);
  DOMManager.elements.btnHome.addEventListener('click', () => {
    if (ProjetoManager.projetoAtual) {
      ProjetoManager.fecharProjeto();
    } else {
      DOMManager.exibirTelaBoasVindas();
    }
  });
  
  // Botão de sempre no topo
  const btnSempreTopo = document.getElementById('sempre-topo');
  if (btnSempreTopo) {
    btnSempreTopo.addEventListener('click', () => {
      const estaAtivo = btnSempreTopo.classList.contains('active');
      btnSempreTopo.classList.toggle('active');
      electron.alternarSempreTopo(!estaAtivo);
    });
  }
  
  // Atalhos do teclado
  document.addEventListener('keydown', (event) => {
    // Esc para fechar o modal
    if (event.key === 'Escape' && DOMManager.elements.modalNovoProjeto.style.display === 'flex') {
      ModalManager.fecharModalNovoProjeto();
    }
    
    // Esc para sair do modo compacto
    if (event.key === 'Escape') {
      const container = document.querySelector('.container');
      if (container && container.classList.contains('modo-compacto')) {
        DOMManager.alternarModoCompacto();
      }
    }
    
    // Ctrl+S ou Cmd+S para salvar
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      ProjetoManager.salvarProjeto();
    }
    
    // Ctrl+O ou Cmd+O para abrir
    if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
      event.preventDefault();
      electron.abrirProjeto();
    }
    
    // Ctrl+N ou Cmd+N para novo projeto
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      ModalManager.abrirModalNovoProjeto();
    }
    
    // Ctrl+W ou Cmd+W para fechar projeto
    if ((event.ctrlKey || event.metaKey) && event.key === 'w') {
      event.preventDefault();
      ProjetoManager.fecharProjeto();
    }
  });

  // Botão de excluir projeto
  const btnExcluirProjeto = document.getElementById('excluir-projeto');
  if (btnExcluirProjeto) {
    btnExcluirProjeto.addEventListener('click', () => {
      electron.excluirProjeto();
    });
  }
});

// Eventos para receber mensagens do processo principal
electron.onProjetoCarregado((projeto) => {
  console.log('Projeto recebido no renderer:', projeto);
  
  if (!projeto || typeof projeto !== 'object') {
    console.error('Projeto inválido recebido:', projeto);
    DOMManager.mostrarNotificacao('Erro ao carregar o projeto: dados inválidos', 'error');
    return;
  }

  try {
    ProjetoManager.projetoAtual = projeto;
    
    // Atualiza a interface
    DOMManager.exibirEditor();
    
    // Atualiza as informações do projeto
    DOMManager.elements.projetoInfo.textContent = `Projeto: ${projeto.nome}`;
    DOMManager.elements.projetoNomeDisplay.textContent = projeto.nome;
    DOMManager.elements.projetoObservacaoDisplay.textContent = projeto.observacao || '(Nenhuma observação)';
    DOMManager.elements.projetoDataCriacao.textContent = ProjetoManager.formatarData(projeto.dataCriacao);
    DOMManager.elements.projetoUltimaModificacao.textContent = ProjetoManager.formatarData(projeto.ultimaModificacao);
    
    // Define o conteúdo do editor
    const editor = document.getElementById('editor');
    if (editor) {
      editor.innerHTML = projeto.conteudo || '';
      editor.focus();
    }
    
    DOMManager.elements.statusBar.textContent = `Projeto carregado: ${projeto.nome}`;
    DOMManager.mostrarNotificacao('Projeto carregado com sucesso');
  } catch (erro) {
    console.error('Erro ao processar projeto:', erro);
    DOMManager.mostrarNotificacao('Erro ao processar o projeto', 'error');
  }
});

electron.onProjetoFechado(() => {
  ProjetoManager.projetoAtual = null;
  DOMManager.exibirTelaBoasVindas();
  
  // Limpa o conteúdo do editor
  const editor = document.getElementById('editor');
  if (editor) {
    editor.value = '';
  }
  
  // Solicita a lista atualizada de projetos recentes
  electron.solicitarProjetosRecentes();
  
  DOMManager.mostrarNotificacao('Projeto fechado');
});

electron.onProjetoSalvo((erro) => {
  if (erro) {
    DOMManager.mostrarNotificacao(`Erro ao salvar o projeto: ${erro.message}`, 'error');
    return;
  }

  DOMManager.elements.statusBar.textContent = 'Projeto salvo com sucesso!';
  DOMManager.mostrarNotificacao('Projeto salvo com sucesso!');
  
  // Atualiza a data de última modificação
  if (ProjetoManager.projetoAtual) {
    ProjetoManager.projetoAtual.ultimaModificacao = new Date().toISOString();
  }
});

electron.onProjetosRecentes((projetos) => {
  console.log('Projetos recentes recebidos:', projetos);
  ProjetoManager.projetosRecentes = projetos;
  ProjetoManager.renderizarProjetosRecentes();
});

electron.onProjetoExcluido(() => {
  DOMManager.exibirTelaBoasVindas();
  DOMManager.mostrarNotificacao('Projeto excluído com sucesso');
});

// Solicita configurações iniciais
electron.solicitarTransparencia();
electron.solicitarProjetosRecentes();

// Inicializar o editor após o DOM estar carregado
document.addEventListener('DOMContentLoaded', () => {
  const editorManager = new EditorManager();

  // Limpar o editor quando um novo projeto for criado
  const btnNovoProjeto = document.getElementById('novo-projeto');
  if (btnNovoProjeto) {
    btnNovoProjeto.addEventListener('click', () => {
      editorManager.clear();
    });
  }
});

// Adiciona os event listeners para a barra de ferramentas
document.addEventListener('DOMContentLoaded', () => {
  // Event listeners para a barra de ferramentas
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    toolbar.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;

      if (button.dataset.command === 'formatBlock') {
        document.execCommand('formatBlock', false, button.dataset.value);
      } else if (button.dataset.command) {
        document.execCommand(button.dataset.command, false, null);
      }
    });
  }

  // Atalhos do teclado para formatação
  document.addEventListener('keydown', (event) => {
    // Ctrl+B para negrito
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      document.execCommand('bold', false, null);
    }
    
    // Ctrl+I para itálico
    if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
      event.preventDefault();
      document.execCommand('italic', false, null);
    }
    
    // Ctrl+U para sublinhado
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
      event.preventDefault();
      document.execCommand('underline', false, null);
    }
  });
});

// Mostrar aviso quando a janela perder o foco
window.addEventListener('blur', () => {
  // Removendo a chamada não definida
});

// Eventos para receber mensagens do processo principal
electron.onTemaCarregado((tema) => {
  if (tema) {
    TemaManager.temaAtual = tema;
    TemaManager.aplicarTema();
    TemaManager.atualizarTextoDropdown();
  }
});

// Solicita configurações iniciais ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa os gerenciadores
  TemaManager.inicializar();
  ProjetoManager.inicializar();
  DOMManager.inicializarControleTransparencia();
  
  // Solicita configurações iniciais
  electron.solicitarProjetosRecentes();
}); 