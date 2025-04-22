const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando otimizações pré-build...');

// Lista de arquivos e pastas para remover das dependências
const pathsToClean = [
  // Arquivos desnecessários
  'node_modules/**/*.md',
  'node_modules/**/*.markdown',
  'node_modules/**/*.txt',
  'node_modules/**/LICENSE*',
  'node_modules/**/license*',
  'node_modules/**/LICENCE*',
  'node_modules/**/CHANGELOG*',
  'node_modules/**/HISTORY*',
  'node_modules/**/CONTRIBUTORS*',
  'node_modules/**/AUTHORS*',
  'node_modules/**/PATENTS*',
  'node_modules/**/.npmignore',
  'node_modules/**/.gitignore',
  'node_modules/**/.gitattributes',
  'node_modules/**/.travis.yml',
  'node_modules/**/appveyor.yml',
  'node_modules/**/.editorconfig',
  'node_modules/**/.eslintrc*',
  'node_modules/**/.jshintrc*',
  'node_modules/**/.flowconfig',
  'node_modules/**/.documentup.json',
  'node_modules/**/package-lock.json',
  'node_modules/**/yarn.lock',
  'node_modules/**/*.d.ts',
  'node_modules/**/*.map',
  'node_modules/**/*.min.map',
  'node_modules/**/*.ts',
  
  // Pastas desnecessárias
  'node_modules/**/test',
  'node_modules/**/tests',
  'node_modules/**/__tests__',
  'node_modules/**/docs',
  'node_modules/**/doc',
  'node_modules/**/website',
  'node_modules/**/images',
  'node_modules/**/.github',
  'node_modules/**/.vscode',
  'node_modules/**/example',
  'node_modules/**/examples',
  'node_modules/**/coverage',
  'node_modules/**/benchmark',
  'node_modules/**/fixtures',
  'node_modules/**/man',
  'node_modules/**/scripts'
];

// Função para remover arquivos desnecessários
function removeUnnecessaryFiles() {
  console.log('🗑️  Removendo arquivos desnecessários das dependências...');
  
  pathsToClean.forEach(pattern => {
    try {
      // Usando um comando diferente dependendo do sistema operacional
      if (process.platform === 'win32') {
        execSync(`if exist "${pattern}" (del /s /q "${pattern.replace(/\//g, '\\')}" 2>nul)`, { stdio: 'ignore' });
      } else {
        execSync(`find . -path "${pattern}" -type f -delete`, { stdio: 'ignore' });
      }
    } catch (error) {
      // Ignoramos erros aqui, pois alguns padrões podem não encontrar correspondências
    }
  });
  
  console.log('✅ Arquivos desnecessários removidos!');
}

// Executar otimizações
try {
  removeUnnecessaryFiles();
  console.log('✅ Otimizações pré-build concluídas com sucesso!');
} catch (error) {
  console.error('❌ Erro durante as otimizações pré-build:', error);
  process.exit(1);
} 