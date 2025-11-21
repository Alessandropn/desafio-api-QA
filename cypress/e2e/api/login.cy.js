describe('API - Login', () => {
  it('Deve cadastrar um usuário e obter token com login válido', () => {
    cy.fixture('requests/users-request.json').then((userReq) => {
      const ts = Date.now()
      const nome = `${userReq.nome} ${ts}`
      const email = userReq.email.replace(/@(.*)$/, `+${ts}@$1`)
      const senha = userReq.password

      // cadastrar usuário (não falhar se já existir)
      cy.cadastrarUsuario(nome, email, senha, userReq.administrador)

      // efetuar login e validar token
      cy.login(email, senha).then((resp) => {
        expect(resp.status).to.eq(200)
        expect(resp.body).to.have.property('authorization')
        expect(resp.body.authorization).to.be.a('string')
      })
    })
  })

  it('Deve retornar 401 ao tentar logar com credenciais inválidas', () => {
    cy.fixture('requests/login-request.json').then((loginReq) => {
      // usar credenciais inválidas a partir do fixture (alterando a senha)
      const email = `noexists+${Date.now()}@example.com`
      const senha = `${loginReq.password}-wrong`
      cy.login(email, senha).then((resp) => {
        // endpoint retorna 401 para credenciais inválidas
        expect(resp.status).to.be.oneOf([400, 401])
      })
    })
  })
})
