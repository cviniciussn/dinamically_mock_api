# Mock Server

Servidor de mock dinâmico com painel administrativo web e PostgreSQL. Permite criar, editar e remover rotas mock em tempo real, sem reiniciar o servidor.

## Funcionalidades

- Criação/edição/remoção de rotas mock via interface web
- Suporte a todos os métodos HTTP (GET, POST, PUT, PATCH, DELETE)
- Configuração de status code, content-type, delay e response body por rota
- Rotas aplicadas instantaneamente sem restart
- PostgreSQL para persistência
- Suporte a HTTPS com certificados próprios
- Docker e Docker Compose para deploy portátil

## Quick Start com Docker

```bash
docker-compose up --build
```

Acesse o painel admin em: http://localhost:3001/admin

Pronto. O banco é criado automaticamente.

## Setup Local (sem Docker)

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente

### 1. Criar o banco

```bash
createdb mockserver
```

Ou via psql:

```sql
CREATE USER mockserver WITH PASSWORD 'mockserver';
CREATE DATABASE mockserver OWNER mockserver;
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Editar .env conforme necessário
```

### 3. Instalar dependências e iniciar

```bash
npm install
npm start
```

Acesse: http://localhost:3001/admin

## Uso com HTTPS

Para usar HTTPS (ex: desenvolvimento local com domínio customizado):

1. Gere certificados autoassinados ou use os existentes (`server.key` e `server.crt`)
2. Configure no `.env`:

```
HTTPS_ENABLED=true
SSL_KEY=server.key
SSL_CERT=server.crt
```

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | `mockserver` | Nome do banco |
| `DB_USER` | `mockserver` | Usuário do banco |
| `DB_PASSWORD` | `mockserver` | Senha do banco |
| `PORT` | `3001` | Porta do servidor |
| `HTTPS_ENABLED` | `false` | Habilitar HTTPS |
| `SSL_KEY` | `server.key` | Caminho do arquivo da chave SSL |
| `SSL_CERT` | `server.crt` | Caminho do certificado SSL |

## Como funciona

1. Acesse `/admin` para gerenciar as rotas
2. Crie uma rota definindo método, path, status code e response body
3. A rota fica disponível imediatamente no servidor
4. Requisições que não correspondem a nenhuma rota mock retornam 404

## Estrutura do Projeto

```
mock-server/
├── app.js                  # Entry point
├── src/
│   ├── db.js               # Conexão PostgreSQL
│   ├── migrate.js           # Criação automática de tabelas
│   └── routes/
│       ├── admin.js         # Rotas do painel admin (CRUD)
│       └── mock.js          # Router dinâmico de mocks
├── views/
│   ├── layout.ejs           # CSS compartilhado
│   ├── index.ejs            # Lista de rotas
│   └── form.ejs             # Formulário criar/editar
├── docker-compose.yml
├── Dockerfile
└── .env.example
```
