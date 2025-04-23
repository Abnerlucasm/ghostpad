const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script executado após o empacotamento para otimizar ainda mais o tamanho do aplicativo
 */

module.exports = async function(context) {
  console.log('🔧 Iniciando otimizações pós-empacotamento...');
  const appOutDir = context.appOutDir;
  const electronOutDir = path.join(appOutDir, 'resources', 'app.asar');
  
  try {
    // Lista de arquivos do Electron que podem ser removidos com segurança
    // ATENÇÃO: Remover arquivos incorretos pode fazer o aplicativo falhar!
    const safeToRemoveFiles = [
      // Remover locales não utilizados (manter apenas pt-BR e en-US)
      ...fs.readdirSync(path.join(appOutDir, 'locales'))
        .filter(file => !['pt-BR.pak', 'en-US.pak'].includes(file))
        .map(file => path.join(appOutDir, 'locales', file)),
        
      // Remover .pak.info files - eles não são necessários para execução
      ...fs.readdirSync(path.join(appOutDir, 'locales'))
        .filter(file => file.endsWith('.pak.info'))
        .map(file => path.join(appOutDir, 'locales', file)),
    ];
    
    // Remover arquivos seguros
    safeToRemoveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`🗑️  Removendo arquivo: ${path.basename(file)}`);
        fs.unlinkSync(file);
      }
    });
    
    // Compressão máxima para o instalador
    if (context.arch === 'x64' && context.targets.includes('nsis')) {
      console.log('📦 Aplicando compressão máxima ao instalador...');
      try {
        // Nenhuma ação específica necessária aqui, pois já configuramos 
        // a compressão máxima no electron-builder-optimized.json
        console.log('✅ Compressão máxima aplicada!');
      } catch (err) {
        console.error('❌ Erro ao aplicar compressão máxima:', err);
      }
    }
    
    console.log('✅ Otimizações pós-empacotamento concluídas!');
  } catch (error) {
    console.error('❌ Erro durante otimizações pós-empacotamento:', error);
  }
}; 