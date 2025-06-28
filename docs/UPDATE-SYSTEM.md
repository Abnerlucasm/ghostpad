# Sistema de Atualização via GitHub API - GhostPad

## 📋 Visão Geral

Foi implementado um sistema completo de atualização automática que permite ao GhostPad verificar e baixar novas versões diretamente do GitHub Releases. O sistema é seguro, eficiente e oferece controle total ao usuário.

## 🏗️ Arquitetura

### Componentes Principais

1. **UpdateService** (`src/js/update-service.js`)
   - Núcleo do sistema de atualização
   - Consulta a API do GitHub para verificar releases
   - Gerencia download e instalação
   - Comparação semântica de versões

2. **IPC Handlers** (integrados no `src/js/main.js`)
   - Comunicação segura entre processo principal e renderer
   - Handlers para verificação, configuração e status

3. **UpdateUI** (`src/js/update-ui.js`)
   - Interface do usuário para notificações
   - Controle visual das atualizações
   - Feedback de progresso e erro

4. **Estilos CSS** (`src/css/update-ui.css`)
   - Interface moderna e responsiva
   - Notificações não-intrusivas
   - Suporte a temas claro/escuro

## 🚀 Funcionalidades

### ✅ Verificação Automática
- Verifica atualizações a cada 24 horas (configurável)
- Pode ser habilitada/desabilitada pelo usuário
- Verificação silenciosa em background

### ✅ Verificação Manual
- Menu: `Ajuda > Verificar Atualizações`
- API disponível via JavaScript: `window.electron.checkForUpdates()`

### ✅ Notificações Inteligentes
- Notificação não-intrusiva no canto superior direito
- Três opções: "Atualizar Agora", "Mais Tarde", "Fechar"
- Auto-ocultação após período configurado

### ✅ Download e Instalação
- Download automático do instalador correto para a plataforma
- Verificação de integridade
- Execução segura do instalador
- Fechamento automático da aplicação para permitir atualização

### ✅ Segurança
- Rate limiting para evitar spam de requests
- Validação de assinatura digital (quando disponível)
- Timeout em requests de rede
- Verificação de integridade de downloads

## ⚙️ Configuração

### Configuração Inicial

1. **Instalar Dependência:**
   ```bash
   npm install semver
   ```

2. **Configurar Repositório:**
   Edite `src/js/main.js` linha ~689:
   ```javascript
   updateService = new UpdateService({
     owner: 'SEU-USUARIO-GITHUB',  // ⚠️ ALTERE AQUI
     repo: 'SEU-REPOSITORIO',      // ⚠️ ALTERE AQUI
     checkInterval: 24 * 60 * 60 * 1000 // 24h
   });
   ```

### Configurações do Usuário

Acessível via menu: `Ajuda > Configurações de Atualização`

- ✅ Habilitar/desabilitar verificação automática
- ✅ Visualizar última verificação
- ✅ Ver versão atual vs. disponível

## 📦 Preparação de Releases

### Estrutura Necessária no GitHub

1. **Tags Semânticas:**
   ```
   v1.2.0, v1.2.1, v2.0.0
   ```

2. **Nomes de Arquivos Suportados:**
   - **Windows:** `*-setup.exe`, `*.exe`
   - **macOS:** `*.dmg`, `*-mac.dmg`
   - **Linux:** `*.AppImage`, `*.deb`, `*.rpm`

3. **Release Notes:**
   - Título e descrição são exibidos ao usuário
   - Suporte a Markdown na descrição

### Exemplo de Release

```yaml
Tag: v1.3.0
Title: "GhostPad v1.3.0 - Sistema de Atualização"
Description: |
  ## Novidades
  - ✅ Sistema de atualização automática
  - ✅ Notificações de nova versão
  - ✅ Interface melhorada
  
  ## Correções
  - 🐛 Corrigido bug de salvamento
  - 🐛 Melhorada performance

Assets:
- GhostPad-1.3.0-setup.exe (Windows)
- GhostPad-1.3.0.dmg (macOS)
- GhostPad-1.3.0.AppImage (Linux)
```

