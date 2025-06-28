import { dialog, shell, app } from 'electron';
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
 * Serviço de Atualização do GhostPad
 * Gerencia verificação, download e instalação de atualizações via GitHub Releases
 */
class UpdateService {
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
    
    // Configurações de rede
    this.timeout = UPDATE_CONFIG.network.timeout;
    this.retries = UPDATE_CONFIG.network.retries;
    this.userAgent = `${UPDATE_CONFIG.network.userAgent}/${this.currentVersion}`;
    
    // URLs da API do GitHub
    this.apiBaseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}`;
    this.releasesUrl = `${this.apiBaseUrl}/releases/latest`;
    
    // Valida configuração na inicialização
    this.isConfigured = validateConfig();
  }

  /**
   * Verifica se há atualizações disponíveis
   * @param {boolean} showDialog - Se deve exibir dialog mesmo quando não há atualização
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
          this.showConfigurationDialog();
        }
        return false;
      }

      // Log de configuração para debug
      console.log(`🔍 Verificando atualizações para: ${this.owner}/${this.repo}`);

      console.log('🔍 Verificando atualizações...');
      
      const release = await this.fetchLatestRelease();
      
      if (!release) {
        if (showDialog) {
          this.showNoUpdateDialog();
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
          await this.showUpdateDialog(release);
        }
        return true;
      } else {
        console.log('✅ Aplicação já está na versão mais recente');
        if (showDialog) {
          this.showNoUpdateDialog();
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
      if (showDialog) {
        this.showErrorDialog(error);
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
   * Exibe dialog perguntando se o usuário quer atualizar
   * @param {Object} release - Dados da release
   */
  async showUpdateDialog(release) {
    const latestVersion = this.cleanVersion(release.tag_name);
    
    const response = await dialog.showMessageBox(null, {
      type: 'info',
      title: 'Atualização Disponível',
      message: `Nova versão do GhostPad disponível!`,
      detail: `Versão atual: ${this.currentVersion}\nNova versão: ${latestVersion}\n\n${release.name}\n\n${release.body || 'Sem descrição disponível.'}`,
      buttons: ['Atualizar Agora', 'Lembrar Mais Tarde', 'Pular Esta Versão'],
      defaultId: 0,
      cancelId: 1,
      icon: path.join(__dirname, '../images/icon.png')
    });

    switch (response.response) {
      case 0: // Atualizar Agora
        await this.startUpdate(release);
        break;
      case 1: // Lembrar Mais Tarde
        console.log('Usuário escolheu atualizar mais tarde');
        break;
      case 2: // Pular Esta Versão
        console.log('Usuário escolheu pular esta versão');
        // Pode implementar lógica para não mostrar esta versão novamente
        break;
    }
  }

  /**
   * Exibe dialog informando que não há atualizações
   */
  showNoUpdateDialog() {
    dialog.showMessageBox(null, {
      type: 'info',
      title: 'Sem Atualizações',
      message: 'Você já está usando a versão mais recente do GhostPad!',
      detail: `Versão atual: ${this.currentVersion}`,
      buttons: ['OK'],
      icon: path.join(__dirname, '../images/icon.png')
    });
  }

  /**
   * Exibe dialog de erro
   * @param {Error} error - Erro ocorrido
   */
  showErrorDialog(error) {
    dialog.showMessageBox(null, {
      type: 'error',
      title: 'Erro na Verificação de Atualização',
      message: 'Não foi possível verificar atualizações.',
      detail: `Erro: ${error.message}\n\nVerifique sua conexão com a internet e tente novamente.`,
      buttons: ['OK'],
      icon: path.join(__dirname, '../images/icon.png')
    });
  }

  /**
   * Exibe dialog informando que o repositório não está configurado
   */
  showConfigurationDialog() {
    dialog.showMessageBox(null, {
      type: 'warning',
      title: 'Configuração Necessária',
      message: 'Sistema de Atualização Não Configurado',
      detail: 'Para habilitar as atualizações automáticas, configure o repositório GitHub:\n\n1. Abra src/js/app-config.js\n2. Localize UPDATE_CONFIG.github\n3. Altere "owner" para seu usuário do GitHub\n4. Altere "repo" para o nome do seu repositório\n\nExemplo:\ngithub: {\n  owner: "meu-usuario",\n  repo: "meu-repositorio",\n  enabled: true\n}',
      buttons: ['OK'],
      icon: path.join(__dirname, '../images/icon.png')
    });
  }

  /**
   * Inicia o processo de atualização
   * @param {Object} release - Dados da release
   */
  async startUpdate(release) {
    try {
      // Busca o asset correto para a plataforma atual
      const asset = this.findAssetForPlatform(release.assets);
      
      if (!asset) {
        throw new Error('Nenhum instalador encontrado para sua plataforma');
      }

      // Exibe progresso do download
      const progressDialog = await this.showDownloadProgress();
      
      try {
        // Baixa o arquivo
        const downloadPath = await this.downloadAsset(asset, (progress) => {
          // Atualiza progresso
          progressDialog.detail = `Baixando: ${Math.round(progress)}%`;
        });

        progressDialog.close?.();

        // Confirma execução do instalador
        const confirmInstall = await dialog.showMessageBox(null, {
          type: 'question',
          title: 'Iniciar Instalação',
          message: 'Download concluído!',
          detail: 'O instalador será executado e o GhostPad será fechado. Deseja continuar?',
          buttons: ['Instalar', 'Cancelar'],
          defaultId: 0,
          cancelId: 1
        });

        if (confirmInstall.response === 0) {
          // Executa o instalador
          await shell.openPath(downloadPath);
          
          // Fecha a aplicação para permitir a instalação
          app.quit();
        }
      } catch (downloadError) {
        progressDialog.close?.();
        throw downloadError;
      }

    } catch (error) {
      console.error('❌ Erro durante atualização:', error);
      
      dialog.showMessageBox(null, {
        type: 'error',
        title: 'Erro na Atualização',
        message: 'Falha ao baixar a atualização.',
        detail: `${error.message}\n\nTente baixar manualmente em: ${release.html_url}`,
        buttons: ['Abrir Página de Releases', 'OK'],
        defaultId: 1
      }).then((result) => {
        if (result.response === 0) {
          shell.openExternal(release.html_url);
        }
      });
    }
  }

  /**
   * Encontra o asset correto para a plataforma atual
   * @param {Array} assets - Lista de assets da release
   * @returns {Object|null} - Asset correspondente ou null
   */
  findAssetForPlatform(assets) {
    const platform = process.platform;
    
    // Usa patterns das configurações centralizadas
    const platformPatterns = UPDATE_CONFIG.assetPatterns[platform] || [];

    for (const pattern of platformPatterns) {
      const asset = assets.find(asset => 
        asset.name.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (asset) {
        return asset;
      }
    }

    return null;
  }

  /**
   * Exibe dialog de progresso do download
   * @returns {Object} - Referência para controle do dialog
   */
  async showDownloadProgress() {
    // Implementação simplificada - em produção pode usar uma biblioteca específica
    return {
      detail: 'Iniciando download...',
      close: () => console.log('Progress dialog closed')
    };
  }

  /**
   * Baixa um asset
   * @param {Object} asset - Asset a ser baixado
   * @param {Function} progressCallback - Callback de progresso
   * @returns {Promise<string>} - Caminho do arquivo baixado
   */
  async downloadAsset(asset, progressCallback) {
    const tempDir = app.getPath('temp');
    const fileName = asset.name;
    const filePath = path.join(tempDir, fileName);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      
      const request = https.get(asset.browser_download_url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (totalSize > 0 && progressCallback) {
            const progress = (downloadedSize / totalSize) * 100;
            progressCallback(progress);
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });

        file.on('error', (error) => {
          fs.unlink(filePath, () => {}); // Remove arquivo parcial
          reject(error);
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Timeout no download'));
      });
    });
  }

  /**
   * Inicia verificação automática periódica
   */
  startAutoCheck() {
    if (this.autoCheckTimer) {
      clearInterval(this.autoCheckTimer);
    }

    this.autoCheckTimer = setInterval(() => {
      this.checkForUpdates(false);
    }, this.checkInterval);
    
    console.log(`🔄 Verificação automática configurada para cada ${Math.round(this.checkInterval / (60 * 60 * 1000))}h`);

    // Verifica imediatamente na primeira execução
    setTimeout(() => {
      this.checkForUpdates(false);
    }, 5000); // Espera 5s após inicialização
  }

  /**
   * Para verificação automática
   */
  stopAutoCheck() {
    if (this.autoCheckTimer) {
      clearInterval(this.autoCheckTimer);
      this.autoCheckTimer = null;
    }
  }

  /**
   * Obtém informações sobre o estado das atualizações
   * @returns {Object} - Estado atual do serviço
   */
  getStatus() {
    return {
      currentVersion: this.currentVersion,
      updateAvailable: this.updateAvailable,
      latestVersion: this.latestRelease ? this.cleanVersion(this.latestRelease.tag_name) : null,
      lastCheck: this.lastCheck,
      autoCheckEnabled: this.autoCheckEnabled
    };
  }

  /**
   * Configura se a verificação automática está habilitada
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

export default UpdateService; 