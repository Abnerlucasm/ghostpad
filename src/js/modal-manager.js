/**
 * Sistema de Modais Customizados para GhostPad
 * Substitui os dialogs nativos mantendo o conceito "ghost"
 */
class ModalManager {
  constructor() {
    this.modals = {
      novoProjeto: document.getElementById('modal-novo-projeto'),
      sobre: document.getElementById('modal-sobre'),
      updateAvailable: document.getElementById('modal-update-available'),
      downloadProgress: document.getElementById('modal-download-progress'),
      noUpdate: document.getElementById('modal-no-update'),
      error: document.getElementById('modal-error'),
      config: document.getElementById('modal-config'),
      confirm: document.getElementById('modal-confirm')
    };

    this.confirmCallback = null;
    this.downloadCallback = null;
    this.initializeEventListeners();
  }

  /**
   * Inicializa os event listeners para todos os modais
   */
  initializeEventListeners() {
    const self = this;
    
    // Adiciona listeners nos botões de fechar
    const closeButtons = document.querySelectorAll('[data-modal-close], .close-button');
    
    closeButtons.forEach((button) => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.closeCurrentModal();
      });
    });

    // Event listener para overlay
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeCurrentModal();
      }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCurrentModal();
      }
    });

    this.setupSpecificListeners();
  }

  /**
   * Configura listeners específicos para cada modal
   */
  setupSpecificListeners() {
    // Modal de novo projeto
    const btnFecharModal = document.getElementById('fechar-modal');
    const btnCancelarProjeto = document.getElementById('cancelar-projeto');
    const btnCriarProjeto = document.getElementById('criar-projeto');

    if (btnFecharModal) btnFecharModal.addEventListener('click', () => this.closeModal('novoProjeto'));
    if (btnCancelarProjeto) btnCancelarProjeto.addEventListener('click', () => this.closeModal('novoProjeto'));
    if (btnCriarProjeto) btnCriarProjeto.addEventListener('click', () => this.criarNovoProjeto());

    // Modal de atualização
    const btnDownloadUpdate = document.getElementById('btn-download-update');
    if (btnDownloadUpdate) {
      btnDownloadUpdate.addEventListener('click', () => {
        if (this.downloadCallback) {
          this.downloadCallback();
        }
        this.closeModal('updateAvailable');
      });
    }

    // Modal de erro - mostrar detalhes
    const btnShowErrorDetails = document.getElementById('btn-show-error-details');
    if (btnShowErrorDetails) {
      btnShowErrorDetails.addEventListener('click', () => {
        const errorDetails = document.getElementById('error-details');
        if (errorDetails) {
          const isVisible = errorDetails.style.display !== 'none';
          errorDetails.style.display = isVisible ? 'none' : 'block';
          btnShowErrorDetails.textContent = isVisible ? 'Mostrar Detalhes' : 'Ocultar Detalhes';
        }
      });
    }

    // Modal de confirmação
    const confirmOk = document.getElementById('confirm-ok');
    const confirmCancel = document.getElementById('confirm-cancel');

    if (confirmOk) {
      confirmOk.addEventListener('click', () => {
        if (this.confirmCallback) {
          this.confirmCallback(true);
        }
        this.closeModal('confirm');
      });
    }

    if (confirmCancel) {
      confirmCancel.addEventListener('click', () => {
        if (this.confirmCallback) {
          this.confirmCallback(false);
        }
        this.closeModal('confirm');
      });
    }
  }

  /**
   * Abre um modal específico
   */
  openModal(modalName) {
    const modal = this.modals[modalName];
    
    if (modal) {
      modal.style.display = 'flex';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.right = '0';
      modal.style.bottom = '0';
      modal.style.zIndex = '9999';
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      modal.setAttribute('aria-hidden', 'false');
      
      // Foca no primeiro input se existir
      const firstInput = modal.querySelector('input, button');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  /**
   * Fecha um modal específico
   */
  closeModal(modalName) {
    const modal = this.modals[modalName];
    if (modal) {
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      modal.style.opacity = '0';
      modal.setAttribute('aria-hidden', 'true');
      
      // Limpa callbacks
      if (modalName === 'confirm') {
        this.confirmCallback = null;
      }
      if (modalName === 'updateAvailable') {
        this.downloadCallback = null;
      }
    }
  }

  /**
   * Fecha o modal atualmente aberto
   */
  closeCurrentModal() {
    Object.entries(this.modals).forEach(([name, modal]) => {
      if (modal && (modal.style.display === 'flex' || getComputedStyle(modal).display !== 'none')) {
        this.closeModal(name);
      }
    });
  }

  /**
   * Modal Sobre - substitui dialog nativo
   */
  async showAbout() {
    try {
      // Valores padrão
      let version = '1.0.4';
      let appInfo = {
        name: 'GhostPad',
        description: 'Editor de texto seguro e protegido',
        author: 'Abnerlucasm',
        copyright: '© 2024 Abnerlucasm',
        website: 'https://github.com/Abnerlucasm/ghostpad'
      };
      
      // Tenta buscar dados do Electron
      if (window.electronAPI) {
        try {
          version = await window.electronAPI.getAppVersion();
          appInfo = await window.electronAPI.getAppInfo();
        } catch (e) {
          console.warn('Erro ao buscar dados via electronAPI:', e);
        }
      } else if (window.electron) {
        try {
          version = await window.electron.getAppVersion();
          appInfo = await window.electron.getAppInfo();
        } catch (e) {
          console.warn('Erro ao buscar dados via electron:', e);
        }
      }

      // Popula os dados
      document.getElementById('about-version').textContent = version || '1.0.4';
      document.getElementById('about-app-name').textContent = appInfo.name || 'GhostPad';
      document.getElementById('about-description').textContent = appInfo.description || 'Editor de texto seguro e protegido';
      document.getElementById('about-author').textContent = appInfo.author || 'Abnerlucasm';
      document.getElementById('about-copyright').textContent = appInfo.copyright || '© 2024 Abnerlucasm';
      
      const websiteLink = document.getElementById('about-website');
      websiteLink.textContent = appInfo.website || 'https://github.com/Abnerlucasm/ghostpad';
      websiteLink.href = appInfo.website || 'https://github.com/Abnerlucasm/ghostpad';

      this.openModal('sobre');
    } catch (error) {
      console.error('Erro ao buscar informações da aplicação:', error);
      this.showError('Erro ao Carregar Informações', 'Não foi possível carregar as informações da aplicação.');
    }
  }

  /**
   * Modal de Atualização Disponível
   */
  showUpdateAvailable(currentVersion, newVersion, releaseNotes, downloadCallback) {
    document.getElementById('update-current-version').textContent = currentVersion;
    document.getElementById('update-new-version').textContent = newVersion;
    document.getElementById('update-release-notes').textContent = releaseNotes || 'Confira as novidades na nova versão.';
    
    this.downloadCallback = downloadCallback;
    this.openModal('updateAvailable');
  }

  /**
   * Modal de Progresso de Download
   */
  showDownloadProgress() {
    this.openModal('downloadProgress');
    this.updateDownloadProgress(0, 'Iniciando download...');
  }

  /**
   * Atualiza o progresso do download
   */
  updateDownloadProgress(percentage, status, speed, eta) {
    const progressFill = document.getElementById('download-progress-fill');
    const progressText = document.getElementById('download-progress-text');
    const downloadStatus = document.getElementById('download-status');
    const downloadSpeed = document.getElementById('download-speed');
    const downloadEta = document.getElementById('download-eta');

    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
    if (downloadStatus) downloadStatus.textContent = status;
    if (downloadSpeed && speed) downloadSpeed.textContent = speed;
    if (downloadEta && eta) downloadEta.textContent = `ETA: ${eta}`;
  }

  /**
   * Modal Sem Atualização
   */
  showNoUpdate(currentVersion) {
    const versionElement = document.getElementById('no-update-version');
    if (versionElement) {
      versionElement.textContent = currentVersion;
    }
    
    this.openModal('noUpdate');
  }

  /**
   * Modal de Erro
   */
  showError(title, message, details) {
    document.getElementById('error-title').textContent = title;
    document.getElementById('error-message').textContent = message;
    
    const errorDetails = document.getElementById('error-details');
    const errorStack = document.getElementById('error-stack');
    const btnShowDetails = document.getElementById('btn-show-error-details');

    if (details) {
      errorStack.textContent = details;
      errorDetails.style.display = 'none';
      btnShowDetails.style.display = 'inline-block';
      btnShowDetails.textContent = 'Mostrar Detalhes';
    } else {
      btnShowDetails.style.display = 'none';
    }

    this.openModal('error');
  }

  /**
   * Modal de Configuração Necessária
   */
  showConfigRequired() {
    this.openModal('config');
  }

  /**
   * Modal de Confirmação
   */
  showConfirm(title, message, details, callback) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const confirmDetailsElement = document.getElementById('confirm-details');
    if (details) {
      confirmDetailsElement.textContent = details;
      confirmDetailsElement.style.display = 'block';
    } else {
      confirmDetailsElement.style.display = 'none';
    }

    this.confirmCallback = callback;
    this.openModal('confirm');
  }

  /**
   * Abre modal de novo projeto
   */
  abrirModalNovoProjeto() {
    // Limpa o formulário
    const form = document.getElementById('form-novo-projeto');
    if (form) form.reset();
    
    this.openModal('novoProjeto');
  }

  /**
   * Cria novo projeto
   */
  async criarNovoProjeto() {
    const nomeInput = document.getElementById('nome-projeto');
    const observacaoInput = document.getElementById('observacao-projeto');

    if (!nomeInput || !nomeInput.value.trim()) {
      this.showError('Campo Obrigatório', 'Por favor, insira um nome para o projeto.');
      return;
    }

    const dadosProjeto = {
      nome: nomeInput.value.trim(),
      observacao: observacaoInput ? observacaoInput.value.trim() : '',
      dataCriacao: new Date().toISOString(),
      ultimaModificacao: new Date().toISOString(),
      conteudo: ''
    };

    try {
      // Envia dados para o processo principal
      if (window.electronAPI && window.electronAPI.criarNovoProjetoModal) {
        await window.electronAPI.criarNovoProjetoModal(dadosProjeto);
      } else if (window.electron && window.electron.criarNovoProjeto) {
        // Fallback para API antiga
        window.electron.criarNovoProjeto(dadosProjeto);
      }
      this.closeModal('novoProjeto');
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      this.showError('Erro ao Criar Projeto', 'Não foi possível criar o projeto. Tente novamente.');
    }
  }
}