## 🔧 APIs Disponíveis

### Processo Principal (Main)

```javascript
// Verificar atualizações
const result = await updateService.checkForUpdates(showDialog);

// Obter status
const status = updateService.getStatus();

// Configurar verificação automática
updateService.setAutoCheck(enabled);
```

### Processo Renderer (Frontend)

```javascript
// Verificar atualizações
const result = await window.electron.checkForUpdates(true);

// Obter status
const status = await window.electron.getUpdateStatus();

// Configurar verificação automática
await window.electron.setAutoUpdateCheck(true);

// Interface programática
updateUI.checkForUpdatesManually();
updateUI.setAutoUpdateCheck(false);
```

## 🎨 Personalização da Interface

### CSS Classes Principais

```css
.update-notification     /* Notificação principal */
.update-progress        /* Dialog de progresso */
.update-error          /* Dialog de erro */
.update-message        /* Mensagens de sucesso */
```

### Modificar Aparência

1. **Cores e Gradientes:**
   ```css
   .update-notification {
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   }
   ```

2. **Posicionamento:**
   ```css
   .update-notification {
     top: 20px;    /* Distância do topo */
     right: 20px;  /* Distância da direita */
   }
   ```

3. **Animações:**
   ```css
   .update-notification {
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   }
   ```

## 🛠️ Solução de Problemas

### Problemas Comuns

1. **"Serviço de atualização não disponível"**
   - Verifique se o UpdateService foi inicializado corretamente
   - Confirme configuração de owner/repo no main.js

2. **"Rate limit atingido"**
   - GitHub limita 60 requests/hora para IPs não autenticados
   - Implemente token de autenticação se necessário

3. **"Nenhum instalador encontrado"**
   - Verifique nomenclatura dos assets no release
   - Confirme que há asset para a plataforma atual

4. **Download falha**
   - Verifique conexão com internet
   - Confirme que o asset existe e é acessível

### Debug

Ative logs detalhados:
```javascript
console.log('UpdateService Debug:', updateService.getStatus());
```

### Logs Importantes

- `✅ UpdateService inicializado com sucesso`
- `🔍 Verificando atualizações...`
- `📢 Notificação de atualização exibida`
- `❌ Erro ao verificar atualizações:`

## 🔒 Considerações de Segurança

### Implementado
- ✅ Validação de URLs de download
- ✅ Verificação de integridade básica
- ✅ Timeout em requests de rede
- ✅ Rate limiting awareness
- ✅ Sandbox de download (pasta temp)

### Recomendações Adicionais
- 🔲 Implementar verificação de assinatura digital
- 🔲 Usar token GitHub para autenticação
- 🔲 Implementar whitelist de domínios
- 🔲 Log de auditoria de atualizações

## 📊 Monitoramento

### Métricas Importantes
- Taxa de sucesso de verificações
- Tempo de download de atualizações
- Erros de rede vs. erros de aplicação
- Adoção de novas versões

### Implementação de Analytics (Opcional)

```javascript
// Exemplo de tracking
updateService.on('updateChecked', (hasUpdate) => {
  analytics.track('update_checked', { hasUpdate });
});

updateService.on('updateDownloaded', (version) => {
  analytics.track('update_downloaded', { version });
});
```

## 🚀 Próximos Passos

1. **Configurar repositório GitHub:**
   - Alterar owner/repo no código
   - Criar primeiro release para testar

2. **Testar sistema:**
   - Verificação manual via menu
   - Configurações de verificação automática
   - Fluxo completo de atualização

3. **Monitorar performance:**
   - Logs de verificação
   - Taxa de sucesso de downloads
   - Feedback dos usuários

4. **Melhorias futuras:**
   - Verificação delta (apenas diferenças)
   - Rollback automático em caso de problemas
   - Notificações de changelog
   - Agendamento personalizado de verificações

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do console
2. Confirme configuração de owner/repo
3. Teste conectividade com GitHub API
4. Verifique permissões de escrita na pasta temp

O sistema foi projetado para ser robusto e auto-recuperável, mas é importante monitorar os logs para identificar possíveis problemas de configuração ou conectividade. 