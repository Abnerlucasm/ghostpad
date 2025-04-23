// Toggle switch para destaque
const toggleSwitch = document.querySelector('.toggle-switch');
const toggleLabel = document.querySelector('.toggle-label');

function toggleDestaque() {
  const isActive = toggleSwitch.classList.toggle('active');
  toggleLabel.textContent = isActive ? 'Destaque: Ativo' : 'Destaque: Inativo';
  // Adiciona ou remove a classe de destaque no editor
  editor.classList.toggle('destaque-ativo', isActive);
}

// Adiciona evento de clique tanto no switch quanto no label
toggleSwitch.addEventListener('click', toggleDestaque);
toggleLabel.addEventListener('click', toggleDestaque);

// Menu hamburguer
const hamburgerBtn = document.querySelector('.hamburger-btn');
const menuLateral = document.querySelector('.menu-lateral');

hamburgerBtn.addEventListener('click', () => {
  menuLateral.classList.toggle('active');
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