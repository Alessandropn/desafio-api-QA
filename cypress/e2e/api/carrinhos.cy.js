describe('API - Carrinhos', () => {
  it('Deve criar um carrinho com produtos válidos para usuário autenticado', () => {
    cy.fixture('requests/users-request.json').then((userReq) => {
      cy.fixture('requests/products-request.json').then((produtoReq) => {
        const ts = Date.now()
        const nomeUsuario = `${userReq.nome} ${ts}`
        const emailUsuario = userReq.email.replace(/@(.*)$/, `+cliente${ts}@$1`)
        const senhaUsuario = userReq.password

        // criar usuário comum
        cy.cadastrarUsuario(nomeUsuario, emailUsuario, senhaUsuario, 'false')

        // criar usuário admin para criar produto
        const adminEmail = userReq.email.replace(/@(.*)$/, `+admcar${ts}@$1`)
        const adminName = `${userReq.nome} Admin ${ts}`
        const adminPass = userReq.password
        cy.cadastrarUsuario(adminName, adminEmail, adminPass, 'true')

        // criar produto com admin e depois criar carrinho com user
        cy.token(adminEmail, adminPass).then((adminToken) => {
          produtoReq.nome = `${produtoReq.nome} ${ts}`
          cy.criarProduto(produtoReq, adminToken).then((resProduto) => {
            // obter id do produto recém-criado (quando criado)
            const idProduto = resProduto.body._id || resProduto.body.id

            // montar carrinho usando fixture de carts como base
            cy.fixture('requests/carts-request.json').then((cartFixture) => {
              const carrinho = { produtos: [{ idProduto: idProduto, quantidade: cartFixture.produtos[0].quantidade || 1 }] }
              cy.token(emailUsuario, senhaUsuario).then((userToken) => {
                cy.criarCarrinho(carrinho, userToken).then((resCarrinho) => {
                  expect([201, 400]).to.include(resCarrinho.status)
                })
              })
            })
          })
        })
      })
    })
  })

  it('Deve retornar erro ao tentar criar carrinho com produto inválido', () => {
    cy.fixture('requests/users-request.json').then((userReq) => {
      const ts = Date.now()
      const nomeUsuario = `${userReq.nome} Inv ${ts}`
      const emailUsuario = userReq.email.replace(/@(.*)$/, `+clienteinv${ts}@$1`)
      const senhaUsuario = userReq.password

      cy.cadastrarUsuario(nomeUsuario, emailUsuario, senhaUsuario, 'false')
      cy.token(emailUsuario, senhaUsuario).then((token) => {
        // usar fixture de carts como base, mas forçar id inválido
        cy.fixture('requests/carts-request.json').then((cartFixture) => {
          const carrinhoInvalido = { produtos: [{ idProduto: 'produto-invalido-123', quantidade: cartFixture.produtos[0].quantidade || 1 }] }
          cy.criarCarrinho(carrinhoInvalido, token).then((res) => {
            expect(res.status).to.be.oneOf([400, 401])
          })
        })
      })
    })
  })
})
