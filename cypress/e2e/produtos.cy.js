const productData = Cypress.env("PRODUCT_DATA");
let token, userId;

describe("ServeRest API Tests - Produtos", () => {
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
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/produtos?_id=${productId}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(1);
          expect(response.body.produtos[0]._id).to.eq(productId);
          expect(response.body.produtos).to.have.lengthOf(1);

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Consultar produto por _id inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/produtos?_id=123`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });

    it("Consultar produto pelo nome", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/produtos?nome=${Cypress.env(
            "NOME_PRODUTO"
          )}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(1);
          expect(response.body.produtos[0].nome).to.eq(
            Cypress.env("NOME_PRODUTO")
          );
          expect(response.body.produtos).to.have.lengthOf(1);

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Consultar produto por nome inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config(
          "baseUrl"
        )}/produtos?nome=Teste nome inexistente`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });

    it("Consultar produto pelo preço", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/produtos?preco=${Cypress.env(
            "PRECO"
          )}`,
        }).then((response) => {
          const quantity = response.body.quantidade;
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(quantity);
          for (let i = 0; i < response.body.produtos.length; i++) {
            expect(response.body.produtos[i].preco).to.eq(Cypress.env("PRECO"));
          }
          expect(response.body.produtos).to.have.lengthOf(quantity);

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Consultar produto por preço inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/produtos?preco=3203920392302930`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });

    it("Consultar produto pela descrição", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/produtos?descricao=${Cypress.env(
            "DESCRICAO"
          )}`,
        }).then((response) => {
          const quantity = response.body.quantidade;
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(quantity);
          for (let i = 0; i < response.body.produtos.length; i++) {
            expect(response.body.produtos[i].descricao).to.eq(
              Cypress.env("DESCRICAO")
            );
          }
          expect(response.body.produtos).to.have.lengthOf(quantity);

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Consultar produto por descrição inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config(
          "baseUrl"
        )}/produtos?descricao=Teste Descrição Inexistente`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(0);
        expect(response.body.produtos).to.have.lengthOf(0);
      });
    });

    it("Consultar produto pela quantidade", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        cy.request({
          method: "GET",
          url: `${Cypress.config("baseUrl")}/produtos?quantidade=${Cypress.env(
            "QUANTIDADE"
          )}`,
        }).then((response) => {
          const quantity = response.body.quantidade;
          expect(response.status).to.eq(200);
          expect(response.body.quantidade).to.eq(quantity);
          for (let i = 0; i < response.body.produtos.length; i++) {
            expect(response.body.produtos[i].quantidade).to.eq(
              Cypress.env("QUANTIDADE")
            );
          }
          expect(response.body.produtos).to.have.lengthOf(quantity);

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Consultar produto por quantidade inexistente", () => {
      cy.request({
        method: "GET",
        url: `${Cypress.config("baseUrl")}/produtos?quantidade=123213213213`,
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
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.deleteItem({
          route: "produtos",
          _id: productId,
          token,
        });
      });
    });

    it("Cadastrar produto com nome já cadastrado", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        cy.addItem({
          route: "produtos",
          data: productData,
          token,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Já existe produto com esse nome"
          );
          expect(response.body).to.not.have.property("_id");

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Cadastrar usuário com campos obrigatórios não enviados no body", () => {
      // Nome não enviado
      cy.addItem({
        route: "produtos",
        data: { ...productData, nome: undefined },
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.nome).to.eq("nome é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Preço não enviado
      cy.addItem({
        route: "produtos",
        data: { ...productData, preco: undefined },
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.preco).to.eq("preco é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Descrição não enviada
      cy.addItem({
        route: "produtos",
        data: { ...productData, descricao: undefined },
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.descricao).to.eq("descricao é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });

      // Quantidade não enviada
      cy.addItem({
        route: "produtos",
        data: { ...productData, quantidade: undefined },
        token,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.quantidade).to.eq("quantidade é obrigatório");
        expect(response.body).to.not.have.property("message");
        expect(response.body).to.not.have.property("_id");
      });
    });

    it("Cadastrar produto com token ausente", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
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
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        cy.getItem({
          route: "produtos",
          _id: productId,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(productData.nome);
          expect(response.body.preco).to.eq(productData.preco);
          expect(response.body.descricao).to.eq(productData.descricao);
          expect(response.body.quantidade).to.eq(productData.quantidade);
          expect(response.body._id).to.eq(productId);

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
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
          expect(response.status).to.eq(200);
          expect(response.body.message).to.eq("Registro excluído com sucesso");
          cy.getItem({ route: "produtos", _id: productId }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq("Produto não encontrado");
          });
        });
      });
    });

    it("Excluir produto inexistente", () => {
      cy.deleteItem({
        route: "produtos",
        token,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.eq("Nenhum registro excluído");
      });
    });

    it("Excluir produto com token ausente", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        cy.deleteItem({ route: "produtos", _id: productId }).then(
          (response) => {
            expect(response.status).to.eq(401);
            expect(response.body.message).to.eq(
              "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
            );
            cy.getItem({ route: "produtos", _id: productId }).then(
              (response) => {
                expect(response.status).to.eq(200);
                expect(response.body.nome).to.eq(productData.nome);
                expect(response.body.preco).to.eq(productData.preco);
                expect(response.body.descricao).to.eq(productData.descricao);
                expect(response.body.quantidade).to.eq(productData.quantidade);
                expect(response.body._id).to.eq(productId);

                cy.deleteItem({
                  route: "produtos",
                  _id: productId,
                  token,
                });
              }
            );
          }
        );
      });
    });

    it("Excluir produto que faz parte de um carrinho", () => {
      cy.addItemToCart(token).then((cartResponse) => {
        const productId = cartResponse.productId;
        const cartId = cartResponse.response.body._id;
        cy.deleteItem({
          route: "produtos",
          _id: productId,
          token,
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Não é permitido excluir produto que faz parte de carrinho"
          );
          expect(response.body.idCarrinhos[0]).to.eq(cartId);

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

  context("PUT /produtos/{_id}", () => {
    it("Alterar nome do produto", () => {
      cy.editItem({
        route: "produtos",
        data: { nome: "TESTANDO NEW COMMAND" },
        token,
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq("TESTANDO NEW COMMAND");
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "produtos",
            _id,
            token,
          });
        });
      });
    });

    it("Alterar preço do produto", () => {
      cy.editItem({
        route: "produtos",
        data: { preco: 250 },
        token,
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(250);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "produtos",
            _id,
            token,
          });
        });
      });
    });

    it("Alterar descrição do produto", () => {
      cy.editItem({
        route: "produtos",
        data: { descricao: "Altera Descrição" },
        token,
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq("Altera Descrição");
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "produtos",
            _id,
            token,
          });
        });
      });
    });

    it("Alterar quantidade do produto", () => {
      cy.editItem({
        route: "produtos",
        data: { quantidade: 50 },
        token,
      }).then(({ response, data, _id }) => {
        expect(response.status).to.eq(200);
        cy.getItem({ route: "produtos", _id }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(50);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({
            route: "produtos",
            _id,
            token,
          });
        });
      });
    });

    it("Cadastrar produto utilizando PUT", () => {
      cy.addItem({
        route: "produtos",
        data: productData,
        token,
      }).then((response) => {
        const productId = response.body._id;
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.getItem({ route: "produtos", _id: productId }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(productData.nome);
          expect(response.body.preco).to.eq(productData.preco);
          expect(response.body.descricao).to.eq(productData.descricao);
          expect(response.body.quantidade).to.eq(productData.quantidade);
          expect(response.body._id).to.eq(productId);

          cy.deleteItem({
            route: "produtos",
            _id: productId,
            token,
          });
        });
      });
    });

    it("Alterar para nome de produto já existente", () => {
      cy.addItem({
        route: "produtos",
        data: {
          nome: "TESTE QA DUP",
          preco: 150,
          descricao: "Produto QA",
          quantidade: 20,
        },
        token,
      }).then((response) => {
        const dupProductId = response.body._id;
        cy.editItem({
          route: "produtos",
          data: { nome: "TESTE QA DUP" },
          token,
        }).then(({ response, _id }) => {
          expect(response.status).to.eq(400);
          expect(response.body.message).to.eq(
            "Já existe produto com esse nome"
          );

          cy.deleteItem({
            route: "produtos",
            _id: dupProductId,
            token,
          }).then(() => {
            cy.deleteItem({ route: "produtos", _id, token });
          });
        });
      });
    });

    it("Editar produto com token ausente", () => {
      cy.editItem({ route: "produtos", data: productData }).then(
        ({ response, _id }) => {
          expect(response.status).to.eq(401);
          expect(response.body.message).to.eq(
            "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais"
          );
          expect(response.body).to.not.have.property("_id");

          cy.deleteItem({
            route: "produtos",
            _id,
            token,
          });
        }
      );
    });
  });
});

after(() => {
  cy.deleteItem({ route: "usuarios", _id: userId }).then((response) => {
    expect(response.status).to.eq(200);
  });
});
