# 🔧 Exemplo de Configuração - GhostPad

## 📍 Como Configurar o Sistema de Atualização

### **1. Localize o Arquivo de Configuração**

Abra o arquivo: `src/js/app-config.js`

### **2. Configure Seu Repositório GitHub**

Encontre a seção `UPDATE_CONFIG` e altere:

```javascript
// Configurações do sistema de atualização
export const UPDATE_CONFIG = {
  // ⚠️ CONFIGURE AQUI AS INFORMAÇÕES DO SEU REPOSITÓRIO GITHUB
  github: {
    owner: 'seu-usuario',       // ← Substitua por seu usuário do GitHub
    repo: 'ghostpad',           // ← Substitua pelo nome do seu repositório
    enabled: true,              // ← true para habilitar, false para desabilitar
  },
  
  // Resto da configuração permanece igual...
};
```

### **3. Exemplo Prático**

Se seu repositório GitHub for: `https://github.com/abreudevs/ghostpad-app`

Configure assim:

```javascript
export const UPDATE_CONFIG = {
  github: {
    owner: 'abreudevs',         // ← Seu usuário do GitHub
    repo: 'ghostpad-app',       // ← Nome do seu repositório
    enabled: true,              // ← Sistema habilitado
  },
  
  intervals: {
    autoCheck: 24 * 60 * 60 * 1000,    // 24 horas
    retryDelay: 5 * 60 * 1000,         // 5 minutos
    backgroundCheck: 5 * 60 * 1000,    // 5 minutos
  },
  
  // ... resto permanece igual
};
```

## 🎯 **Teste da Configuração**

1. **Salve o arquivo** `app-config.js`
2. **Reinicie a aplicação**: `npm run start`
3. **Verifique os logs:**
   ```
   ✅ UpdateService inicializado com sucesso
   📋 Configurado para: abreudevs/ghostpad-app
   ```
4. **Teste manualmente:** Menu → Ajuda → Verificar Atualizações

## 📦 **Preparando Releases no GitHub**

### **Estrutura de Release Necessária:**

1. **Tag da versão:** `v1.2.2` (formato semântico)
2. **Assets nomeados corretamente:**
   - Windows: `GhostPad-1.2.2-setup.exe`
   - macOS: `GhostPad-1.2.2.dmg`
   - Linux: `GhostPad-1.2.2.AppImage`

### **Exemplo de Release:**

**Tag:** `v1.2.2`
**Título:** `GhostPad v1.2.2 - Sistema de Atualização`

**Descrição:**
```markdown
## Novidades ✨
- Sistema de atualização automática
- Configurações centralizadas
- Interface melhorada

## Correções 🐛
- Corrigido problema de validação
- Melhorada performance de inicialização

## Arquivo para Download
Escolha o arquivo correto para seu sistema operacional:
- Windows: GhostPad-1.2.2-setup.exe
- macOS: GhostPad-1.2.2.dmg
- Linux: GhostPad-1.2.2.AppImage
```

## ⚙️ **Outras Configurações Disponíveis**

### **Desabilitar Sistema de Atualização:**
```javascript
github: {
  owner: 'seu-usuario',
  repo: 'seu-repo',
  enabled: false,  // ← Desabilita completamente
},
```

### **Alterar Frequência de Verificação:**
```javascript
intervals: {
  autoCheck: 12 * 60 * 60 * 1000,  // ← 12 horas em vez de 24
  // ...
},
```

### **Configurar Timeout de Rede:**
```javascript
network: {
  timeout: 15000,  // ← 15 segundos em vez de 10
  retries: 5,      // ← 5 tentativas em vez de 3
  // ...
},
```

## 🛠️ **Solução de Problemas**

### **Problema: "Repositório GitHub não configurado"**
**Solução:** Configure `owner` e `repo` em `UPDATE_CONFIG.github`

### **Problema: "HTTP 404: Not Found"**
**Solução:** Verifique se o repositório existe e está público

### **Problema: "Sistema de atualização desabilitado"**
**Solução:** Configure `enabled: true` em `UPDATE_CONFIG.github`

### **Logs Importantes:**
- ✅ `UpdateService inicializado com sucesso` = Tudo OK
- ⚠️ `Repositório GitHub não configurado` = Precisa configurar
- 🔒 `Sistema de atualização desabilitado` = enabled: false

## 🚀 **Validação da Configuração**

O sistema inclui validação automática. Se algo estiver incorreto, você verá:

```
⚠️ Configurações pendentes: [
  'GitHub owner não configurado em UPDATE_CONFIG.github.owner',
  'GitHub repo não configurado em UPDATE_CONFIG.github.repo'
]
```

## 💡 **Dicas**

1. **Mantenha `enabled: false`** durante desenvolvimento se não tiver releases prontos
2. **Use tags semânticas** (v1.0.0, v1.1.0, v2.0.0) para versionamento
3. **Teste sempre** depois de configurar criando um release de teste
4. **Monitore os logs** para identificar problemas rapidamente

---

## 📞 **Precisa de Ajuda?**

1. Verifique se o repositório GitHub existe e está público
2. Confirme que as configurações em `app-config.js` estão corretas
3. Teste a conectividade: abra `https://api.github.com/repos/SEU-USUARIO/SEU-REPO/releases/latest` no navegador
4. Verifique os logs do console para mensagens específicas de erro 