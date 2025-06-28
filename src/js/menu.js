document.addEventListener('DOMContentLoaded', () => {
  const menuLateral = document.querySelector('.menu-lateral');
  const hamburgerBtn = document.querySelector('.hamburger-btn');

  hamburgerBtn.addEventListener('click', () => {
    menuLateral.classList.toggle('menu-aberto');
  });

  // Fechar menu ao clicar fora
  document.addEventListener('click', (event) => {
    if (!menuLateral.contains(event.target) && !hamburgerBtn.contains(event.target)) {
      menuLateral.classList.remove('menu-aberto');
    }
  });
}); 