// Variável global para o modal manager
let modalManager = null;

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎭 DOM Carregado - Inicializando sistema de modais...');
  
  // Verifica se os elementos existem
  const modalSobre = document.getElementById('modal-sobre');
  console.log('🔍 Modal sobre encontrado:', !!modalSobre);
  
  try {
    modalManager = new ModalManager();
    
    // Torna o modalManager disponível globalmente
    window.modalManager = modalManager;
    console.log('✅ Sistema de modais inicializado:', !!window.modalManager);
    
    // Teste simples - adiciona um método de teste
    window.testModal = () => {
      console.log('🧪 Testando modal...');
      if (modalSobre) {
        modalSobre.style.display = 'flex';
        console.log('✅ Modal sobre aberto manualmente');
      } else {
        console.error('❌ Modal sobre não encontrado');
      }
    };
    
    console.log('🧪 Digite window.testModal() no console para testar');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar ModalManager:', error);
  }

  // Conecta eventos do main process com o sistema de modais
  if (window.electronAPI) {
    // Evento para mostrar modal sobre
    window.electronAPI.onShowAboutModal(() => {
      if (modalManager) {
        modalManager.showAbout();
      }
    });

    // Eventos para o sistema de atualização
    window.electron.on?.('show-config-required-modal', () => {
      if (modalManager) {
        modalManager.showConfigRequired();
      }
    });

    window.electron.on?.('show-no-update-modal', (currentVersion) => {
      if (modalManager) {
        modalManager.showNoUpdate(currentVersion);
      }
    });

    window.electron.on?.('show-update-available-modal', (updateData) => {
      if (modalManager) {
        modalManager.showUpdateAvailable(
          updateData.currentVersion,
          updateData.newVersion,
          updateData.releaseNotes,
          () => {
            // Callback para iniciar download
            if (window.electron.startUpdate) {
              window.electron.startUpdate(updateData.release);
            }
          }
        );
      }
    });

    window.electron.on?.('show-download-progress-modal', () => {
      if (modalManager) {
        modalManager.showDownloadProgress();
      }
    });

    window.electron.on?.('update-download-progress', (progress) => {
      if (modalManager) {
        modalManager.updateDownloadProgress(
          progress.percentage,
          progress.status,
          progress.speed,
          progress.eta
        );
      }
    });

    window.electron.on?.('show-error-modal', (title, message, details) => {
      if (modalManager) {
        modalManager.showError(title, message, details);
      }
    });
  }
});

export default ModalManager; 