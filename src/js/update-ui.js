/**
 * Módulo de Interface de Atualização para o GhostPad
 * Gerencia notificações e controles de atualização na interface do usuário
 */
class UpdateUI {
  constructor() {
    this.updateNotification = null;
    this.updateAvailable = false;
    this.currentStatus = null;
    this.checkInterval = null;

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Inicializa o módulo de UI de atualização
   */
  async init() {
    try {
      // Verifica se o electron está disponível
      if (!window.electron || !window.electron.getUpdateStatus) {
        console.warn('APIs de atualização não estão disponíveis');
        return;
      }

      // Carrega o status inicial
      await this.loadCurrentStatus();

      // Configura verificação periódica de status (a cada 5 minutos)
      this.checkInterval = setInterval(() => {
        this.checkUpdateStatus();
      }, 5 * 60 * 1000);

      // Verifica status inicial
      this.checkUpdateStatus();

      console.log('✅ UpdateUI inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar UpdateUI:', error);
    }
  }

  /**
   * Carrega o status atual das atualizações
   */
  async loadCurrentStatus() {
    try {
      const response = await window.electron.getUpdateStatus();
      if (response.success) {
        this.currentStatus = response.status;
        this.updateAvailable = response.status.updateAvailable;
      }
    } catch (error) {
      console.error('Erro ao carregar status de atualização:', error);
    }
  }

  /**
   * Verifica periodicamente se há atualizações disponíveis
   */
  async checkUpdateStatus() {
    try {
      await this.loadCurrentStatus();
      
      if (this.updateAvailable && !this.updateNotification) {
        this.showUpdateNotification();
      } else if (!this.updateAvailable && this.updateNotification) {
        this.hideUpdateNotification();
      }
    } catch (error) {
      console.error('Erro ao verificar status de atualização:', error);
    }
  }

  /**
   * Exibe notificação de atualização disponível
   */
  showUpdateNotification() {
    if (this.updateNotification) {
      return; // Já está sendo exibida
    }

    const notification = this.createUpdateNotification();
    document.body.appendChild(notification);
    this.updateNotification = notification;

    // Animação de entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    console.log('📢 Notificação de atualização exibida');
  }

  /**
   * Cria o elemento de notificação de atualização
   */
  createUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <div class="update-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9L17 14.74L18.18 21.02L12 17.77L5.82 21.02L7 14.74L2 9L8.91 8.26L12 2Z" 
                  fill="currentColor"/>
          </svg>
        </div>
        <div class="update-text">
          <h4>Atualização Disponível</h4>
          <p>Nova versão do GhostPad está disponível: <strong>v${this.currentStatus?.latestVersion || 'N/A'}</strong></p>
        </div>
        <div class="update-actions">
          <button class="btn-update-now" onclick="updateUI.updateNow()">
            Atualizar Agora
          </button>
          <button class="btn-update-later" onclick="updateUI.updateLater()">
            Mais Tarde
          </button>
          <button class="btn-update-close" onclick="updateUI.hideUpdateNotification()">
            ×
          </button>
        </div>
      </div>
    `;

    return notification;
  }

  /**
   * Esconde a notificação de atualização
   */
  hideUpdateNotification() {
    if (!this.updateNotification) {
      return;
    }

    this.updateNotification.classList.remove('show');
    
    setTimeout(() => {
      if (this.updateNotification && this.updateNotification.parentNode) {
        this.updateNotification.parentNode.removeChild(this.updateNotification);
      }
      this.updateNotification = null;
    }, 300);

    console.log('🔕 Notificação de atualização ocultada');
  }

  /**
   * Inicia o processo de atualização imediatamente
   */
  async updateNow() {
    try {
      this.hideUpdateNotification();
      
      // Mostra indicador de loading
      this.showUpdateProgress('Iniciando atualização...');

      // Chama o processo de atualização
      const response = await window.electron.checkForUpdates(true);
      
      if (!response.success) {
        this.hideUpdateProgress();
        this.showUpdateError(response.error);
      }
    } catch (error) {
      console.error('Erro ao iniciar atualização:', error);
      this.hideUpdateProgress();
      this.showUpdateError(error.message);
    }
  }

  /**
   * Adia a atualização para mais tarde
   */
  updateLater() {
    this.hideUpdateNotification();
    
    // Mostra novamente em 1 hora
    setTimeout(() => {
      this.checkUpdateStatus();
    }, 60 * 60 * 1000);

    console.log('⏰ Atualização adiada para mais tarde');
  }

  /**
   * Mostra progresso da atualização
   */
  showUpdateProgress(message) {
    let progressDiv = document.querySelector('.update-progress');
    
    if (!progressDiv) {
      progressDiv = document.createElement('div');
      progressDiv.className = 'update-progress';
      document.body.appendChild(progressDiv);
    }

    progressDiv.innerHTML = `
      <div class="update-progress-content">
        <div class="update-spinner"></div>
        <p>${message}</p>
      </div>
    `;

    progressDiv.classList.add('show');
  }

  /**
   * Esconde progresso da atualização
   */
  hideUpdateProgress() {
    const progressDiv = document.querySelector('.update-progress');
    if (progressDiv) {
      progressDiv.classList.remove('show');
      setTimeout(() => {
        if (progressDiv.parentNode) {
          progressDiv.parentNode.removeChild(progressDiv);
        }
      }, 300);
    }
  }

  /**
   * Mostra erro de atualização
   */
  showUpdateError(errorMessage) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'update-error';
    errorDiv.innerHTML = `
      <div class="update-error-content">
        <div class="error-icon">⚠️</div>
        <h4>Erro na Atualização</h4>
        <p>${errorMessage}</p>
        <button onclick="this.parentNode.parentNode.remove()">OK</button>
      </div>
    `;

    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.classList.add('show');
    }, 100);

    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  /**
   * Verifica atualizações manualmente (acionado pelo usuário)
   */
  async checkForUpdatesManually() {
    try {
      this.showUpdateProgress('Verificando atualizações...');
      
      const response = await window.electron.checkForUpdates(true);
      
      this.hideUpdateProgress();
      
      if (response.success) {
        await this.loadCurrentStatus();
        if (!this.updateAvailable) {
          this.showNoUpdateMessage();
        }
      } else {
        this.showUpdateError(response.error);
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações manualmente:', error);
      this.hideUpdateProgress();
      this.showUpdateError(error.message);
    }
  }

  /**
   * Mostra mensagem de que não há atualizações
   */
  showNoUpdateMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'update-message';
    messageDiv.innerHTML = `
      <div class="update-message-content">
        <div class="success-icon">✅</div>
        <h4>Sem Atualizações</h4>
        <p>Você já está usando a versão mais recente do GhostPad!</p>
        <button onclick="this.parentNode.parentNode.remove()">OK</button>
      </div>
    `;

    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.classList.add('show');
    }, 100);

    // Remove automaticamente após 3 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  }

  /**
   * Obtém informações sobre atualizações para exibição
   */
  async getUpdateInfo() {
    try {
      const response = await window.electron.getUpdateStatus();
      if (response.success) {
        return response.status;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter informações de atualização:', error);
      return null;
    }
  }

  /**
   * Configura verificação automática
   */
  async setAutoUpdateCheck(enabled) {
    try {
      const response = await window.electron.setAutoUpdateCheck(enabled);
      if (response.success) {
        console.log(`Verificação automática ${enabled ? 'habilitada' : 'desabilitada'}`);
        return true;
      } else {
        console.error('Erro ao configurar verificação automática:', response.error);
        return false;
      }
    } catch (error) {
      console.error('Erro ao configurar verificação automática:', error);
      return false;
    }
  }

  /**
   * Limpa recursos quando necessário
   */
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.hideUpdateNotification();
    this.hideUpdateProgress();

    console.log('🧹 UpdateUI destruído');
  }
}

// Cria instância global
window.updateUI = new UpdateUI();

// Exporta para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UpdateUI;
} 