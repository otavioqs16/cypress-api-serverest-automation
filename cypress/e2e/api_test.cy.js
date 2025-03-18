const token = window.localStorage.getItem("serverest/userToken");

describe("API Tests - ServeRest", () => {
  beforeEach(() => {
    cy.request("POST", "https://serverest.dev/login", {
      email: "fulano@qa.com",
      password: "teste",
    }).then((response) => {
      window.localStorage.setItem(
        "serverest/userToken",
        response.body.authorization
      );
    });
  });

  context("GET /usuarios", () => {
    it("Consultar usuário pelo _id", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?_id=0uxuPY0cbmQhpEz1",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(1);
        expect(response.body.usuarios[0]._id).to.eq("0uxuPY0cbmQhpEz1");
      });
    });

    it("Consultar usuário por _id inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?_id=123",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
      });
    });

    it("Consultar usuário pelo nome", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?nome=Fulano da Silva",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.greaterThan(0);
        for (let i = 0; i < response.body.usuarios.length; i++) {
          expect(response.body.usuarios[i].nome).to.eq("Fulano da Silva");
        }
      });
    });

    it("Consultar usuário por nome inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?nome=Teste nome inexistente",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
      });
    });

    it("Consultar usuário pelo email", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?email=fulano@qa.com",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(1);
        expect(response.body.usuarios[0].email).to.eq("fulano@qa.com");
      });
    });

    it("Consultar usuário por email inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?email=email-inexistente@email.com",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
      });
    });

    it("Listar usuários cadastrados", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.greaterThan(0);
        expect(response.body.usuarios).to.exist;
      });
    });
  });

  it("Cadastrar produto", () => {
    const nomeProduto = `TESTE_${Date.now()}`;
    cy.request({
      method: "POST",
      url: "https://serverest.dev/produtos",
      headers: {
        Authorization: token,
      },
      body: {
        nome: nomeProduto,
        preco: 470,
        descricao: "Mouse",
        quantidade: 381,
      },
    }).then((response) => {
      cy.log(response);
    });
  });
});
