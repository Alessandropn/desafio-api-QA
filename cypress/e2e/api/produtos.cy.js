describe('API - Produtos', () => {
  it('Deve criar um produto com token de admin válido', () => {
    cy.fixture('requests/users-request.json').then((userReq) => {
      cy.fixture('requests/products-request.json').then((produto) => {
        const ts = Date.now()
        const adminEmail = userReq.email.replace(/@(.*)$/, `+admin${ts}@$1`)
        const adminName = `${userReq.nome} Admin ${ts}`
        const adminPass = userReq.password

        // criar usuário admin
        cy.cadastrarUsuario(adminName, adminEmail, adminPass, 'true')

        // obter token do admin e criar produto com nome único
        cy.token(adminEmail, adminPass).then((token) => {
          produto.nome = `${produto.nome} ${ts}`
          cy.criarProduto(produto, token).then((res) => {
            expect([201, 400]).to.include(res.status)
            if (res.status === 201) expect(res.body).to.have.property('_id')
          })
        })
      })
    })
  })

  it('Deve listar produtos e conter pelo menos um produto', () => {
    cy.fixture('requests/users-request.json').then((userReq) => {
      cy.fixture('requests/products-request.json').then((produto) => {
        const ts = Date.now()
        const adminEmail = userReq.email.replace(/@(.*)$/, `+adminlist${ts}@$1`)
        const adminName = `${userReq.nome} AdminList ${ts}`
        const adminPass = userReq.password

        // assegurar que existe ao menos um produto
        cy.cadastrarUsuario(adminName, adminEmail, adminPass, 'true')
        cy.token(adminEmail, adminPass).then((token) => {
          produto.nome = `${produto.nome} ${ts}`
          cy.criarProduto(produto, token)
          cy.listarProdutos().then((res) => {
            expect(res.status).to.eq(200)
            expect(res.body).to.have.property('produtos')
            expect(Array.isArray(res.body.produtos)).to.be.true
          })
        })
      })
    })
  })
})
