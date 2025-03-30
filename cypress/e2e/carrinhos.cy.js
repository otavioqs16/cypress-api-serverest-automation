const productData = Cypress.env("PRODUCT_DATA");

// Carrinho cadastrado por default
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

let token, userId;

describe("ServeRest API Tests - Carrinhos", () => {
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

  context("GET /carrinhos", () => {
    it("Consultar lista de carrinhos", () => {
      cy.getItem({ route: "carrinhos", _id: "" }).then((response) => {
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
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/carrinhos?_id=qbMqntef4iTOwWfg`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResult);
      });
    });

    it("Consultar carrinho por _id inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/carrinhos?_id=TesteID`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.carrinhos).to.have.lengthOf(0);
      });
    });

    it("Consultar carrinho por preço total", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/carrinhos?precoTotal=6180`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResult);
      });
    });

    it("Consultar carrinho por preço total inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/carrinhos?precoTotal=128398329`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.carrinhos).to.have.lengthOf(0);
      });
    });

    it("Consultar carrinho pela quantidade total", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/carrinhos?quantidadeTotal=3`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResult);
      });
    });

    it("Consultar carrinho por quantidade total inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/carrinhos?quantidadeTotal=12390329`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.carrinhos).to.have.lengthOf(0);
      });
    });

    it("Consultar carrinho pelo idUsuario", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config(
          "baseUrl"
        )}/carrinhos?idUsuario=0uxuPY0cbmQhpEz1`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal(expectedResult);
      });
    });

    it("Consultar carrinho por idUsuario inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/carrinhos?idUsuario=TesteID`,
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
        route: "carrinhos",
        data: addCar,
        token,
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.deleteItem({
          route: "/carrinhos/cancelar-compra",
          _id: "",
          token,
        });
      });
    });

    it("Cadastrar carrinho com produto duplicado", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;

        cy.addItem({
          route: "carrinhos",
          data: {
            produtos: [
              {
                idProduto: productId,
                quantidade: 1,
              },
              {
                idProduto: productId,
                quantidade: 1,
              },
            ],
          },
          token,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Não é permitido possuir produto duplicado"
          );

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Cadastrar mais de 1 carrinho para o mesmo usuário", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        const addCar = {
          produtos: [
            {
              idProduto: productId,
              quantidade: 1,
            },
          ],
        };

        cy.addItem({
          route: "carrinhos",
          data: addCar,
          token,
        }).then(() => {
          cy.addItem({
            route: "carrinhos",
            data: addCar,
            token,
          }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq(
              "Não é permitido ter mais de 1 carrinho"
            );

            cy.deleteItem({
              route: "/carrinhos/cancelar-compra",
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
        route: "carrinhos",
        data: addCar,
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Produto não encontrado");
      });
    });

    it("Cadastrar carrinho com produto com saldo insuficiente", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        const addCar = {
          produtos: [
            {
              idProduto: productId,
              quantidade: Cypress.env("QUANTIDADE") + 1,
            },
          ],
        };

        cy.addItem({
          route: "carrinhos",
          data: addCar,
          token,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Produto não possui quantidade suficiente"
          );

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Cadastrar carrinho com token ausente", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        const addCar = {
          produtos: [
            {
              idProduto: productId,
              quantidade: 1,
            },
          ],
        };

        cy.addItem({ route: "carrinhos", data: addCar }).then((response) => {
          expect(response.status).to.eq(401);
          expect(response.body.message).to.eq(
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
          );

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
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
        route: "carrinhos",
        data: addCar,
        token,
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
          idUsuario: userId,
          _id: _id,
        };

        cy.getItem({ route: "carrinhos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.deep.equal(expectedResult);

          cy.deleteItem({
            route: "/carrinhos/cancelar-compra",
            _id: "",
            token,
          });
        });
      });
    });

    it("Buscar carrinho por ID inexistente", () => {
      cy.getItem({ route: "carrinhos", _id: "IdInexistente" }).then(
        (response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq("Carrinho não encontrado");
        }
      );
    });
  });

  context("DELETE /carrinhos/concluir-compra", () => {
    it("Excluir carrinho após concluir compra", () => {
      cy.addItemToCart(token).then((cartResponse) => {
        const productId = cartResponse.productId;
        cy.getItem({ route: "produtos", _id: productId }).then((response) => {
          expect(response.body.quantidade).to.eq(
            Cypress.env("QUANTIDADE") - 10
          ); // Validando se a quantidade do produto foi decrementada

          cy.deleteItem({
            route: "carrinhos/concluir-compra",
            _id: "",
            token,
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
                  token,
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
        token,
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
      cy.addItemToCart(token).then((cartResponse) => {
        const productId = cartResponse.productId;
        const cartId = cartResponse.response.body._id;
        cy.getItem({ route: "produtos", _id: productId }).then((response) => {
          expect(response.body.quantidade).to.eq(10); // Validando se a quantidade do produto foi decrementada

          cy.deleteItem({
            route: "carrinhos/cancelar-compra",
            _id: "",
            token,
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
                    token,
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
        token,
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
    cy.deleteItem({ route: "usuarios", _id: userId }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
