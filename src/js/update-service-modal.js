import { shell, app } from 'electron';
import { compare } from 'semver';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { UPDATE_CONFIG, validateConfig } from './app-config.js';

// Criar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Serviço de Atualização com Modais Customizados
 * Extende o UpdateService original para usar modais em vez de dialogs nativos
 */
class UpdateServiceModal {
  constructor(config = {}) {
    // Usa configurações centralizadas com override opcional
    this.owner = config.owner || UPDATE_CONFIG.github.owner;
    this.repo = config.repo || UPDATE_CONFIG.github.repo;
    this.enabled = config.enabled !== undefined ? config.enabled : UPDATE_CONFIG.github.enabled;
    this.checkInterval = config.checkInterval || UPDATE_CONFIG.intervals.autoCheck;
    
    // Estado interno
    this.currentVersion = app.getVersion();
    this.lastCheck = null;
    this.updateAvailable = false;
    this.latestRelease = null;
    this.autoCheckEnabled = this.enabled;
    this.autoCheckTimer = null;
    
    // Configurações de rede
    this.timeout = UPDATE_CONFIG.network.timeout;
    this.retries = UPDATE_CONFIG.network.retries;
    this.userAgent = `${UPDATE_CONFIG.network.userAgent}/${this.currentVersion}`;
    
    // URLs da API do GitHub
    this.apiBaseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}`;
    this.releasesUrl = `${this.apiBaseUrl}/releases/latest`;
    
    // Valida configuração na inicialização
    this.isConfigured = validateConfig();

    // Referência para a janela principal (será definida externamente)
    this.mainWindow = null;
  }

  /**
   * Define a janela principal para enviar eventos
   */
  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow;
  }

  /**
   * Envia evento para o renderer process
   */
  sendToRenderer(eventName, ...args) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(eventName, ...args);
    }
  }

  /**
   * Verifica se há atualizações disponíveis
   * @param {boolean} showDialog - Se deve exibir modal mesmo quando não há atualização
   * @returns {Promise<boolean>} - true se há atualização disponível
   */
  async checkForUpdates(showDialog = false) {
    try {
      // Verifica se o sistema de atualização está habilitado
      if (!this.enabled) {
        console.log('🔒 Sistema de atualização desabilitado');
        return false;
      }

      // Verifica se o repositório está configurado corretamente
      if (!this.isConfigured) {
        const message = 'Repositório GitHub não configurado. Configure UPDATE_CONFIG em app-config.js';
        console.warn('⚠️', message);
        
        if (showDialog) {
          this.sendToRenderer('show-config-required-modal');
        }
        return false;
      }

      // Log de configuração para debug
      console.log(`🔍 Verificando atualizações para: ${this.owner}/${this.repo}`);

      console.log('🔍 Verificando atualizações...');
      
      const release = await this.fetchLatestRelease();
      
      if (!release) {
        if (showDialog) {
          this.sendToRenderer('show-no-update-modal', this.currentVersion);
        }
        return false;
      }

      this.latestRelease = release;
      const latestVersion = this.cleanVersion(release.tag_name);
      const hasUpdate = this.compareVersions(this.currentVersion, latestVersion);

      this.updateAvailable = hasUpdate;
      this.lastCheck = new Date();

      if (hasUpdate) {
        console.log(`✅ Nova versão disponível: ${latestVersion} (atual: ${this.currentVersion})`);
        if (showDialog || this.autoCheckEnabled) {
          await this.showUpdateModal(release);
        }
        return true;
      } else {
        console.log('✅ Aplicação já está na versão mais recente');
        if (showDialog) {
          this.sendToRenderer('show-no-update-modal', this.currentVersion);
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
      if (showDialog) {
        this.sendToRenderer('show-error-modal', 'Erro ao Verificar Atualizações', error.message, error.stack);
      }
      return false;
    }
  }

  /**
   * Busca a última release do GitHub
   * @returns {Promise<Object|null>} - Dados da release ou null em caso de erro
   */
  async fetchLatestRelease() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/${this.owner}/${this.repo}/releases/latest`,
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        // Rate limiting check
        if (res.statusCode === 403) {
          const resetTime = res.headers['x-ratelimit-reset'];
          const error = new Error(`Rate limit atingido. Reset em: ${new Date(resetTime * 1000)}`);
          reject(error);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            resolve(release);
          } catch (error) {
            reject(new Error('Erro ao parsear resposta da API do GitHub'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Erro de conexão: ${error.message}`));
      });

      req.setTimeout(this.timeout, () => {
        req.destroy();
        reject(new Error('Timeout na requisição'));
      });

      req.end();
    });
  }

  /**
   * Limpa a versão removendo prefixos como 'v'
   * @param {string} version - Versão original
   * @returns {string} - Versão limpa
   */
  cleanVersion(version) {
    return version.replace(/^v/, '');
  }

  /**
   * Compara duas versões usando semver
   * @param {string} current - Versão atual
   * @param {string} latest - Versão mais recente
   * @returns {boolean} - true se latest > current
   */
  compareVersions(current, latest) {
    try {
      return compare(latest, current) > 0;
    } catch (error) {
      console.warn('Erro ao comparar versões, usando comparação simples:', error);
      return latest !== current;
    }
  }

  /**
   * Exibe modal perguntando se o usuário quer atualizar
   * @param {Object} release - Dados da release
   */
  async showUpdateModal(release) {
    const latestVersion = this.cleanVersion(release.tag_name);
    const releaseNotes = release.body || 'Confira as novidades na nova versão.';
    
    this.sendToRenderer('show-update-available-modal', {
      currentVersion: this.currentVersion,
      newVersion: latestVersion,
      releaseNotes: releaseNotes,
      release: release
    });
  }

  /**
   * Inicia o processo de atualização
   * @param {Object} release - Dados da release
   */
  async startUpdate(release) {
    try {
      console.log('🚀 Iniciando processo de atualização...');
      
      this.sendToRenderer('show-download-progress-modal');
      
      // Encontra o asset correto para a plataforma
      const asset = this.findAssetForPlatform(release.assets);
      
      if (!asset) {
        throw new Error('Não foi encontrado um instalador compatível com esta plataforma');
      }

      console.log(`📦 Baixando: ${asset.name} (${(asset.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Baixa o arquivo
      const downloadPath = await this.downloadAsset(asset, (progress) => {
        this.sendToRenderer('update-download-progress', progress);
      });

      console.log(`✅ Download concluído: ${downloadPath}`);
      
      // Inicia o instalador
      console.log('🔄 Iniciando instalador...');
      await shell.openPath(downloadPath);
      
      // Fecha a aplicação para permitir a atualização
      setTimeout(() => {
        app.quit();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro durante a atualização:', error);
      this.sendToRenderer('show-error-modal', 'Erro na Atualização', error.message, error.stack);
    }
  }

  /**
   * Encontra o asset correto para a plataforma atual
   * @param {Array} assets - Lista de assets da release
   * @returns {Object|null} - Asset encontrado ou null
   */
  findAssetForPlatform(assets) {
    const platform = process.platform;
    const arch = process.arch;
    
    // Padrões de nomes de arquivo por plataforma
    const patterns = {
      'win32': /\.(exe|msi)$/i,
      'darwin': /\.(dmg|pkg)$/i,
      'linux': /\.(AppImage|deb|rpm|tar\.gz)$/i
    };
    
    const pattern = patterns[platform];
    if (!pattern) {
      console.warn(`Plataforma não suportada: ${platform}`);
      return null;
    }
    
    // Busca por assets que correspondam ao padrão da plataforma
    const compatibleAssets = assets.filter(asset => 
      pattern.test(asset.name) && asset.name.toLowerCase().includes(arch)
    );
    
    // Se não encontrou assets específicos da arquitetura, tenta sem filtro de arquitetura
    if (compatibleAssets.length === 0) {
      return assets.find(asset => pattern.test(asset.name));
    }
    
    return compatibleAssets[0];
  }

  /**
   * Baixa um asset da release
   * @param {Object} asset - Asset para baixar
   * @param {Function} progressCallback - Callback para atualizar progresso
   * @returns {Promise<string>} - Caminho do arquivo baixado
   */
  async downloadAsset(asset, progressCallback) {
    const tempDir = app.getPath('temp');
    const downloadPath = path.join(tempDir, asset.name);
    
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(downloadPath);
      
      https.get(asset.browser_download_url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        
        const totalSize = parseInt(response.headers['content-length'] || '0', 10);
        let downloadedSize = 0;
        let startTime = Date.now();
        
        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          
          if (progressCallback && totalSize > 0) {
            const percentage = (downloadedSize / totalSize) * 100;
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = downloadedSize / elapsed;
            const remaining = (totalSize - downloadedSize) / speed;
            
            progressCallback({
              percentage: percentage,
              downloadedSize: downloadedSize,
              totalSize: totalSize,
              speed: this.formatBytes(speed) + '/s',
              eta: this.formatTime(remaining),
              status: `Baixando ${asset.name}...`
            });
          }
        });
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve(downloadPath);
        });
        
        file.on('error', (error) => {
          fs.unlink(downloadPath, () => {}); // Remove arquivo parcial
          reject(error);
        });
        
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Formata bytes para uma string legível
   * @param {number} bytes - Bytes para formatar
   * @returns {string} - String formatada
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formata tempo em segundos para uma string legível
   * @param {number} seconds - Segundos para formatar
   * @returns {string} - String formatada
   */
  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return 'Calculando...';
    
    if (seconds < 60) {
      return Math.round(seconds) + 's';
    } else if (seconds < 3600) {
      return Math.round(seconds / 60) + 'm';
    } else {
      return Math.round(seconds / 3600) + 'h';
    }
  }

  /**
   * Inicia verificação automática de atualizações
   */
  startAutoCheck() {
    if (!this.enabled || !this.isConfigured) {
      console.log('🔒 Verificação automática desabilitada');
      return;
    }

    // Para qualquer timer existente
    this.stopAutoCheck();
    
    console.log(`⏰ Verificação automática configurada para cada ${this.checkInterval / (1000 * 60 * 60)}h`);
    
    // Configura novo timer
    this.autoCheckTimer = setInterval(() => {
      console.log('🕐 Executando verificação automática...');
      this.checkForUpdates(false); // false = não mostra dialog se não há atualização
    }, this.checkInterval);
  }

  /**
   * Para a verificação automática
   */
  stopAutoCheck() {
    if (this.autoCheckTimer) {
      clearInterval(this.autoCheckTimer);
      this.autoCheckTimer = null;
      console.log('⏹️ Verificação automática interrompida');
    }
  }

  /**
   * Retorna o status atual do serviço
   * @returns {Object} - Status do serviço
   */
  getStatus() {
    return {
      enabled: this.enabled,
      configured: this.isConfigured,
      currentVersion: this.currentVersion,
      updateAvailable: this.updateAvailable,
      latestVersion: this.latestRelease ? this.cleanVersion(this.latestRelease.tag_name) : null,
      lastCheck: this.lastCheck,
      autoCheckEnabled: this.autoCheckEnabled,
      owner: this.owner,
      repo: this.repo
    };
  }

  /**
   * Configura verificação automática
   * @param {boolean} enabled - Se deve habilitar verificação automática
   */
  setAutoCheck(enabled) {
    this.autoCheckEnabled = enabled;
    
    if (enabled) {
      this.startAutoCheck();
    } else {
      this.stopAutoCheck();
    }
  }
}

export default UpdateServiceModal; 