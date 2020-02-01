const puppeteer = require('puppeteer');
const axios = require('axios');
const redis = require('async-redis');

const port_redis = process.env.PORT || 6379;
const redis_client = redis.createClient(port_redis);

const checkCache = async (key) => {
  const data = await redis_client.get(key);
  return data;
};

const find = async () => {
  const cotacao = await axios.get('https://api.exchangeratesapi.io/latest?base=BRL');
  const USD = cotacao.data.rates.USD;
  const EUR = cotacao.data.rates.EUR;
  const date = cotacao.data.date;
  const objCotacoes = {
    date,
    USD,
    EUR
  };
  
  const cacheCotacao = await checkCache('cotacao');
  if (cacheCotacao) {
    const objCacheCotacao = JSON.parse(cacheCotacao);
    if((objCotacoes.USD == objCacheCotacao.USD) || (objCotacoes.USD == objCacheCotacao.USD)){
      const cachePlanos = await checkCache('planos');
      if (cachePlanos) return JSON.parse(cachePlanos);
    }
  }
  redis_client.setex('cotacao', 3600, JSON.stringify(objCotacoes));
  
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.smartmei.com.br/');
  await page.waitFor(100);
  const result = await page.evaluate(async () => {
    const data = [];
    const regexNum = new RegExp('([0-99]+,[0-99]+)');
     
    const tituloCobranca = document.querySelector('#tarifas-2 > div:nth-child(2) > div.col-sm-4.cell-small-title').textContent.trim();
    const valTxtCobranca = document.querySelector('#tarifas-2 > div:nth-child(2) > .tarifas-2-1-2').textContent.trim();
    const valCobranca = regexNum.exec(valTxtCobranca)[0];
    data.push({
      titulo: tituloCobranca,
      valor: (valCobranca ? parseFloat(valCobranca) : null)
    });
    
    const tituloTransferencia = document.querySelector('#tarifas-2 > div:nth-child(3) > div.col-sm-4.cell-small-title').textContent.trim();
    const valTxtTransferencia = document.querySelector('#tarifas-2 > div:nth-child(3) > .tarifas-2-2-2').textContent.trim();
    const valTransferencia = regexNum.exec(valTxtTransferencia)[0];
    data.push({
      titulo: tituloTransferencia,
      valor: (valTransferencia ? parseFloat(valTransferencia) : null)
    });
    
    const tituloSaque = document.querySelector('#tarifas-2 > div:nth-child(4) > div.col-sm-4.cell-small-title').textContent.trim();
    const valTxtSaque = document.querySelector('#tarifas-2 > div:nth-child(4) > .tarifas-2-3-2').textContent.trim();
    const valSaque = regexNum.exec(valTxtSaque)[0];
    data.push({
      titulo: tituloSaque,
      valor: (valSaque ? parseFloat(valSaque) : null)
    });
    
    
    const tituloMensalidade = document.querySelector('#tarifas-2 > div:nth-child(5) > div.col-sm-4.cell-small-title').textContent.trim();
    const valTxtMensalidade = document.querySelector('#tarifas-2 > div:nth-child(5) > .tarifas-2-4-2').textContent.trim();
    const valMensalidade = regexNum.exec(valTxtMensalidade)[0];
    data.push({
      titulo: tituloMensalidade,
      valor: (valMensalidade ? parseFloat(valMensalidade) : null)
    });

    return data;
  })
  
  browser.close();
  
  const planos = result.map(r => {
    return {
      titulo: r.titulo,
      valor: r.valor,
      valorUSD: (r.valor ? (r.valor / USD).toFixed(2) : null),
      valorEUR: (r.valor ? (r.valor / EUR).toFixed(2) : null),
      data: date
    }
  })

  redis_client.setex('planos', 3600, JSON.stringify(planos));

  return planos;
};

const search = async (filter) => {
  const data = await find();
  const obj = data.filter((o) => {
    return o.titulo == filter.titulo;
  });

  return obj[0];
}

module.exports = {
  find,
  search
}


