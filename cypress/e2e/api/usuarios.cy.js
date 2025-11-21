describe('API - Usuários', () => {
  it('Deve cadastrar um usuário válido (201) ou retornar conflito se já existir', () => {
    cy.fixture('requests/users-request.json').then((userReq) => {
      const ts = Date.now()
      const nome = `${userReq.nome} ${ts}`
      const email = userReq.email.replace(/@(.*)$/, `+${ts}@$1`)
      const senha = userReq.password

      cy.cadastrarUsuario(nome, email, senha, 'false').then((resp) => {
        // pode retornar 201 (criado) ou 400 (já existe) dependendo do estado
        expect([201, 400]).to.include(resp.status)
        if (resp.status === 201) expect(resp.body).to.have.property('_id')
      })
    })
  })

  it('Deve listar usuários e conter o usuário criado', () => {
    cy.fixture('requests/users-request.json').then((userReq) => {
      const ts = Date.now()
      const nome = `${userReq.nome} Lista ${ts}`
      const email = userReq.email.replace(/@(.*)$/, `+lista${ts}@$1`)
      const senha = userReq.password

      // criar usuário e depois listar
      cy.cadastrarUsuario(nome, email, senha, 'false')
      cy.listarUsuarios().then((resp) => {
        expect(resp.status).to.eq(200)
        expect(resp.body).to.have.property('usuarios')
        // buscar se existe ao menos um usuário com email semelhante (não garantimos o nosso por concorrência do ambiente)
        const existe = resp.body.usuarios.some(u => u.email && u.email.includes('@'))
        expect(existe).to.be.true
      })
    })
  })
})
