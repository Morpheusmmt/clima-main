const request = require('supertest');
const app = require('../server');

describe('GET /api/v1/clima/:nome_cidade', () => {
    test('retorna dados climáticos para cidade válida', async () => {
        const res = await request(app).get('/api/v1/clima/Fortaleza');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('nome');
        expect(res.body).toHaveProperty('estado');
        expect(res.body).toHaveProperty('clima');
    }, 15000);

    test('retorna 404 para cidade inexistente', async () => {
        const res = await request(app).get('/api/v1/clima/CidadeQueNaoExisteXYZ');
        expect(res.statusCode).toBe(404);
        expect(res.body.codigo).toBe('CIDADE_NAO_ENCONTRADA');
    }, 15000);

    test('retorna 400 para nome com menos de 2 caracteres', async () => {
        const res = await request(app).get('/api/v1/clima/X');
        expect(res.statusCode).toBe(400);
        expect(res.body.codigo).toBe('NOME_INVALIDO');
    });
});