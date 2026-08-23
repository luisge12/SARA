const https = require('https');
const crypto = require('crypto');

const agent = new https.Agent({
  rejectUnauthorized: false,
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
});

// Cache en memoria para evitar saturar el portal del BCV
let cachedBcvData = null;
let lastCacheTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Consulta directa y en tiempo real al portal oficial del Banco Central de Venezuela
 */
const fetchDirectFromBcv = async () => {
  return new Promise((resolve, reject) => {
    const req = https.get(
      'https://www.bcv.org.ve/',
      {
        agent,
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            // Extraer tasa oficial de USD: <div id="dolar"> ... <strong ...> 784,66330000 </strong>
            const dolarMatch = body.match(/id=["']dolar["'][\s\S]*?<strong[^>]*>\s*([0-9.,]+)\s*<\/strong>/i);
            
            // Extraer Fecha Valor oficial
            const dateMatch = body.match(/Fecha\s*Valor:?[\s\S]*?<span[^>]*class=["'][^"']*date-display-single[^"']*["'][^>]*>\s*([^<]+)\s*<\/span>/i);

            if (dolarMatch && dolarMatch[1]) {
              const rawRate = dolarMatch[1].trim().replace(/\./g, '').replace(',', '.');
              const rate = parseFloat(rawRate);
              const fechaValor = dateMatch && dateMatch[1] ? dateMatch[1].trim().replace(/\s+/g, ' ') : 'Lunes Hábil (Oficial BCV)';

              if (!isNaN(rate) && rate > 0) {
                return resolve({
                  source: 'Portal Oficial BCV (Directo en Vivo)',
                  rate: rate.toString(),
                  displayRate: rate.toFixed(2),
                  fechaValor: `Fecha Valor: ${fechaValor}`,
                  timestamp: new Date().toISOString()
                });
              }
            }
            reject(new Error('No se pudo extraer la tasa del HTML del BCV'));
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout al conectar con bcv.org.ve'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
};

/**
 * Servicio para obtener la Tasa Oficial del BCV
 */
const getBcvRate = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedBcvData && (now - lastCacheTime < CACHE_DURATION_MS)) {
    return cachedBcvData;
  }

  // 1. Intentar extracción directa desde bcv.org.ve
  try {
    const directData = await fetchDirectFromBcv();
    cachedBcvData = directData;
    lastCacheTime = now;
    return directData;
  } catch (error) {
    console.warn('⚠️ Consulta directa a BCV falló o demoró, usando fallback de contingencia:', error.message);
  }

  // 2. Fallback de contingencia (DolarAPI)
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    if (res.ok) {
      const data = await res.json();
      if (data && data.promedio) {
        const numericRate = parseFloat(data.promedio);
        const fallbackData = {
          source: 'BCV Oficial (Fallback DolarAPI)',
          rate: numericRate.toString(),
          displayRate: numericRate.toFixed(2),
          fechaValor: 'Fecha Valor: Próximo Lunes Bancario',
          timestamp: new Date().toISOString()
        };
        cachedBcvData = fallbackData;
        lastCacheTime = now;
        return fallbackData;
      }
    }
  } catch (err) {
    console.error('Error en fallback:', err.message);
  }

  // 3. Si hay datos cacheados previos, devolverlos
  if (cachedBcvData) {
    return cachedBcvData;
  }

  throw new Error('No se pudo obtener la tasa oficial del BCV');
};

module.exports = { getBcvRate };
