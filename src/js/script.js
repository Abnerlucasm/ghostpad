// Inicializar menu hambúrguer
function inicializarMenuHamburguer() {
  console.log('Inicializando menu hambúrguer...');
  
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const menuLateral = document.querySelector('.menu-lateral');
  
  console.log('Botão hambúrguer:', hamburgerBtn);
  console.log('Menu lateral:', menuLateral);
  
  if (!hamburgerBtn || !menuLateral) {
    console.error('Elementos do menu não encontrados');
    return;
  }

  // Toggle do menu
  hamburgerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Clique no hambúrguer detectado');
    menuLateral.classList.toggle('active');
    console.log('Menu ativo:', menuLateral.classList.contains('active'));
  });

  // Fecha o menu quando clicar fora
  document.addEventListener('click', (e) => {
    if (!menuLateral.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      menuLateral.classList.remove('active');
    }
  });

  // Adiciona scroll ao menu lateral quando necessário
  menuLateral.addEventListener('wheel', (e) => {
    e.stopPropagation();
  });
}

// Toggle switch para destaque (será inicializado com DOM pronto)
function inicializarToggleDestaque() {
  const toggleSwitch = document.querySelector('.toggle-switch');
  const toggleLabel = document.querySelector('.toggle-label');
  
  if (!toggleSwitch || !toggleLabel) return;

  function toggleDestaque() {
    const isActive = toggleSwitch.classList.toggle('active');
    toggleLabel.textContent = isActive ? 'Destaque: Ativo' : 'Destaque: Inativo';
    const editor = document.getElementById('editor');
    if (editor) {
      editor.classList.toggle('destaque-ativo', isActive);
    }
  }

  toggleSwitch.addEventListener('click', toggleDestaque);
  toggleLabel.addEventListener('click', toggleDestaque);
}

