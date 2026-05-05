const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

async function buscarCidadeCPTEC(nomeCidade) {
    const url = `https://brasilapi.com.br/api/cptec/v1/cidade/${encodeURIComponent(nomeCidade)}`;
    
    let resposta;
    try {
        resposta = await fetch(url);
    } catch (err) {
        throw { tipo: 'SERVICO_EXTERNO', servico: 'CPTEC' };
    }
    if (resposta.status === 404) return null;

    if (!resposta.ok) throw { tipo: 'SERVICO_EXTERNO', servico: 'CPTEC' };

    const cidades = await resposta.json();
    if (!cidades || cidades.length === 0) return null;

    return cidades[0];
}

async function buscarClimaCPTEC(codigoCidade) {
    const url = `https://brasilapi.com.br/api/cptec/v1/clima/previsao/${codigoCidade}`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw { tipo: 'SERVICO_EXTERNO', servico: 'CPTEC' };
    return await resposta.json();
}

async function buscarCoordenadasIBGE(nomeCidade) {
    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw { tipo: 'SERVICO_EXTERNO', servico: 'IBGE' };
    const municipios = await resposta.json();
    const encontrado = municipios.find(m =>
        m.nome.toLowerCase() === nomeCidade.toLowerCase()
    );
    if (!encontrado) return null;
    return {
        siglaUF: encontrado['microrregiao']['mesorregiao']['UF']['sigla'],
        lat: encontrado['microrregiao']['mesorregiao']['UF']['regiao']['id'],
    };
}

async function buscarTemperaturaOpenMeteo(nomeCidade) {
    // Primeiro busca coordenadas pelo geocoder 
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeCidade)}&count=1&language=pt&country_code=BR`;
    const geoResposta = await fetch(geoUrl);
    if (!geoResposta.ok) return null;
    const geoData = await geoResposta.json();
    if (!geoData.results || geoData.results.length === 0) return null;

    const { latitude, longitude } = geoData.results[0];

    const climaUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=America/Fortaleza&forecast_days=1`;
    const climaResposta = await fetch(climaUrl);
    if (!climaResposta.ok) return null;
    const climaData = await climaResposta.json();

    return {
        temperatura_min: climaData.daily?.temperature_2m_min?.[0] ?? null,
        temperatura_max: climaData.daily?.temperature_2m_max?.[0] ?? null,
    };
}

async function buscarEstadoIBGE(nomeCidade) {
    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios`;
    const resposta = await fetch(url);
    if (!resposta.ok) return null;
    const municipios = await resposta.json();
    const encontrado = municipios.find(m =>
        m.nome.toLowerCase() === nomeCidade.toLowerCase()
    );
    return encontrado ? encontrado['microrregiao']['mesorregiao']['UF']['sigla'] : null;
}

router.get('/clima/:nome_cidade', async (req, res) => {
    const nomeCidade = req.params.nome_cidade.trim();

    if (nomeCidade.length < 2) {
        return res.status(400).json({
            erro: true,
            codigo: 'NOME_INVALIDO',
            mensagem: 'O nome da cidade deve conter pelo menos 2 caracteres',
            nome_informado: nomeCidade
        });
    }

    try {
        const cidade = await buscarCidadeCPTEC(nomeCidade);

        if (!cidade) {
            return res.status(404).json({
                erro: true,
                codigo: 'CIDADE_NAO_ENCONTRADA',
                mensagem: 'Nenhuma cidade encontrada com o nome informado',
                nome_informado: nomeCidade
            });
        }

        const [clima, temperaturas, siglaUF] = await Promise.all([
            buscarClimaCPTEC(cidade.id),
            buscarTemperaturaOpenMeteo(cidade.nome),
            buscarEstadoIBGE(cidade.nome)
        ]);

        const previsao = clima.clima?.[0];

        return res.status(200).json({
            nome: cidade.nome,
            estado: siglaUF || cidade.estado,
            clima: {
                temperatura_min: temperaturas?.temperatura_min ?? previsao?.temperatura_min ?? null,
                temperatura_max: temperaturas?.temperatura_max ?? previsao?.temperatura_max ?? null,
                condicao: previsao?.condicao_desc ?? null,
                unidades: {
                    temperatura: '°C'
                }
            },
            consultado_em: new Date().toISOString()
        });

    } catch (err) {
        if (err.tipo === 'SERVICO_EXTERNO') {
            return res.status(503).json({
                erro: true,
                codigo: 'SERVICO_EXTERNO_INDISPONIVEL',
                mensagem: 'Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes',
                servico: err.servico
            });
        }

        return res.status(503).json({
            erro: true,
            codigo: 'SERVICO_EXTERNO_INDISPONIVEL',
            mensagem: 'Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes',
            servico: 'DESCONHECIDO'
        });
    }
});

module.exports = router;