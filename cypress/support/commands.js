const apiData = require('../fixtures/api-data.json')

function buildUrl(path) {
  // se api-data.json definir baseUrl, concatena; caso contrário retorna path (assume baseUrl em cypress.config.js)
  if (apiData && apiData.baseUrl) {
    // remover barras duplicadas
    return `${apiData.baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  }
  return path
}

// Comando para fazer Login e obter o Token
Cypress.Commands.add('token', (email, senha) => {
  cy.request({
    method: 'POST',
    url: buildUrl(apiData.endpoints.login),
    body: {
      email: email,
      password: senha
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body.authorization // Retorna o Bearer Token
  })
})

// Comando para fazer login e retornar a resposta completa
Cypress.Commands.add('login', (email, senha) => {
  return cy.request({
    method: 'POST',
    url: buildUrl(apiData.endpoints.login),
    failOnStatusCode: false,
    body: { email, password: senha }
  })
})

// Comando para criar usuário via API (útil para pré-condições)
Cypress.Commands.add('cadastrarUsuario', (nome, email, password, administrador = 'true') => {
  return cy.request({
    method: 'POST',
    url: buildUrl(apiData.endpoints.register),
    failOnStatusCode: false, // Não falha se usuário já existir
    body: {
      nome,
      email,
      password,
      administrador
    }
  })
})

// Comando para obter lista de usuários
Cypress.Commands.add('listarUsuarios', (query = {}) => {
  return cy.request({
    method: 'GET',
    url: buildUrl(apiData.endpoints.find),
    qs: query,
    failOnStatusCode: false
  })
})

// Comando para obter usuário por id
Cypress.Commands.add('obterUsuarioPorId', (id) => {
  return cy.request({
    method: 'GET',
    url: buildUrl(`${apiData.endpoints.find}${id}`),
    failOnStatusCode: false
  })
})

// Comando para deletar usuário por id (requer token de admin quando aplicável)
Cypress.Commands.add('deletarUsuario', (id, token) => {
  return cy.request({
    method: 'DELETE',
    url: buildUrl(`${apiData.endpoints.delete}${id}`),
    failOnStatusCode: false,
    headers: token ? { Authorization: token } : {}
  })
})

// Produtos
// Comando para criar produto (requer Authorization header)
Cypress.Commands.add('criarProduto', (produto, token) => {
  return cy.request({
    method: 'POST',
    url: buildUrl(apiData.endpoints.products),
    failOnStatusCode: false,
    headers: { Authorization: token },
    body: produto
  })
})

// Listar produtos
Cypress.Commands.add('listarProdutos', (query = {}) => {
  return cy.request({
    method: 'GET',
    url: buildUrl(apiData.endpoints.products),
    qs: query,
    failOnStatusCode: false
  })
})

// Obter produto por id
Cypress.Commands.add('obterProdutoPorId', (id) => {
  return cy.request({
    method: 'GET',
    url: buildUrl(`${apiData.endpoints.productsFind}${id}`),
    failOnStatusCode: false
  })
})

// Deletar produto por id
Cypress.Commands.add('deletarProduto', (id, token) => {
  return cy.request({
    method: 'DELETE',
    url: buildUrl(`${apiData.endpoints.productsDelete}${id}`),
    failOnStatusCode: false,
    headers: token ? { Authorization: token } : {}
  })
})

// Carrinhos
// Criar carrinho (requer Authorization)
Cypress.Commands.add('criarCarrinho', (carrinhoBody, token) => {
  return cy.request({
    method: 'POST',
    url: buildUrl(apiData.endpoints.shoppingCart),
    failOnStatusCode: false,
    headers: { Authorization: token },
    body: carrinhoBody
  })
})

// Listar carrinhos
Cypress.Commands.add('listarCarrinhos', (query = {}) => {
  return cy.request({
    method: 'GET',
    url: buildUrl(apiData.endpoints.shoppingCart),
    qs: query,
    failOnStatusCode: false
  })
})

// Obter carrinho por id
Cypress.Commands.add('obterCarrinhoPorId', (id) => {
  return cy.request({
    method: 'GET',
    url: buildUrl(`${apiData.endpoints.shoppingCart}/${id}`),
    failOnStatusCode: false
  })
})

// Concluir compra (DELETE /carrinhos/concluir-compra)
Cypress.Commands.add('concluirCompra', (token) => {
  return cy.request({
    method: 'DELETE',
    url: buildUrl(`${apiData.endpoints.shoppingCart}/concluir-compra`),
    failOnStatusCode: false,
    headers: { Authorization: token }
  })
})

// Cancelar compra (DELETE /carrinhos/cancelar-compra)
Cypress.Commands.add('cancelarCompra', (token) => {
  return cy.request({
    method: 'DELETE',
    url: buildUrl(`${apiData.endpoints.shoppingCart}/cancelar-compra`),
    failOnStatusCode: false,
    headers: { Authorization: token }
  })
})