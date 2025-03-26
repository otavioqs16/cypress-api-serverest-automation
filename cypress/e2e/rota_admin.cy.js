const token = window.localStorage.getItem("serverest/userToken");

describe("API Tests - ServeRest", () => {
  before(() => {
    cy.request({
      method: "POST",
      url: "https://serverest.dev/usuarios",
      body: {
        nome: "QA Automation",
        email: "not-admin@qa.com",
        password: "teste",
        administrador: "false",
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      Cypress.env("USER_ID", response.body._id);
    });
  });

  beforeEach(() => {
    cy.session("not admin user", () => {
      cy.request("POST", "https://serverest.dev/login", {
        email: "not-admin@qa.com",
        password: "teste",
      }).then((response) => {
        window.localStorage.setItem(
          "serverest/userToken",
          response.body.authorization
        );
        Cypress.env("USER_TOKEN", response.body.authorization);
      });
    });
  });

  it("Cadastrar produto sem permissão de Admin", () => {
    cy.addItem({
      route: "/produtos",
      data: {
        nome: "Teste Produto QA",
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      },
      token: Cypress.env("USER_TOKEN"),
    }).then((response) => {
      expect(response.status).to.eq(403);
      expect(response.body.message).to.eq(
        "Rota exclusiva para administradores"
      );
      expect(response.body).to.not.have.property("_id");
    });
  });

  it("Excluir produto sem permissão de Admin", () => {
    cy.addItem({
      route: "/produtos",
      data: {
        nome: "Teste Produto QA",
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      },
      token: Cypress.env("USER_TOKEN"),
    }).then((response) => {
      const _id = response.body._id;
      cy.deleteItem({
        route: "/produtos",
        _id,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.message).to.eq(
          "Rota exclusiva para administradores"
        );
      });
    });
  });

  it("Excluir produto inexistente sem permissão de Admin", () => {
    cy.deleteItem({
      route: "/produtos",
      token: Cypress.env("USER_TOKEN"),
    }).then((response) => {
      expect(response.status).to.eq(403);
      expect(response.body.message).to.eq(
        "Rota exclusiva para administradores"
      );
    });
  });

  it("Editar produto sem permissão de Admin", () => {
    cy.request({
      method: "PUT",
      url: "https://serverest.dev/produtos/BeeJh5lz3k6kSIzA",
      body: {
        nome: "Logitech MX Vertical",
        preco: 470,
        descricao: "Mouse",
        quantidade: 381,
      },
      headers: {
        Authorization: Cypress.env("USER_TOKEN"),
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(403);
      expect(response.body.message).to.eq(
        "Rota exclusiva para administradores"
      );
    });
  });

  after(() => {
    const userId = Cypress.env("USER_ID");
    cy.deleteItem({ route: "usuarios", _id: userId }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
