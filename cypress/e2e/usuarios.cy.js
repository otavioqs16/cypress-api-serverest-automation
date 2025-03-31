const newUserData = Cypress.env("NEW_USER_DATA");
let token, userId;

describe("ServeRest API Tests - Usuários", () => {
  before(() => {
    cy.request({
      method: "POST",
      url: `${Cypress.config("baseUrl")}/usuarios`,
      body: Cypress.env("USER_DATA"),
    }).then((response) => {
      expect(response.status).to.eq(201);
      userId = response.body._id;
    });
  });

  beforeEach(() => {
    cy.session(Cypress.env("USER_EMAIL"), () => {
      cy.request("POST", `${Cypress.config("baseUrl")}/login`, {
        email: Cypress.env("USER_EMAIL"),
        password: Cypress.env("USER_PASSWORD"),
      }).then((response) => {
        window.localStorage.setItem(
          "serverest/userToken",
          response.body.authorization
        );
        token = response.body.authorization;
      });
    });
  });

  context("GET /usuarios", () => {
    it("Listar usuários cadastrados", () => {
      cy.getItem({ route: "usuarios", _id: "" }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.a("number");
        expect(response.body.usuarios).to.be.a("array");
        expect(response.body.usuarios).to.have.lengthOf(quantity);
      });
    });
    it("Consultar usuário pelo _id", () => {
      cy.addItem({
        route: "usuarios",
        data: newUserData,
        token,
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/usuarios?_id=${_id}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(1);
          expect(response.body.usuarios[0]._id).to.eq(_id);
          expect(response.body.usuarios).to.have.lengthOf(1);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token,
          });
        });
      });
    });

    it("Consultar usuário por _id inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/usuarios?_id=123`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.usuarios).to.have.lengthOf(0);
      });
    });

    it("Consultar usuário pelo nome", () => {
      cy.addItem({
        route: "usuarios",
        data: newUserData,
        token,
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/usuarios?nome=${newUserData.nome}`,
        }).then((response) => {
          const quantity = response.body.quantidade;
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.be.greaterThan(0);
          for (let i = 0; i < response.body.usuarios.length; i++) {
            expect(response.body.usuarios[i].nome).to.eq(newUserData.nome);
          }
          expect(response.body.usuarios).to.have.lengthOf(quantity);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token,
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    });

    it("Consultar usuário por nome inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config(
          "baseUrl"
        )}/usuarios?nome=Teste nome inexistente`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.usuarios).to.have.lengthOf(0);
      });
    });

    it("Consultar usuário pelo e-mail", () => {
      cy.addItem({
        route: "usuarios",
        data: newUserData,
        token,
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/usuarios?email=${
            newUserData.email
          }`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(1);
          expect(response.body.usuarios[0].email).to.eq(newUserData.email);
          expect(response.body.usuarios).to.have.lengthOf(1);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token,
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        });
      });
    });

    it("Consultar usuário por e-mail inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config(
          "baseUrl"
        )}/usuarios?email=email-inexistente@email.com`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.usuarios).to.have.lengthOf(0);
      });
    });
  });

  context("POST /usuarios", () => {
    it("Cadastrar usuário com sucesso", () => {
      cy.addItem({
        route: "usuarios",
        data: newUserData,
        token,
      }).then((response) => {
        const _id = response.body._id;
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.deleteItem({
          route: "usuarios",
          _id,
          token,
        });
      });
    });

    it("Cadastrar usuário com e-mail já cadastrado", () => {
      cy.addItem({
        route: "usuarios",
        data: Cypress.env("USER_DATA"),
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Este email já está sendo usado");
        expect(response.body).to.not.have.property("_id");
      });
    });

    it("Cadastrar usuário com campos obrigatórios não enviados no body", () => {
      // Nome não enviado
      cy.addItem({
        route: "usuarios",
        data: { ...newUserData, nome: undefined },
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.nome).to.eq("nome é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // E-mail não enviado
      cy.addItem({
        route: "usuarios",
        data: { ...newUserData, email: undefined },
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.email).to.eq("email é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Senha não enviada
      cy.addItem({
        route: "usuarios",
        data: { ...newUserData, password: undefined },
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.password).to.eq("password é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Administrador não enviado
      cy.addItem({
        route: "usuarios",
        data: { ...newUserData, administrador: undefined },
        token,
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
      cy.addItem({
        route: "usuarios",
        data: newUserData,
        token,
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/usuarios/${_id}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(newUserData.nome);
          expect(response.body.email).to.eq(newUserData.email);
          expect(response.body.password).to.eq(newUserData.password);
          expect(response.body.administrador).to.eq(newUserData.administrador);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "usuarios",
            _id,
            token,
          });
        });
      });
    });

    it("Buscar usuário por ID inexistente", () => {
      cy.getItem({
        route: "usuarios",
        _id: "testeID",
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
        data: newUserData,
        token,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");
        const _id = response.body._id;

        cy.deleteItem({
          route: "usuarios",
          _id,
          token,
        });
      });
    });
    it("Excluir usuário inexistente", () => {
      cy.deleteItem({
        route: "usuarios",
        token,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq("Nenhum registro excluído");
      });
    });

    it("Excluir usuário com carrinho cadastrado", () => {
      cy.addItemToCart(token).then((cartResponse) => {
        const productId = cartResponse.productId;
        const cartId = cartResponse.response.body._id;

        cy.deleteItem({
          route: "usuarios",
          _id: userId,
          token,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Não é permitido excluir usuário com carrinho cadastrado"
          );
          expect(response.body.idCarrinho).to.eq(cartId);

          cy.deleteItem({
            route: "carrinhos/cancelar-compra",
            _id: "",
            token,
          }).then(() => {
            cy.deleteItem({
              route: "produtos",
              _id: productId,
              token,
            });
          });
        });
      });
    });
  });

  context("PUT /usuarios/{_id}", () => {
    it("Alterar nome do usuário", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/usuarios?email=emailTest@qa.com`,
      }).then((response) => {
        expect(response.body.quantidade).to.eq(0);
        cy.editItem({
          route: "usuarios",
          data: { nome: "QA AUTOMATION 2" },
          token,
        }).then(({ response, data, _id }) => {
          cy.log(response);
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
              token,
            });
          });
        });
      });
    });

    it("Alterar e-mail do usuário", () => {
      cy.editItem({
        route: "usuarios",
        data: { email: "apiAutomation@qa.com" },
        token,
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
            token,
          });
        });
      });
    });

    it("Alterar password do usuário", () => {
      cy.editItem({
        route: "usuarios",
        data: { password: "testeQA123" },
        token,
      }).then(({ response, data, _id }) => {
        console.log(data.email);
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
            token,
          });
        });
      });
    });

    it("Alterar permissão do usuário", () => {
      cy.editItem({
        route: "usuarios",
        data: { admin: "false" },
        token,
      }).then(({ response, data, _id }) => {
        console.log(data.email);
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
            token,
          });
        });
      });
    });

    it("Cadastrar usuário utilizando PUT", () => {
      cy.addItem({
        route: "usuarios",
        data: newUserData,
        token,
      }).then((response) => {
        const _id = response.body._id;
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.getItem({ route: "usuarios", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(newUserData.nome);
          expect(response.body.email).to.eq(newUserData.email);
          expect(response.body.password).to.eq(newUserData.password);
          expect(response.body.administrador).to.eq(newUserData.administrador);
          expect(response.body._id).to.eq(_id);
        });

        cy.deleteItem({
          route: "usuarios",
          _id,
          token,
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
        token,
      }).then((response) => {
        const dupUserId = response.body._id;
        cy.editItem({
          route: "usuarios",
          data: { email: "dup@qa.com" },
          token,
        }).then(({ response, _id }) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq("Este email já está sendo usado");

          cy.deleteItem({
            route: "usuarios",
            _id: dupUserId,
            token,
          }).then(() => {
            cy.deleteItem({ route: "usuarios", _id, token });
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteItem({ route: "usuarios", _id: userId }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
