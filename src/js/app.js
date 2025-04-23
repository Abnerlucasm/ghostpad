// Controle do menu lateral
const hamburgerBtn = document.querySelector('.hamburger-btn');
const menuLateral = document.querySelector('.menu-lateral');

hamburgerBtn.addEventListener('click', () => {
  menuLateral.classList.toggle('menu-aberto');
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
  if (!menuLateral.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    menuLateral.classList.remove('menu-aberto');
  }
}); 