# Projeto de Testes API - Serverest

Este repositório contém automação de testes de API para a aplicação pública `https://serverest.dev` utilizando Cypress.

**Objetivo:** documentar o levantamento de cenários, fornecer instruções de execução, listar os cenários implementados e as boas práticas aplicadas.

---

**Requisitos**

- Node.js (LTS recomendado)
- npm
- Conexão com internet (a API está em `https://serverest.dev`)

---

**Instalação**

Abra o PowerShell na raiz do projeto e execute:

```powershell
npm install
```

---

**Como executar os testes**

- Abrir o Test Runner (GUI):

```powershell
npx cypress open
```

- Executar os testes em modo headless (todas as specs de API):

```powershell
npx cypress run --spec "cypress/e2e/api/*.cy.js"
```

- Executar uma spec específica (ex.: `login`):

```powershell
npx cypress run --spec "cypress/e2e/api/login.cy.js"
```

Observação: os testes usam fixtures em `cypress/fixtures/requests/` e comandos customizados em `cypress/support/commands.js`.

---

**Cenários implementados (2 por funcionalidade)**

- Login (`cypress/e2e/api/login.cy.js`)
  - Deve cadastrar um usuário e obter token com login válido
  - Deve retornar 401 ao tentar logar com credenciais inválidas

- Usuários (`cypress/e2e/api/usuarios.cy.js`)
  - Deve cadastrar um usuário válido (201) ou retornar conflito se já existir
  - Deve listar usuários e conter o usuário criado

- Produtos (`cypress/e2e/api/produtos.cy.js`)
  - Deve criar um produto com token de admin válido
  - Deve listar produtos e conter pelo menos um produto

- Carrinhos (`cypress/e2e/api/carrinhos.cy.js`)
  - Deve criar um carrinho com produtos válidos para usuário autenticado
  - Deve retornar erro ao tentar criar carrinho com produto inválido

---

**Levantamento completo de cenários (copiado de `test-planning.md`)**

## Levantamento de Cenários (Detalhado a partir do Swagger)

Observação: o conteúdo abaixo foi mapeado lendo os endpoints e exemplos do Swagger contido em `https://serverest.dev`.

- **Login (/login - POST)**
  - Sucesso: `email` e `password` válidos → 200 + body com `message` e `authorization` (token válido por 600s).
  - Falha: `email` ou `password` inválidos → 401 + mensagem apropriada.
  - Falha: token expirado (quando usado) → 401 (mensagem: token expirado / inválido).

- **Usuários**
  - GET `/usuarios` — Listar usuários
    - Sucesso: retorna `quantidade` e `usuarios` (lista) — suportam query params `_id`, `nome`, `email`, `password`, `administrador`.
  - POST `/usuarios` — Cadastrar usuário
    - Sucesso: 201 + `message` e `_id`.
    - Falha: email já cadastrado → 400 + mensagem.
  - GET `/usuarios/{_id}` — Buscar por ID
    - Sucesso: 200 + objeto do usuário.
    - Falha: usuário não encontrado → 400 + mensagem.
  - DELETE `/usuarios/{_id}` — Excluir usuário
    - Sucesso: 200 + mensagem (registro excluído ou nenhum registro excluído).
    - Falha: usuário possui carrinho → 400 + mensagem e `idCarrinho`.
  - PUT `/usuarios/{_id}` — Editar usuário
    - Sucesso: 200 (alterado) ou 201 (se não existir, cria) + mensagens.
    - Falha: email já utilizado → 400 + mensagem.

- **Produtos**
  - GET `/produtos` — Listar produtos (suporta filtros: `_id`, `nome`, `preco`, `descricao`, `quantidade`)
    - Sucesso: 200 + `quantidade` e `produtos`.
  - POST `/produtos` — Cadastrar produto (requer header `Authorization`) — rota protegida
    - Sucesso: 201 + `message` e `_id`.
    - Falhas:
      - 400: já existe produto com esse nome.
      - 401: token ausente/inválido/expirado.
      - 403: rota exclusiva para administradores (administrador = true).
  - GET `/produtos/{_id}` — Buscar por ID
    - Sucesso: 200 + objeto do produto.
    - Falha: 400 + `Produto não encontrado`.
  - DELETE `/produtos/{_id}` — Excluir produto (protegido por token/admin)
    - Sucesso: 200 + mensagem.
    - Falha: 400 se produto faz parte de carrinho (retorna `idCarrinho`), 401/403 para auth.
  - PUT `/produtos/{_id}` — Editar produto (protegido)
    - Sucesso: 200 (alterado) ou 201 (criado se não existir).
    - Falha: 400 se nome duplicado / 401/403 para auth.

