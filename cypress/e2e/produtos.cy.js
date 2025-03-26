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

  context("GET /produtos", () => {
    it("Listar produtos cadastrados", () => {
      cy.getItem({ route: "produtos", _id: "" }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.a("number");
        expect(response.body.produtos).to.be.a("array");
        expect(response.body.produtos).to.have.lengthOf(quantity);
      });
    });
    it("Consultar produto pelo _id", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?_id=BeeJh5lz3k6kSIzA",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(1);
        expect(response.body.produtos[0]._id).to.eq("BeeJh5lz3k6kSIzA");
        expect(response.body.produtos).to.have.lengthOf(1);
      });
    });

    it("Consultar produto por _id inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?_id=123",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });

    it("Consultar produto pelo nome", () => {
      cy.addItem({
        route: "produtos",
        data: {
          nome: "Teste Produto QA",
          preco: 150,
          descricao: "Produto QA",
          quantidade: 20,
        },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: "https://serverest.dev/produtos?nome=Teste Produto QA",
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(1);
          expect(response.body.produtos[0].nome).to.eq("Teste Produto QA");
          expect(response.body.produtos).to.have.lengthOf(1);

          cy.deleteItem({
            route: "produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Consultar produto por nome inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?nome=Teste nome inexistente",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });

    it("Consultar produto pelo preço", () => {
      cy.addItem({
        route: "produtos",
        data: {
          nome: "Teste Produto QA",
          preco: 150,
          descricao: "Produto QA",
          quantidade: 20,
        },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: "https://serverest.dev/produtos?preco=20",
        }).then((response) => {
          const quantity = response.body.quantidade;
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(quantity);
          for (let i = 0; i < response.body.produtos.length; i++) {
            expect(response.body.produtos[i].preco).to.eq(20);
          }
          expect(response.body.produtos).to.have.lengthOf(quantity);

          cy.deleteItem({
            route: "produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Consultar produto por preço inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?preco=3203920392302930",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });

    it("Consultar produto pela descrição", () => {
      cy.addItem({
        route: "produtos",
        data: {
          nome: "Teste Produto QA",
          preco: 150,
          descricao: "Produto QA",
          quantidade: 20,
        },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: "https://serverest.dev/produtos?descricao=Produto QA",
        }).then((response) => {
          const quantity = response.body.quantidade;
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(quantity);
          for (let i = 0; i < response.body.produtos.length; i++) {
            expect(
              response.body.produtos[i].descricao.toLowerCase()
            ).to.include("produto qa");
          }
          expect(response.body.produtos).to.have.lengthOf(quantity);

          cy.deleteItem({
            route: "produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Consultar produto por descrição inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?descricao=Teste Descrição Inexistente",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });

    it("Consultar produto pela quantidade", () => {
      cy.addItem({
        route: "produtos",
        data: {
          nome: "Teste Produto QA",
          preco: 150,
          descricao: "Produto QA",
          quantidade: 20,
        },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: "https://serverest.dev/produtos?quantidade=20",
        }).then((response) => {
          const quantity = response.body.quantidade;
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(quantity);
          for (let i = 0; i < response.body.produtos.length; i++) {
            expect(response.body.produtos[i].quantidade).to.eq(20);
          }
          expect(response.body.produtos).to.have.lengthOf(quantity);

          cy.deleteItem({
            route: "produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Consultar produto por quantidade inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?quantidade=123213213213",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });
  });

  context("POST /produtos", () => {
    it("Cadastrar produto com sucesso", () => {
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
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.deleteItem({
          route: "produtos",
          _id,
          token: Cypress.env("USER_TOKEN"),
        });
      });
    });

    it("Cadastrar produto com nome já cadastrado", () => {
      const data = {
        nome: "Teste Produto QA",
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      };
      cy.addItem({
        route: "produtos",
        data,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.addItem({
          route: "produtos",
          data,
          token: Cypress.env("USER_TOKEN"),
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Já existe produto com esse nome"
          );
          expect(response.body).to.not.have.property("_id");

          cy.deleteItem({
            route: "produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Cadastrar usuário com campos obrigatórios não enviados no body", () => {
      const data = {
        nome: "Teste Produto QA",
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      };
      // Nome não enviado
      cy.addItem({
        route: "/produtos",
        data: { ...data, nome: undefined },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.nome).to.eq("nome é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Preço não enviado
      cy.addItem({
        route: "/produtos",
        data: { ...data, preco: undefined },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.preco).to.eq("preco é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Descrição não enviada
      cy.addItem({
        route: "/produtos",
        data: { ...data, descricao: undefined },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.descricao).to.eq("descricao é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Quantidade não enviada
      cy.addItem({
        route: "/produtos",
        data: { ...data, quantidade: undefined },
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.quantidade).to.eq("quantidade é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });
    });

    it("Cadastrar produto com token ausente", () => {
      cy.addItem({
        route: "/produtos",
        data: {
          nome: "Teste Produto QA",
          preco: 150,
          descricao: "Produto QA",
          quantidade: 20,
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.eq(
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        );
        expect(response.body).to.not.have.property("_id");
      });
    });
  });

  context("GET /produtos/{_id}", () => {
    it("Buscar produto por ID", () => {
      const data = {
        nome: "Teste Produto QA",
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      };
      cy.addItem({
        route: "/produtos",
        data,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.getItem({
          route: "produtos",
          _id,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "/produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Buscar produto por ID inexistente", () => {
      cy.getItem({
        route: "produtos",
        _id: "testeID",
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Produto não encontrado");
      });
    });
  });

  context("DELETE /produtos/{_id})", () => {
    it("Excluir produto com sucesso", () => {
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
          expect(response.status).to.eq(200);
          expect(response.body.message).to.eq("Registro excluído com sucesso");
          cy.getItem({ route: "/produtos", _id }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq("Produto não encontrado");
          });
        });
      });
    });

    it("Excluir produto inexistente", () => {
      cy.deleteItem({
        route: "/produtos",
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq("Nenhum registro excluído");
      });
    });

    it("Excluir produto com token ausente", () => {
      const data = {
        nome: "Teste Produto QA",
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      };
      cy.addItem({
        route: "/produtos",
        data,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.deleteItem({ route: "/produtos", _id }).then((response) => {
          expect(response.status).to.eq(401);
          expect(response.body.message).to.eq(
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
          );
          cy.getItem({ route: "/produtos", _id }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.nome).to.eq(data.nome);
            expect(response.body.preco).to.eq(data.preco);
            expect(response.body.descricao).to.eq(data.descricao);
            expect(response.body.quantidade).to.eq(data.quantidade);
            expect(response.body._id).to.eq(_id);

            cy.deleteItem({
              route: "produtos",
              _id,
              token: Cypress.env("USER_TOKEN"),
            });
          });
        });
      });
    });

    it("Excluir produto que faz parte de um carrinho", () => {
      cy.addItemToCart(Cypress.env("USER_TOKEN")).then((cartResponse) => {
        const productId = cartResponse.productId;
        const cartId = cartResponse.response.body._id;
        cy.deleteItem({
          route: "produtos",
          _id: productId,
          token: Cypress.env("USER_TOKEN"),
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Não é permitido excluir produto que faz parte de carrinho"
          );
          expect(response.body.idCarrinhos[0]).to.eq(cartId);

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

  context("PUT /produtos/{_id}", () => {
    it("Alterar nome do produto", () => {
      cy.editItem({
        route: "/produtos",
        data: { nome: "TESTANDO NEW COMMAND" },
        token: Cypress.env("USER_TOKEN"),
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "/produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq("TESTANDO NEW COMMAND");
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "/produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Alterar preço do produto", () => {
      cy.editItem({
        route: "/produtos",
        data: { preco: 250 },
        token: Cypress.env("USER_TOKEN"),
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "/produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(250);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "/produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Alterar descrição do produto", () => {
      cy.editItem({
        route: "/produtos",
        data: { descricao: "Altera Descrição" },
        token: Cypress.env("USER_TOKEN"),
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "/produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq("Altera Descrição");
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "/produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Alterar quantidade do produto", () => {
      cy.editItem({
        route: "/produtos",
        data: { quantidade: 50 },
        token: Cypress.env("USER_TOKEN"),
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "/produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(50);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "/produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Cadastrar produto utilizando PUT", () => {
      const uniqueProduct = Date.now();
      const data = {
        nome: `PUT QA - ${uniqueProduct}`,
        preco: 50,
        descricao: "Teste QA",
        quantidade: 300,
      };

      cy.addItem({
        route: "/produtos",
        data,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.getItem({ route: "/produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "/produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Alterar para nome de produto já existente", () => {
      cy.addItem({
        route: "/produtos",
        data: {
          nome: "TESTE QA DUP",
          preco: 150,
          descricao: "Produto QA",
          quantidade: 20,
        },
        token: Cypress.env("USER_TOKEN"),
      }).then(() => {
        cy.editItem({
          route: "/produtos",
          data: { nome: "TESTE QA DUP" },
          token: Cypress.env("USER_TOKEN"),
        }).then(({ response, _id }) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Já existe produto com esse nome"
          );

          cy.deleteItem({
            route: "/produtos",
            _id,
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Editar produto com token ausente", () => {
      const data = {
        mome: "Teste Produto QA",
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      };
      cy.addItem({
        route: "produtos",
        data,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "PUT",
          url: `https://serverest.dev/produtos/${_id}`,
          body: data,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(401);
          expect(response.body.message).to.eq(
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
          );
          expect(response.body).to.not.have.property("_id");

          cy.deleteItem({
            route: "produtos",
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