// Funcionalidades do menu lateral
function inicializarMenuLateral() {
  console.log('Inicializando menu lateral...');
  
  // Verificar atualizações
  const menuVerificarAtualizacao = document.getElementById('menu-verificar-atualizacoes');
  console.log('Elemento verificar atualização:', menuVerificarAtualizacao);
  
  if (menuVerificarAtualizacao) {
    menuVerificarAtualizacao.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Clique em verificar atualizações detectado');
      
      try {
        console.log('👆 Clique em VERIFICAR ATUALIZAÇÕES detectado');
        
        if (window.electron && window.electron.checkForUpdates) {
          console.log('✅ Chamando checkForUpdates...');
          const result = await window.electron.checkForUpdates(true);
          console.log('📋 Resultado:', result);
          
          // SEMPRE força exibição do modal após verificação
          setTimeout(() => {
            console.log('🔄 Forçando exibição do modal de atualização após verificação...');
            
            // Método 1: Tenta via ModalManager
            if (window.modalManager) {
              try {
                window.modalManager.showNoUpdate('1.0.4');
                console.log('✅ Modal via ModalManager disparado');
              } catch (e) {
                console.error('❌ Erro no ModalManager:', e);
              }
            }
            
            // Método 2: SEMPRE força via CSS direto (backup)
            setTimeout(() => {
              const modal = document.getElementById('modal-no-update');
              if (modal) {
                const versionEl = document.getElementById('no-update-version');
                if (versionEl) versionEl.textContent = '1.0.4';
                
                modal.style.cssText = `
                  display: flex !important;
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                  bottom: 0 !important;
                  z-index: 9999 !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  background-color: rgba(0, 0, 0, 0.5) !important;
                  justify-content: center !important;
                  align-items: center !important;
                `;
                
                console.log('✅ Modal de atualização FORÇADO via CSS!');
              } else {
                console.error('❌ Modal modal-no-update não encontrado!');
              }
            }, 300);
          }, 1000);
          
        } else {
          console.warn('⚠️ window.electron.checkForUpdates não disponível');
          
          // SEMPRE mostra modal de atualização como fallback
          console.log('🔄 FORÇANDO exibição de modal de atualização...');
          console.log('  - modalManager disponível:', !!window.modalManager);
          
          // Tenta primeiro com modalManager
          if (window.modalManager) {
            console.log('✅ Tentando via ModalManager...');
            try {
              window.modalManager.showNoUpdate('1.0.4');
              console.log('✅ Modal chamado via ModalManager');
            } catch (error) {
              console.error('❌ Erro no ModalManager:', error);
            }
          }
          
                     // FORÇA abertura direta SEMPRE
           console.log('🔄 FORÇANDO modal diretamente (fallback)...');
           const modal = document.getElementById('modal-no-update');
           console.log('  - modal-no-update encontrado:', !!modal);
           
           if (modal) {
             // Popula dados
             const versionEl = document.getElementById('no-update-version');
             if (versionEl) {
               versionEl.textContent = '1.0.4';
               console.log('✅ Versão definida no elemento');
             }
             
             // Força abertura do modal IMEDIATAMENTE
             modal.style.cssText = `
               display: flex !important;
               position: fixed !important;
               top: 0 !important;
               left: 0 !important;
               right: 0 !important;
               bottom: 0 !important;
               z-index: 9999 !important;
               visibility: visible !important;
               opacity: 1 !important;
               background-color: rgba(0, 0, 0, 0.5) !important;
               justify-content: center !important;
               align-items: center !important;
             `;
             
             console.log('✅ Modal de atualização FORÇADO a abrir IMEDIATAMENTE!');
           } else {
             console.error('❌ Modal modal-no-update não encontrado no DOM');
             console.log('🔍 Elementos modal disponíveis:', 
               Array.from(document.querySelectorAll('[id*="modal"]')).map(el => el.id)
             );
           }
        }
        
        const menuLateral = document.querySelector('.menu-lateral');
        if (menuLateral) {
          menuLateral.classList.remove('active');
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
        if (window.modalManager) {
          window.modalManager.showError('Erro ao Verificar Atualizações', 'Não foi possível verificar atualizações. Verifique sua conexão com a internet.');
        } else {
          alert('Erro ao verificar atualizações: ' + error.message);
        }
      }
    });
  }

  // Outros itens do menu
  const menuInicio = document.getElementById('menu-inicio');
  if (menuInicio) {
    menuInicio.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Clique em início detectado');
      
      const btnHome = document.getElementById('btn-home');
      if (btnHome) {
        btnHome.click();
      }
      
      const menuLateral = document.querySelector('.menu-lateral');
      if (menuLateral) {
        menuLateral.classList.remove('active');
      }
    });
  }

  const menuConfiguracoes = document.getElementById('menu-configuracoes');
  if (menuConfiguracoes) {
    menuConfiguracoes.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Configurações clicado');
      menuLateral.classList.remove('active');
    });
  }

  const menuSobre = document.getElementById('menu-sobre');
  if (menuSobre) {
    menuSobre.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      
      try {

        
        if (window.modalManager) {
          await window.modalManager.showAbout();
        } else if (window.electron && window.electron.showAbout) {
          await window.electron.showAbout();
        } else {
          alert('Sobre o GhostPad v1.0.4\nEditor de texto seguro e protegido\nDesenvolvido por Abnerlucasm');
        }
      } catch (error) {
        console.error('Erro ao mostrar sobre:', error);
        alert('Erro: ' + error.message);
      }
      
      const menuLateral = document.querySelector('.menu-lateral');
      if (menuLateral) {
        menuLateral.classList.remove('active');
      }
    });
  }
}

// Obter e exibir versão da aplicação
function carregarVersaoApp() {
  console.log('Carregando versão da aplicação...');
  
  if (window.electron && window.electron.getAppVersion) {
    window.electron.getAppVersion().then(version => {
      console.log('Versão obtida:', version);
      const versionElements = document.querySelectorAll('#app-version, #app-version-status');
      versionElements.forEach(el => {
        if (el) {
          el.textContent = version;
          console.log('Versão atualizada no elemento:', el.id);
        }
      });
    }).catch(error => {
      console.error('Erro ao obter versão:', error);
    });
  } else {
    console.error('window.electron.getAppVersion não disponível');
    // Tentar novamente após um pequeno delay
    setTimeout(carregarVersaoApp, 500);
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, inicializando componentes...');
    

    
    inicializarMenuHamburguer();
    inicializarMenuLateral();
    inicializarToggleDestaque();
    carregarVersaoApp();
    
    setTimeout(() => {
      
      
      
             
     }, 500);
  });
  } else {
    // DOM já está pronto
    console.log('DOM já pronto, inicializando componentes...');
    inicializarMenuHamburguer();
    inicializarMenuLateral();
    inicializarToggleDestaque();
    carregarVersaoApp();
  } 