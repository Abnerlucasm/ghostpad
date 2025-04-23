// Função para inserir um bloco de código
function insertCodeBlock(language) {
  const editor = document.getElementById('editor');
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  
  // Cria o elemento pre com a classe da linguagem
  const pre = document.createElement('pre');
  pre.className = `language-${language} line-numbers`;
  
  // Cria o elemento code
  const code = document.createElement('code');
  code.className = `language-${language}`;
  code.contentEditable = true;
  
  // Adiciona o code dentro do pre
  pre.appendChild(code);
  
  // Insere o bloco de código no editor
  range.insertNode(pre);
  
  // Move o cursor para dentro do bloco de código
  const newRange = document.createRange();
  newRange.selectNodeContents(code);
  selection.removeAllRanges();
  selection.addRange(newRange);
  
  // Aplica o highlight do Prism.js
  Prism.highlightElement(code);
  
  // Adiciona os números de linha
  Prism.plugins.lineNumbers.highlightElement(pre);
}

// Adiciona o evento de clique para o botão de inserir código
document.addEventListener('DOMContentLoaded', () => {
  const codeButtons = document.querySelectorAll('[data-command="insertCode"]');
  
  codeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const language = button.getAttribute('data-value');
      insertCodeBlock(language);
    });
  });
});

// Atualiza o highlight quando o conteúdo do bloco de código muda
document.addEventListener('input', (e) => {
  if (e.target.tagName === 'CODE') {
    Prism.highlightElement(e.target);
  }
}); 