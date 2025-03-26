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

  context("GET /carrinhos", () => {
    it("Consultar lista de carrinhos", () => {
      cy.getItem({ route: "/carrinhos", _id: "" }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.a("number");
        expect(response.body.carrinhos).to.be.a("array");
        expect(response.body.carrinhos).to.have.lengthOf(quantity);
        expect(response.body.carrinhos[0]).to.have.property("produtos");
        expect(response.body.carrinhos[0]).to.have.property("precoTotal");
        expect(response.body.carrinhos[0]).to.have.property("quantidadeTotal");
        expect(response.body.carrinhos[0]).to.have.property("idUsuario");
        expect(response.body.carrinhos[0]).to.have.property("_id");
        expect(response.body.carrinhos[0].produtos).to.be.a("array");
        expect(response.body.carrinhos[0].produtos[0]).to.have.property(
          "idProduto"
        );
        expect(response.body.carrinhos[0].produtos[0]).to.have.property(
          "quantidade"
        );
        expect(response.body.carrinhos[0].produtos[0]).to.have.property(
          "precoUnitario"
        );
      });
    });

    it("Consultar carrinho pelo _id", () => {
      const expectedResult = {
        quantidade: 1,
        carrinhos: [
          {
            produtos: [
              {
                idProduto: "BeeJh5lz3k6kSIzA",
                quantidade: 2,
                precoUnitario: 470,
              },
              {
                idProduto: "K6leHdftCeOJj8BJ",
                quantidade: 1,
                precoUnitario: 5240,
              },
            ],
            precoTotal: 6180,
            quantidadeTotal: 3,
            idUsuario: "0uxuPY0cbmQhpEz1",
            _id: "qbMqntef4iTOwWfg",
          },
        ],
      };
      cy.request({
        method: "GET",
        url: "https://serverest.dev/carrinhos?_id=qbMqntef4iTOwWfg",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResult);
      });
    });

    it("Consultar carrinho por _id inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/carrinhos?_id=TesteID",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.carrinhos).to.have.lengthOf(0);
      });
    });

    it("Consultar carrinho por preço total", () => {
      const expectedResult = {
        quantidade: 1,
        carrinhos: [
          {
            produtos: [
              {
                idProduto: "BeeJh5lz3k6kSIzA",
                quantidade: 2,
                precoUnitario: 470,
              },
              {
                idProduto: "K6leHdftCeOJj8BJ",
                quantidade: 1,
                precoUnitario: 5240,
              },
            ],
            precoTotal: 6180,
            quantidadeTotal: 3,
            idUsuario: "0uxuPY0cbmQhpEz1",
            _id: "qbMqntef4iTOwWfg",
          },
        ],
      };
      cy.request({
        method: "GET",
        url: "https://serverest.dev/carrinhos?precoTotal=6180",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResult);
      });
    });

    it("Consultar carrinho por preço total inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/carrinhos?precoTotal=128398329",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.carrinhos).to.have.lengthOf(0);
      });
    });

    it("Consultar carrinho pela quantidade total", () => {
      const expectedResult = {
        quantidade: 1,
        carrinhos: [
          {
            produtos: [
              {
                idProduto: "BeeJh5lz3k6kSIzA",
                quantidade: 2,
                precoUnitario: 470,
              },
              {
                idProduto: "K6leHdftCeOJj8BJ",
                quantidade: 1,
                precoUnitario: 5240,
              },
            ],
            precoTotal: 6180,
            quantidadeTotal: 3,
            idUsuario: "0uxuPY0cbmQhpEz1",
            _id: "qbMqntef4iTOwWfg",
          },
        ],
      };
      cy.request({
        method: "GET",
        url: "https://serverest.dev/carrinhos?quantidadeTotal=3",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResult);
      });
    });

    it("Consultar carrinho por quantidade total inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/carrinhos?quantidadeTotal=12390329",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.carrinhos).to.have.lengthOf(0);
      });
    });

    it("Consultar carrinho pelo idUsuario", () => {
      const expectedResult = {
        quantidade: 1,
        carrinhos: [
          {
            produtos: [
              {
                idProduto: "BeeJh5lz3k6kSIzA",
                quantidade: 2,
                precoUnitario: 470,
              },
              {
                idProduto: "K6leHdftCeOJj8BJ",
                quantidade: 1,
                precoUnitario: 5240,
              },
            ],
            precoTotal: 6180,
            quantidadeTotal: 3,
            idUsuario: "0uxuPY0cbmQhpEz1",
            _id: "qbMqntef4iTOwWfg",
          },
        ],
      };
      cy.request({
        method: "GET",
        url: "https://serverest.dev/carrinhos?idUsuario=0uxuPY0cbmQhpEz1",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResult);
      });
    });

    it("Consultar carrinho por idUsuario inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/carrinhos?idUsuario=TesteID",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.carrinhos).to.have.lengthOf(0);
      });
    });
  });

  context("POST /carrinhos", () => {
    it("Cadastrar carrinho com sucesso", () => {
      const addCar = {
        produtos: [
          {
            idProduto: "BeeJh5lz3k6kSIzA",
            quantidade: 1,
          },
          {
            idProduto: "K6leHdftCeOJj8BJ",
            quantidade: 3,
          },
        ],
      };

      cy.addItem({
        route: "/carrinhos",
        data: addCar,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.deleteItem({
          route: "/carrinhos/cancelar-compra",
          _id: "",
          token: Cypress.env("USER_TOKEN"),
        });
      });
    });

    it("Cadastrar carrinho com produto duplicado", () => {
      const addCar = {
        produtos: [
          {
            idProduto: "BeeJh5lz3k6kSIzA",
            quantidade: 1,
          },
          {
            idProduto: "BeeJh5lz3k6kSIzA",
            quantidade: 3,
          },
        ],
      };

      cy.addItem({
        route: "/carrinhos",
        data: addCar,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq(
          "Não é permitido possuir produto duplicado"
        );
      });
    });

    it("Cadastrar mais de 1 carrinho para o mesmo usuário", () => {
      const addCar = {
        produtos: [
          {
            idProduto: "BeeJh5lz3k6kSIzA",
            quantidade: 1,
          },
          {
            idProduto: "K6leHdftCeOJj8BJ",
            quantidade: 3,
          },
        ],
      };

      cy.addItem({
        route: "/carrinhos",
        data: addCar,
        token: Cypress.env("USER_TOKEN"),
      }).then(() => {
        cy.addItem({
          route: "/carrinhos",
          data: addCar,
          token: Cypress.env("USER_TOKEN"),
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Não é permitido ter mais de 1 carrinho"
          );

          cy.deleteItem({
            route: "/carrinhos/cancelar-compra",
            _id: "",
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Cadastrar carrinho com produto não encontrado", () => {
      const addCar = {
        produtos: [
          {
            idProduto: "TesteID",
            quantidade: 1,
          },
        ],
      };

      cy.addItem({
        route: "/carrinhos",
        data: addCar,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Produto não encontrado");
      });
    });

    it("Cadastrar carrinho com produto com saldo insuficiente", () => {
      const addCar = {
        produtos: [
          {
            idProduto: "BeeJh5lz3k6kSIzA",
            quantidade: 400,
          },
        ],
      };

      cy.addItem({
        route: "/carrinhos",
        data: addCar,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq(
          "Produto não possui quantidade suficiente"
        );
      });
    });

    it("Cadastrar carrinho com token ausente", () => {
      const addCar = {
        produtos: [
          {
            idProduto: "BeeJh5lz3k6kSIzA",
            quantidade: 400,
          },
        ],
      };

      cy.addItem({ route: "/carrinhos", data: addCar }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.eq(
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        );
      });
    });
  });

  context("GET /carrinhos/{_id}", () => {
    it("Buscar carrinho por ID", () => {
      const addCar = {
        produtos: [
          {
            idProduto: "BeeJh5lz3k6kSIzA",
            quantidade: 1,
          },
        ],
      };

      cy.addItem({
        route: "/carrinhos",
        data: addCar,
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        const _id = response.body._id;
        const expectedResult = {
          produtos: [
            {
              idProduto: "BeeJh5lz3k6kSIzA",
              quantidade: 1,
              precoUnitario: 470,
            },
          ],
          precoTotal: 470,
          quantidadeTotal: 1,
          idUsuario: Cypress.env("USER_ID"),
          _id: _id,
        };

        cy.getItem({ route: "/carrinhos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.deep.equal(expectedResult);

          cy.deleteItem({
            route: "/carrinhos/cancelar-compra",
            _id: "",
            token: Cypress.env("USER_TOKEN"),
          });
        });
      });
    });

    it("Buscar carrinho por ID inexistente", () => {
      cy.getItem({ route: "/carrinhos", _id: "IdInexistente" }).then(
        (response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq("Carrinho não encontrado");
        }
      );
    });
  });

  context("DELETE /carrinhos/concluir-compra", () => {
    it("Excluir carrinho após concluir compra", () => {
      cy.addItemToCart(Cypress.env("USER_TOKEN")).then((cartResponse) => {
        const productId = cartResponse.productId;
        cy.getItem({ route: "produtos", _id: productId }).then((response) => {
          expect(response.body.quantidade).to.eq(10); // Validando se a quantidade do produto foi decrementada

          cy.request({
            method: "DELETE",
            url: "https://serverest.dev/carrinhos/concluir-compra",
            headers: {
              Authorization: Cypress.env("USER_TOKEN"),
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq(
              "Registro excluído com sucesso"
            );

            cy.getItem({ route: "produtos", _id: productId }).then(
              (response) => {
                expect(response.body.quantidade).to.eq(10);

                cy.deleteItem({
                  route: "produtos",
                  _id: productId,
                  token: Cypress.env("USER_TOKEN"),
                });
              }
            );
          });
        });
      });
    });

    it("Excluir carrinho inexistente após concluir compra", () => {
      cy.deleteItem({
        route: "/carrinhos/concluir-compra",
        _id: "",
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq(
          "Não foi encontrado carrinho para esse usuário"
        );
      });
    });

    it("Excluir carrinho após concluir compra com token ausente", () => {
      cy.deleteItem({
        route: "/carrinhos/concluir-compra",
        _id: "",
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.eq(
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        );
      });
    });
  });

  context("DELETE /carrinhos/cancelar-compra", () => {
    it("Excluir carrinho ao cancelar compra", () => {
      cy.addItemToCart(Cypress.env("USER_TOKEN")).then((cartResponse) => {
        const productId = cartResponse.productId;
        const cartId = cartResponse.response.body._id;
        cy.getItem({ route: "produtos", _id: productId }).then((response) => {
          expect(response.body.quantidade).to.eq(10); // Validando se a quantidade do produto foi decrementada

          cy.request({
            method: "DELETE",
            url: "https://serverest.dev/carrinhos/cancelar-compra",
            headers: {
              Authorization: Cypress.env("USER_TOKEN"),
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq(
              "Registro excluído com sucesso. Estoque dos produtos reabastecido"
            );

            cy.getItem({ route: "carrinhos", _id: cartId }).then((response) => {
              expect(response.status).to.eq(400);
              expect(response.body.message).to.eq("Carrinho não encontrado");

              cy.getItem({ route: "produtos", _id: productId }).then(
                (response) => {
                  expect(response.body.quantidade).to.eq(20);

                  cy.deleteItem({
                    route: "produtos",
                    _id: productId,
                    token: Cypress.env("USER_TOKEN"),
                  });
                }
              );
            });
          });
        });
      });
    });

    it("Excluir carrinho inexistente após cancelar compra", () => {
      cy.deleteItem({
        route: "/carrinhos/cancelar-compra",
        _id: "",
        token: Cypress.env("USER_TOKEN"),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq(
          "Não foi encontrado carrinho para esse usuário"
        );
      });
    });

    it("Excluir carrinho após cancelar compra com token ausente", () => {
      cy.deleteItem({
        route: "/carrinhos/cancelar-compra",
        _id: "",
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.eq(
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
        );
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