- **Carrinhos**
  - GET `/carrinhos` — Listar carrinhos (suporta filtros: `_id`, `precoTotal`, `quantidadeTotal`, `idUsuario`)
    - Sucesso: 200 + `quantidade` e `carrinhos`.
  - POST `/carrinhos` — Cadastrar carrinho (requer header `Authorization`)
    - Observações: o carrinho é vinculado ao usuário do token; apenas 1 carrinho por usuário; ao cadastrar reduz a quantidade dos produtos.
    - Sucesso: 201 + `message` e `_id`.
    - Falhas (400): "Não é permitido possuir produto duplicado" | "Não é permitido ter mais de 1 carrinho" | "Produto não encontrado" | "Produto não possui quantidade suficiente". Também 401 para token.
  - GET `/carrinhos/{_id}` — Buscar por ID
    - Sucesso: 200 + objeto do carrinho.
    - Falha: 400 + mensagem "Carrinho não encontrado".
  - DELETE `/carrinhos/concluir-compra` — Excluir carrinho do usuário (requer token)
    - Sucesso: 200 + mensagem (registro excluído ou não encontrado para o usuário).
    - Falha: 401 token ausente/expirado.
  - DELETE `/carrinhos/cancelar-compra` — Excluir carrinho e reabastecer estoque (requer token)
    - Sucesso: 200 + mensagem (registro excluído ou não encontrado para o usuário).
    - Falha: 401 token ausente/expirado.

## Priorização de cenários para automação (lista completa sugerida)

Para cada endpoint, automatizar (quando aplicável) os cenários abaixo — os itens marcados como "Alta" são prioritários:

- Login
  - [Alta] Login com credenciais válidas -> recebe token (200)
  - [Alta] Login com credenciais inválidas -> 401
  - [Média] Usar token expirado para acessar rota protegida -> 401

- Usuários
  - [Alta] Cadastrar usuário válido -> 201 + retorna _id
  - [Alta] Não permitir cadastro com email duplicado -> 400
  - [Média] Listar usuários e verificar usuário criado aparece
  - [Média] Buscar usuário por ID existente -> 200
  - [Média] Buscar usuário por ID inexistente -> 400
  - [Baixa] Editar usuário existente -> 200
  - [Baixa] PUT com ID inexistente cria novo registro -> 201
  - [Média] Excluir usuário sem carrinho -> 200
  - [Média] Excluir usuário com carrinho -> 400 + idCarrinho

- Produtos
  - [Alta] Criar produto com token de admin válido -> 201
  - [Alta] Não criar produto com nome duplicado -> 400
  - [Alta] Acesso a rota protegida sem token ou com token inválido -> 401/403
  - [Média] Listar produtos -> 200 + estrutura
  - [Média] Buscar produto por ID existente -> 200
  - [Média] Buscar produto por ID inexistente -> 400
  - [Média] Excluir produto não vinculado a carrinho -> 200
  - [Média] Excluir produto que está em carrinho -> 400 + idCarrinho

- Carrinhos
  - [Alta] Criar carrinho com produtos válidos (usuário autenticado) -> 201
  - [Alta] Criar carrinho com produto inexistente / quantidade insuficiente -> 400
  - [Alta] Não permitir mais de 1 carrinho por usuário -> 400
  - [Média] Listar carrinhos -> 200
  - [Média] Buscar carrinho por ID -> 200 / 400
  - [Média] Concluir compra (DELETE /concluir-compra) -> 200 e carrinho excluído
  - [Média] Cancelar compra (DELETE /cancelar-compra) -> 200 e estoque reabastecido

---

**Boas práticas aplicadas**

- Fixtures: todos os payloads de request ficam em `cypress/fixtures/requests/` para facilitar manutenção e reuso.
- Comandos personalizados: `cypress/support/commands.js` centraliza requests comuns (login, criar usuário/produto, carrinho), evitando duplicação.
- Idempotência: uso de timestamps para gerar emails/nomes únicos em tempo de execução e reduzir conflitos em ambientes compartilhados.
- Tratamento de respostas: asserts tolerantes (aceitam 201 ou 400 quando o ambiente pode já conter o recurso) para tornar os testes mais resilientes em ambiente compartilhado.
- Configuração centralizada: endpoints e códigos de status estão em `cypress/fixtures/api-data.json`.
- Isolamento: cada spec foi projetada para ser independente quando possível, criando suas pré-condições (usuários/produtos) antes do assert principal.

---

**Observações finais**

- Se desejar testes determinísticos em ambiente limpo, prefira usar uma instância dedicada da API ou criar/limpar recursos via API em hooks `before`/`after`.
- Posso também gerar o arquivo `testes-implementados.md` em Gherkin (2 cenários por funcionalidade) se quiser — isso ainda consta como pendente no TODO.

---

Arquivo principal de testes: `cypress/e2e/api/`.

Boa sorte — se quiser, eu já rodo os specs e trago o output aqui.
