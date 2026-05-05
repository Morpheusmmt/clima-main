const request = require('supertest');
const app = require('../server');

describe('GET /api/v1/cidades/:sigla_uf', () => {
    test('retorna lista de cidades para UF válida', async () => {
        const res = await request(app).get('/api/v1/cidades/CE');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('cidades');
        expect(Array.isArray(res.body.cidades)).toBe(true);
    }, 15000);

    test('retorna 404 para UF inexistente', async () => {
        const res = await request(app).get('/api/v1/cidades/XX');
        expect(res.statusCode).toBe(404);
        expect(res.body.codigo).toBe('UF_NAO_ENCONTRADA');
    });

    test('retorna 400 para sigla com formato inválido', async () => {
        const res = await request(app).get('/api/v1/cidades/ceara');
        expect(res.statusCode).toBe(400);
        expect(res.body.codigo).toBe('SIGLA_UF_INVALIDA');
    });
});