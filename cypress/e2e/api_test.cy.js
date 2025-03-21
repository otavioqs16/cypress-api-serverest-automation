const token = window.localStorage.getItem("serverest/userToken");
const email = "fulano@qa.com";

describe("API Tests - ServeRest", () => {
  beforeEach(() => {
    cy.session(email, () => {
      cy.request("POST", "https://serverest.dev/login", {
        email: email,
        password: "teste",
      }).then((response) => {
        window.localStorage.setItem(
          "serverest/userToken",
          response.body.authorization
        );
      });
    });
  });

  context("GET /usuarios", () => {
    it("Listar usuários cadastrados", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios",
      }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.a("number");
        expect(response.body.quantidade).to.be.greaterThan(0);
        expect(response.body.usuarios).to.be.a("array");
        expect(response.body.usuarios).to.have.lengthOf(quantity);
      });
    });
    it("Consultar usuário pelo _id", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?_id=0uxuPY0cbmQhpEz1",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(1);
        expect(response.body.usuarios[0]._id).to.eq("0uxuPY0cbmQhpEz1");
        expect(response.body.usuarios).to.have.lengthOf(1);
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
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?nome=Fulano da Silva",
      }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.greaterThan(0);
        for (let i = 0; i < response.body.usuarios.length; i++) {
          expect(response.body.usuarios[i].nome).to.eq("Fulano da Silva");
        }
        expect(response.body.usuarios).to.have.lengthOf(quantity);
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
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios?email=fulano@qa.com",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(1);
        expect(response.body.usuarios[0].email).to.eq("fulano@qa.com");
        expect(response.body.usuarios).to.have.lengthOf(1);
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

        cy.deleteUser(_id);
      });
    });

    it("Cadastrar usuário com e-mail já cadastrado", () => {
      cy.request({
        method: "POST",
        url: "https://serverest.dev/usuarios",
        body: {
          nome: "QA Automation",
          email: email,
          password: "tester123",
          administrador: "true",
        },
        failOnStatusCode: false,
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
          email: email,
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
      cy.request({
        method: "GET",
        url: "https://serverest.dev/usuarios/0uxuPY0cbmQhpEz1",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.nome).to.eq("Fulano da Silva");
        expect(response.body.email).to.eq(email);
        expect(response.body.password).to.eq("teste");
        expect(response.body.administrador).to.eq("true");
        expect(response.body._id).to.eq("0uxuPY0cbmQhpEz1");
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
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");
        const _id = response.body._id;

        cy.deleteUser(_id);
      });
    });
    it("Excluir usuário inexistente", () => {
      cy.deleteUser();

      // Adicionar Teste: Usuário com carrinho cadastrado
    });
  });

  context("PUT /usuarios/{_id}", () => {
    it("Alterar nome do usuário", () => {
      cy.editUser({ nome: "QA Automation 2" });
    });

    it("Alterar e-mail do usuário", () => {
      cy.editUser({ email: "apiAutomation@qa.com" });
    });

    it("Alterar password do usuário", () => {
      cy.editUser({ password: "testeQA123" });
    });

    it("Alterar permissão do usuário", () => {
      cy.editUser({ admin: "false" });
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

        cy.deleteUser(_id);
      });
    });

    it("Alterar para e-mail já cadastrado", () => {
      cy.editUserWithRegisteredEmail(email);
    });
  });

  context("GET /produtos", () => {
    it("Listar produtos cadastrados", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos",
      }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.be.a("number");
        expect(response.body.quantidade).to.be.greaterThan(0);
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
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?nome=Teste Produto QA - 1742581566577",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(1);
        expect(response.body.produtos[0].nome).to.eq(
          "Teste Produto QA - 1742581566577"
        );
        expect(response.body.produtos).to.have.lengthOf(1);
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
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?preco=470",
      }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(quantity);
        for (let i = 0; i < response.body.produtos.length; i++) {
          expect(response.body.produtos[i].preco).to.eq(470);
        }
        expect(response.body.produtos).to.have.lengthOf(quantity);
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
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?descricao=Mouse",
      }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(quantity);
        for (let i = 0; i < response.body.produtos.length; i++) {
          expect(response.body.produtos[i].descricao.toLowerCase()).to.include(
            "mouse"
          );
        }
        expect(response.body.produtos).to.have.lengthOf(quantity);
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
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos?quantidade=200",
      }).then((response) => {
        const quantity = response.body.quantidade;
        expect(response.status).to.eq(200);
        expect(response.body.quantidade).to.eq(quantity);
        for (let i = 0; i < response.body.produtos.length; i++) {
          expect(response.body.produtos[i].quantidade).to.eq(200);
        }
        expect(response.body.produtos).to.have.lengthOf(quantity);
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
      const data = {
        nome: `Teste Produto QA - ${Date.now()}`,
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      };
      cy.addItem({ route: "/produtos", data, token }).then((response) => {
        const _id = response.body._id;
        expect(response.status).to.eq(201);
        expect(response.body.message).to.eq("Cadastro realizado com sucesso");
        expect(response.body._id).to.be.a("string");

        cy.deleteItem({ route: "/produtos", _id, token });
      });
    });

    it("Cadastrar produto com nome já cadastrado", () => {
      const data = {
        nome: "Logitech MX Vertical",
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      };
      cy.addItem({ route: "/produtos", data, token }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Já existe produto com esse nome");
        expect(response.body).to.not.have.property("_id");
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
        token,
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
        token,
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
        token,
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
        nome: `Teste Produto QA - ${Date.now()}`,
        preco: 150,
        descricao: "Produto QA",
        quantidade: 20,
      };
      cy.addItem({
        route: "/produtos",
        data,
        token,
      }).then((response) => {
        const _id = response.body._id;
        cy.request({
          method: "GET",
          url: `https://serverest.dev/produtos/${_id}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(data.nome);
          expect(response.body.preco).to.eq(data.preco);
          expect(response.body.descricao).to.eq(data.descricao);
          expect(response.body.quantidade).to.eq(data.quantidade);
          expect(response.body._id).to.eq(_id);

          cy.deleteItem({ route: "/produtos", _id, token });
        });
      });
    });

    it("Buscar produto por ID inexistente", () => {
      cy.request({
        method: "GET",
        url: "https://serverest.dev/produtos/testeID",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.eq("Produto não encontrado");
      });
    });
  });
});
