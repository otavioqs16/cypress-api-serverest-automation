// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("editUser", (data = {}) => {
  const {
    nome = Cypress.env("NOME"),
    email = Cypress.env("EMAIL"),
    password = Cypress.env("PASSWORD"),
    admin = Cypress.env("ADMIN"),
  } = data;

  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: {
      nome: Cypress.env("NOME"),
      email: Cypress.env("EMAIL"),
      password: Cypress.env("PASSWORD"),
      administrador: Cypress.env("ADMIN"),
    },
  }).then((response) => {
    const _id = response.body._id;
    cy.request({
      method: "PUT",
      url: `https://serverest.dev/usuarios/${_id}`,
      body: { nome, email, password, administrador: admin },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200) {
        cy.request({
          method: "GET",
          url: `https://serverest.dev/usuarios/${_id}`,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.nome).to.eq(nome);
          expect(response.body.email).to.eq(email);
          expect(response.body.password).to.eq(password);
          expect(response.body.administrador).to.eq(admin);
          expect(response.body._id).to.eq(_id);

          cy.deleteUser(_id);
        });
      } else if (response.status === 400) {
        expect(response.body.message).to.eq("Este email já está sendo usado");
        cy.deleteUser(_id);
      }
    });
  });
});

Cypress.Commands.add("editUserWithRegisteredEmail", (email) => {
  cy.request({
    method: "POST",
    url: "https://serverest.dev/usuarios",
    body: {
      nome: Cypress.env("NOME"),
      email: Cypress.env("EMAIL"),
      password: Cypress.env("PASSWORD"),
      administrador: Cypress.env("ADMIN"),
    },
  }).then((response) => {
    const _id = response.body._id;
    cy.request({
      method: "PUT",
      url: `https://serverest.dev/usuarios/${_id}`,
      body: {
        nome: Cypress.env("NOME"),
        email: email,
        password: Cypress.env("PASSWORD"),
        administrador: Cypress.env("ADMIN"),
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq("Este email já está sendo usado");
      cy.deleteUser(_id);
    });
  });
});

Cypress.Commands.add("getQtdUsers", () => {
  cy.request({
    method: "GET",
    url: "https://serverest.dev/usuarios",
  }).then((response) => {
    return response.body.quantidade;
  });
});

Cypress.Commands.add("deleteUser", (_id = "testeID") => {
  cy.getQtdUsers().then((qtdUsers) => {
    // Para verificar o caso de deletar um registro inexistente, basta chamar o comando e não passar nenhum parâmetro
    cy.request({
      method: "DELETE",
      url: `https://serverest.dev/usuarios/${_id}`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      if (_id === "testeID") {
        expect(response.body.message).to.eq("Nenhum registro excluído");
        cy.getQtdUsers().then((newQtdUsers) => {
          expect(newQtdUsers).to.eq(qtdUsers);
        });
      } else {
        expect(response.body.message).to.eq("Registro excluído com sucesso");
        cy.getQtdUsers().then((newQtdUsers) => {
          expect(newQtdUsers).to.eq(qtdUsers - 1);
        });
      }
    });
  });
});

Cypress.Commands.add("getQtdItems", (route) => {
  cy.request({
    method: "GET",
    url: `https://serverest.dev/${route}`,
  }).then((response) => {
    return response.body.quantidade;
  });
});

Cypress.Commands.add("deleteItem", ({ route, _id = "testeID", token }) => {
  cy.getQtdItems(route).then((qtdItems) => {
    // Para verificar o caso de deletar um registro inexistente, basta chamar o comando e não passar o parâmetro "_id"
    cy.request({
      method: "DELETE",
      url: `https://serverest.dev/${route}/${_id}`,
      headers: {
        Authorization: token,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.getQtdItems(route).then((newQtdItems) => {
        if (_id === "testeID") {
          expect(response.body.message).to.eq("Nenhum registro excluído");
          expect(newQtdItems).to.eq(qtdItems);
        } else {
          expect(response.body.message).to.eq("Registro excluído com sucesso");
          expect(newQtdItems).to.eq(qtdItems - 1);
        }
      });
    });
  });
});

Cypress.Commands.add("addItem", ({ route, data, token }) => {
  cy.request({
    method: "POST",
    url: `https://serverest.dev/${route}`,
    body: data,
    headers: {
      Authorization: token,
    },
    failOnStatusCode: false,
  }).then((response) => {
    return response;
  });
});
