const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const UFS_VALIDAS = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
    'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
    'RS','RO','RR','SC','SP','SE','TO'
];

router.get('/cidades/:sigla_uf', async (req, res) => {
    const siglaUF = req.params.sigla_uf.toUpperCase().trim();
    const limite = parseInt(req.query.limite) || 1000;

    if (!/^[A-Za-z]{2}$/.test(siglaUF)) {
        return res.status(400).json({
            erro: true,
            codigo: 'SIGLA_UF_INVALIDA',
            mensagem: 'A sigla do estado deve conter exatamente 2 letras',
            sigla_uf_informada: req.params.sigla_uf
        });
    }

    if (!UFS_VALIDAS.includes(siglaUF)) {
        return res.status(404).json({
            erro: true,
            codigo: 'UF_NAO_ENCONTRADA',
            mensagem: 'Estado com a sigla informada não foi encontrado',
            sigla_uf_informada: siglaUF
        });
    }

    try {
        const url = `https://brasilapi.com.br/api/ibge/municipios/v1/${siglaUF}`;
        const resposta = await fetch(url);

        if (!resposta.ok) throw new Error('Falha ao buscar municípios');

        const municipios = await resposta.json();
        const cidadesLimitadas = municipios
            .slice(0, Math.min(limite, 1000))
            .map(m => ({ nome: m.nome }));

        return res.status(200).json({
            uf: siglaUF,
            quantidade_retornada: cidadesLimitadas.length,
            cidades: cidadesLimitadas,
            consultado_em: new Date().toISOString()
        });

    } catch (err) {
        return res.status(503).json({
            erro: true,
            codigo: 'SERVICO_EXTERNO_INDISPONIVEL',
            mensagem: 'Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes',
            servico: 'IBGE'
        });
    }
});

module.exports = router;