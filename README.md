# API de Agregação de Dados Climáticos e Geográficos - N703-Téc de integração de sistemas

API REST que integra dados climáticos e geográficos de cidades brasileiras a partir de APIs públicas.

## Como executar

```bash
npm install
npm start
```

A API estará disponível em `http://localhost:3000`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/health` | Status da API |
| GET | `/api/v1/clima/{cidade}` | Dados climáticos da cidade |
| GET | `/api/v1/cidades/{uf}` | Lista de cidades do estado |

## Exemplos
GET /api/v1/clima/Fortaleza
GET /api/v1/cidades/CE?limite=5
GET /api/v1/health

## Testes

```bash
npm test
```

## APIs utilizadas

- [BrasilAPI - CPTEC](https://brasilapi.com.br/docs#tag/CPTEC)
- [BrasilAPI - IBGE](https://brasilapi.com.br/docs#tag/IBGE)
- [IBGE Localidades](https://servicodados.ibge.gov.br/api/docs/localidades)
- [Open-Meteo](https://open-meteo.com/en/docs)