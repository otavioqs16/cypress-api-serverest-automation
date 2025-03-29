const productData = Cypress.env("PRODUCT_DATA");
let token, userId;

describe("ServeRest API Tests - Rota exclusiva para Admin", () => {
  before(() => {
    cy.request({
      method: "POST",
      url: `${Cypress.config("baseUrl")}/usuarios`,
      body: {
        nome: "QA Automation",
        email: "not-admin@qa.com",
        password: "teste",
        administrador: "false",
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      userId = response.body._id;
    });
  });

  beforeEach(() => {
    cy.session("not admin user", () => {
      cy.request("POST", `${Cypress.config("baseUrl")}/login`, {
        email: "not-admin@qa.com",
        password: "teste",
      }).then((response) => {
        window.localStorage.setItem(
          "serverest/userToken",
          response.body.authorization
        );
        token = response.body.authorization;
      });
    });
  });

  it("Cadastrar produto sem permissão de Admin", () => {
    cy.addItem({
      route: "produtos",
      data: productData,
      token,
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
      route: "produtos",
      data: productData,
      token,
    }).then((response) => {
      const productId = response.body._id;
      cy.deleteItem({
        route: "produtos",
        _id: productId,
        token,
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
      route: "produtos",
      token,
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
      url: `${Cypress.config("baseUrl")}/produtos/BeeJh5lz3k6kSIzA`,
      body: {
        nome: "Logitech MX Vertical",
        preco: 470,
        descricao: "Mouse",
        quantidade: 381,
      },
      headers: {
        Authorization: token,
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
    cy.deleteItem({ route: "usuarios", _id: userId }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
