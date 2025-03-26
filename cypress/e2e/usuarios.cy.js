const token = window.localStorage.getItem("serverest/userToken");

describe("ServeRest API Tests - Carrinhos", () => {
  before(() => {
    cy.request({
      method: "POST",
      url: "https://serverest.dev/usuarios",
      body: {
        nome: "QA Automation",
        email: "email@qa.com",
        password: "teste",
        administrador: "true",
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      Cypress.env("USER_ID", response.body._id);
    });
  });

  beforeEach(() => {
    cy.session(Cypress.env("USER_EMAIL"), () => {
      cy.request("POST", "https://serverest.dev/login", {
        email: "email@qa.com",
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

  context("GET /usuarios", () => {
    it("Listar usuários cadastrados", () => {
      cy.getItem({ route: "usuarios", _id: "" }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.a("number");
        expect(response.body.quantidade).to.be.greaterThan(0);
        expect(response.body.usuarios).to.be.a("array");
        expect(response.body.usuarios).to.have.lengthOf(quantity);
      });
    });
    it("Consultar usuário pelo _id", () => {
      cy.addItem({
        route: "usuarios",
        data: {
          nome: "TESTE POST USER",
          email: "new-user@email.com",
          password: "teste",
          administrador: "true",
        },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `https://serverest.dev/usuarios?_id=${_id}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(1);
          expect(response.body.usuarios[0]._id).to.eq(_id);
          expect(response.body.usuarios).to.have.lengthOf(1);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    });

    it("Consultar usuário por _id inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?_id=123",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.usuarios).to.have.lengthOf(0);
      });
    });

    it("Consultar usuário pelo nome", () => {
      const data = {
        nome: "TESTE POST USER",
        email: "new-user@email.com",
        password: "teste",
        administrador: "true",
      };
      cy.addItem({
        route: "usuarios",
        data,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `https://serverest.dev/usuarios?nome=${data.nome}`,
        }).then((response) => {
          const quantity = response.body.quantidade;
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.be.greaterThan(0);
          for (let i = 0; i < response.body.usuarios.length; i++) {
            expect(response.body.usuarios[i].nome).to.eq(data.nome);
          }
          expect(response.body.usuarios).to.have.lengthOf(quantity);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    });

    it("Consultar usuário por nome inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?nome=Teste nome inexistente",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.usuarios).to.have.lengthOf(0);
      });
    });

    it("Consultar usuário pelo e-mail", () => {
      const data = {
        nome: "TESTE POST USER",
        email: "new-user@email.com",
        password: "teste",
        administrador: "true",
      };
      cy.addItem({
        route: "usuarios",
        data,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `https://serverest.dev/usuarios?email=${data.email}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(1);
          expect(response.body.usuarios[0].email).to.eq(data.email);
          expect(response.body.usuarios).to.have.lengthOf(1);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    });

    it("Consultar usuário por e-mail inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?email=email-inexistente@email.com",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.usuarios).to.have.lengthOf(0);
      });
    });
  });

  context("POST /usuarios", () => {
    it("Cadastrar usuário com sucesso", () => {
      cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: {
          nome: "QA Automation",
          email: `email${Date.now()}@qa.com`,
          password: "tester123",
          administrador: "true",
        },
      }).then((response) => {
        const _id = response.body._id;
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.deleteItem({
          route: "usuarios",
          _id,
          token: Cypress.env("USER_TOKEN"),
        });
      });
    });

    it("Cadastrar usuário com e-mail já cadastrado", () => {
      cy.addItem({
        route: "usuarios",
        data: {
          nome: "QA Automation",
          email: "email@qa.com",
          password: "tester123",
          administrador: "true",
        },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Este email já está sendo usado");
        expect(response.body).to.not.have.property("_id");
      });
    });

    it("Cadastrar usuário com campos obrigatórios não enviados no body", () => {
      // Nome não enviado
      cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: {
          email: "email@qa.com",
          password: "tester123",
          administrador: "true",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.nome).to.eq("nome é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // E-mail não enviado
      cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: {
          nome: "QA Automation",
          password: "tester123",
          administrador: "true",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.email).to.eq("email é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Senha não enviada
      cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: {
          nome: "QA Automation",
          email: `email${Date.now()}@qa.com`,
          administrador: "true",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.password).to.eq("password é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Administrador não enviado
      cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: {
          nome: "QA Automation",
          email: `email${Date.now()}@qa.com`,
          password: "tester123",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.administrador).to.eq(
          "administrador é obrigatório"
        );
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });
    });
  });

  context("GET /usuarios/{_id}", () => {
    it("Buscar usuário por ID", () => {
      const data = {
        nome: "QA Automation",
        email: `email${Date.now()}@qa.com`,
        password: "tester123",
        administrador: "true",
      };
      cy.addItem({
        route: "usuarios",
        data,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `https://serverest.dev/usuarios/${_id}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.email).to.eq(data.email);
          expect(response.body.password).to.eq(data.password);
          expect(response.body.administrador).to.eq(data.administrador);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Buscar usuário por ID inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios/testeID",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Usuário não encontrado");
      });
    });
  });

  context("DELETE /usuarios/{_id}", () => {
    it("Excluir usuário", () => {
      cy.addItem({
        route: "usuarios",
        data: {
          nome: "QA Automation",
          email: `email${Date.now()}@qa.com`,
          password: "tester123",
          administrador: "true",
        },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");
        const _id = response.body._id;

        cy.deleteItem({
          route: "usuarios",
          _id,
          token: Cypress.env("USER_TOKEN"),
        });
      });
    });
    it("Excluir usuário inexistente", () => {
      cy.deleteItem({
        route: "usuarios",
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq("Nenhum registro excluído");
      });
    });

    it("Excluir usuário com carrinho cadastrado", () => {
      cy.addItemToCart(Cypress.env("USER_TOKEN")).then((cartResponse) => {
        const productId = cartResponse.productId;
        const cartId = cartResponse.response.body._id;

        cy.deleteItem({
          route: "usuarios",
          _id: Cypress.env("USER_ID"),
          token: Cypress.env("USER_TOKEN"),
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Não é permitido excluir usuário com carrinho cadastrado"
          );
          expect(response.body.idCarrinho).to.eq(cartId);

          cy.deleteItem({
            route: "carrinhos/cancelar-compra",
            _id: "",
            token: Cypress.env("USER_TOKEN"),
          }).then(() => {
            cy.deleteItem({
              route: "produtos",
              _id: productId,
              token: Cypress.env("USER_TOKEN"),
            });
          });
        });
      });
    });
  });

  context("PUT /usuarios/{_id}", () => {
    it("Alterar nome do usuário", () => {
      cy.editItem({
        route: "usuarios",
        data: { nome: "QA AUTOMATION 2" },
        token: Cypress.env("USER_TOKEN"),
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "usuarios", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.email).to.eq(data.email);
          expect(response.body.password).to.eq(data.password);
          expect(response.body.administrador).to.eq(data.administrador);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Alterar e-mail do usuário", () => {
      cy.editItem({
        route: "usuarios",
        data: { email: "apiAutomation@qa.com" },
        token: Cypress.env("USER_TOKEN"),
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "usuarios", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.email).to.eq("apiAutomation@qa.com");
          expect(response.body.password).to.eq(data.password);
          expect(response.body.administrador).to.eq(data.administrador);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Alterar password do usuário", () => {
      cy.editItem({
        route: "usuarios",
        data: { password: "testeQA123" },
        token: Cypress.env("USER_TOKEN"),
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "usuarios", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.email).to.eq(data.email);
          expect(response.body.password).to.eq("testeQA123");
          expect(response.body.administrador).to.eq(data.administrador);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Alterar permissão do usuário", () => {
      cy.editItem({
        route: "usuarios",
        data: { admin: "false" },
        token: Cypress.env("USER_TOKEN"),
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "usuarios", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.email).to.eq(data.email);
          expect(response.body.password).to.eq(data.password);
          expect(response.body.administrador).to.eq("false");
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Cadastrar usuário utilizando PUT", () => {
      const uniqueUser = Date.now();
      const data = {
        nome: "PUT QA",
        email: `email-${uniqueUser}@qa.com`,
        password: "password",
        administrador: "true",
      };

      cy.request({
        method: "PUT",
        url: `https://serverest.dev/usuarios/${uniqueUser}`,
        body: data,
      }).then((response) => {
        const _id = response.body._id;
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.request({
          method: "GET",
          url: `https://serverest.dev/usuarios/${_id}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.email).to.eq(data.email);
          expect(response.body.password).to.eq(data.password);
          expect(response.body.administrador).to.eq(data.administrador);
          expect(response.body._id).to.eq(_id);
        });

        cy.deleteItem({
          route: "usuarios",
          _id,
          token: Cypress.env("USER_TOKEN"),
        });
      });
    });

    it("Alterar para e-mail já cadastrado", () => {
      cy.addItem({
        route: "usuarios",
        data: {
          nome: "TESTE QA DUP",
          email: "dup@qa.com",
          password: "password",
          administrador: "true",
        },
        token: Cypress.env("USER_TOKEN"),
      }).then(() => {
        cy.editItem({
          route: "usuarios",
          data: { email: "dup@qa.com" },
          token: Cypress.env("USER_TOKEN"),
        }).then(({ response, _id }) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq("Este email já está sendo usado");

          cy.deleteItem({
            route: "usuarios",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });
  });

  after(() => {
    const userId = Cypress.env("USER_ID");
    cy.deleteItem({ route: "usuarios", _id: userId }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
