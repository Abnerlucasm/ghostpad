// Sistema de fechamento robusto para modais
window.fecharModalAtual = function() {
  const modals = [
    'modal-sobre',
    'modal-no-update', 
    'modal-update-available',
    'modal-error',
    'modal-config',
    'modal-confirm',
    'modal-download-progress'
  ];
  
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal && (modal.style.display === 'flex' || getComputedStyle(modal).display !== 'none')) {
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      modal.style.opacity = '0';
      modal.setAttribute('aria-hidden', 'true');
    }
  });
};

// Event listeners para fechamento de modais
document.addEventListener('DOMContentLoaded', () => {
  // Event listener universal para cliques
  document.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.hasAttribute('data-modal-close') ||
        target.classList.contains('close-button') ||
        target.textContent.trim() === '×' ||
        target.textContent.trim() === 'OK' ||
        target.textContent.trim() === 'Cancelar' ||
        target.classList.contains('modal-overlay')) {
      
      e.preventDefault();
      e.stopPropagation();
      window.fecharModalAtual();
    }
  });
  
  // ESC para fechar modais
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.fecharModalAtual();
    }
  });
}); 