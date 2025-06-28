/**
 * Configuração Centralizada do GhostPad
 */

export const APP_INFO = {
  name: 'GhostPad',
  description: 'Editor de texto discreto com proteção contra captura de tela',
  author: 'Abner Lucas',
  copyright: 'Abner Lucas',
  website: 'https://github.com/Abnerlucasm/ghostpad',
};

export const UPDATE_CONFIG = {
  github: {
    owner: 'abnerlucasm',
    repo: 'ghostpad',
    enabled: true,
  },
  
  intervals: {
    autoCheck: 24 * 60 * 60 * 1000,
    retryDelay: 5 * 60 * 1000,
    backgroundCheck: 5 * 60 * 1000,
  },
  
  network: {
    timeout: 10000,
    retries: 3,
    userAgent: 'GhostPad-UpdateChecker',
  },
  
  assetPatterns: {
    win32: ['-setup.exe', '.exe', '-win.exe', '-windows.exe'],
    darwin: ['.dmg', '-mac.dmg', '-macos.dmg'],
    linux: ['.AppImage', '-linux.AppImage', '.deb', '.rpm']
  }
};

export const WINDOW_CONFIG = {
  default: {
    width: 1000,
    height: 800,
    minWidth: 400,
    minHeight: 300,
  },
  
  security: {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
    contentProtection: true,
  },
  
  appearance: {
    frame: false,
    backgroundColor: '#ffffff',
    autoHideMenuBar: true,
    hasShadow: true,
    transparent: false,
  }
};

export const PROJECT_CONFIG = {
  maxRecentProjects: 10,
  defaultDirectory: 'Ghostpad/Projetos',
  
  storeDefaults: {
    temaSalvo: 'sistema',
    transparencia: 1.0,
    projetosRecentes: [],
    sempreNoTopo: false,
    autoUpdateCheck: true,
  },
  
  fileExtensions: [
    { name: 'Arquivos JSON', extensions: ['json'] },
    { name: 'Todos os Arquivos', extensions: ['*'] }
  ]
};

export const EDITOR_CONFIG = {
  teleprompter: {
    defaultSpeed: 5,
    minSpeed: 0.25,
    maxSpeed: 10,
    maxCountdown: 10,
    highlightEnabled: true,
  },
  
  formatting: {
    fonts: [
      'Arial', 'Verdana', 'Times New Roman', 
      'Courier New', 'Georgia', 'Tahoma', 'Trebuchet MS'
    ],
    fontSizes: [
      { label: '8pt', value: '1' },
      { label: '10pt', value: '2' },
      { label: '12pt', value: '3' },
      { label: '14pt', value: '4' },
      { label: '18pt', value: '5' },
      { label: '24pt', value: '6' },
      { label: '36pt', value: '7' }
    ]
  }
};

export const THEME_CONFIG = {
  available: ['sistema', 'claro', 'escuro'],
  default: 'sistema',
  
  cssClasses: {
    sistema: 'tema-sistema',
    claro: 'tema-claro',
    escuro: 'tema-escuro'
  }
};

export const TRANSPARENCY_CONFIG = {
  min: 0.2,
  max: 1.0,
  step: 0.1,
  default: 1.0,
  
  presets: [
    { label: 'Opaco (100%)', value: 1.0 },
    { label: 'Semitransparente (80%)', value: 0.8 },
    { label: 'Transparência média (60%)', value: 0.6 },
    { label: 'Alta transparência (40%)', value: 0.4 }
  ]
};

export const SECURITY_CONFIG = {
  contentSecurityPolicy: {
    defaultSrc: "'self'",
    scriptSrc: "'self'",
    styleSrc: "'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    fontSrc: "'self' https://cdnjs.cloudflare.com",
    imgSrc: "'self' data:",
  },
  
  allowedPermissions: ['clipboard-read', 'clipboard-write'],
  
  blockedKeys: ['printscreen', 'p', 's']
};

export const BUILD_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development' || process.argv.includes('--dev'),
  
  paths: {
    images: '../images',
    css: '../css',
    preload: 'preload.js',
    icon: {
      ico: '../images/icon.ico',
      png: '../images/icon.png',
      icns: '../images/icon.icns'
    }
  },
  
  development: {
    enableDevTools: true,
    enableF12Shortcut: true,
    verboseLogging: true,
  }
};


export function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let current = {
    app: APP_INFO,
    update: UPDATE_CONFIG,
    window: WINDOW_CONFIG,
    project: PROJECT_CONFIG,
    editor: EDITOR_CONFIG,
    theme: THEME_CONFIG,
    transparency: TRANSPARENCY_CONFIG,
    security: SECURITY_CONFIG,
    build: BUILD_CONFIG
  };
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current;
}

export function validateConfig() {
  const errors = [];
  const placeholderValues = ['SEU-USUARIO-GITHUB', 'seu-usuario', 'meu-usuario'];
  const placeholderRepos = ['SEU-REPOSITORIO', 'seu-repositorio', 'meu-repositorio'];
  
  if (!UPDATE_CONFIG.github.owner || placeholderValues.includes(UPDATE_CONFIG.github.owner)) {
    errors.push('GitHub owner não configurado em UPDATE_CONFIG.github.owner');
  }
  
  if (!UPDATE_CONFIG.github.repo || placeholderRepos.includes(UPDATE_CONFIG.github.repo)) {
    errors.push('GitHub repo não configurado em UPDATE_CONFIG.github.repo');
  }
  
  if (UPDATE_CONFIG.github.owner === 'ghostpad' && UPDATE_CONFIG.github.repo === 'ghostpad') {
    console.info('ℹ️ Usando configuração padrão do repositório ghostpad/ghostpad');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Configurações pendentes:', errors);
    return false;
  }
  
  return true;
}


export default {
  APP_INFO,
  UPDATE_CONFIG,
  WINDOW_CONFIG,
  PROJECT_CONFIG,
  EDITOR_CONFIG,
  THEME_CONFIG,
  TRANSPARENCY_CONFIG,
  SECURITY_CONFIG,
  BUILD_CONFIG,
  getConfig,
  validateConfig
}; 