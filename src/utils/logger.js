
const isDevelopment = import.meta.env.MODE === 'development' || 
                     import.meta.env.DEV === true ||
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';


const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const config = {
  enabled: isDevelopment,
  level: isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR,
  showTimestamp: true,
  showLevel: true,
  showSensitiveData: false
};


const maskSensitiveData = (data) => {
  if (!config.showSensitiveData) {
    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      
      
      const sensitiveFields = ['password', 'token', 'access_token', 'refresh_token', 'authorization'];
      sensitiveFields.forEach(field => {
        if (masked[field]) {
          const value = masked[field];
          if (typeof value === 'string' && value.length > 10) {
            
            masked[field] = `${value.substring(0, 8)}...${value.substring(value.length - 4)}`;
          } else {
            masked[field] = '***HIDDEN***';
          }
        }
      });
      
      return masked;
    }
  }
  return data;
};



function formatMessage(level, message, ...args) {
  const timestamp = config.showTimestamp ? `[${new Date().toLocaleTimeString()}]` : '';
  const levelStr = config.showLevel ? `[${level}]` : '';
  

  const processedArgs = args.map(arg => {
    if (level.includes('SENSITIVE')) {
      return maskSensitiveData(arg);
    }
    return arg;
  });
  
  return [timestamp, levelStr, message, ...processedArgs].filter(Boolean);
}


function shouldLog(level) {
  return config.enabled && LOG_LEVELS[level] <= config.level;
}


const logger = {
 
  error: (message, ...args) => {
    if (shouldLog('ERROR') || !isDevelopment) {
      console.error(...formatMessage('ERROR', message, ...args));
    }
  },

 
  warn: (message, ...args) => {
    if (shouldLog('WARN')) {
      console.warn(...formatMessage('WARN', message, ...args));
    }
  },

  
  info: (message, ...args) => {
    if (shouldLog('INFO')) {
      console.info(...formatMessage('INFO', message, ...args));
    }
  },

  
  debug: (message, ...args) => {
    if (shouldLog('DEBUG')) {
      console.log(...formatMessage('DEBUG', message, ...args));
    }
  },

  
  sensitive: (message, ...args) => {
    if (isDevelopment && shouldLog('DEBUG')) {
     
      const maskedArgs = args.map(arg => maskSensitiveData(arg));
      console.log(...formatMessage('🔐 SENSITIVE', message, ...maskedArgs));
    }
  },


  api: (message, ...args) => {
    if (isDevelopment && shouldLog('DEBUG')) {
      console.log(...formatMessage('📡 API', message, ...args));
    }
  },

 
  auth: (message, ...args) => {
    if (isDevelopment && shouldLog('DEBUG')) {
      console.log(...formatMessage('🔐 AUTH', message, ...args));
    }
  },

 
  nav: (message, ...args) => {
    if (isDevelopment && shouldLog('DEBUG')) {
      console.log(...formatMessage('🧭 NAV', message, ...args));
    }
  },

 
  configure: (newConfig) => {
    Object.assign(config, newConfig);
  },

  
  getConfig: () => ({ ...config }),


  isDevelopment: () => isDevelopment
};


export const devLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export const devError = (...args) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

export const devWarn = (...args) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

export default logger;