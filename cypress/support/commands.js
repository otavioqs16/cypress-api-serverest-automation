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
Cypress.Commands.add("addItem", ({ route, data, token }) => {
  cy.request({
    method: "POST",
    url: `${Cypress.config("baseUrl")}/${route}`,
    body: data,
    headers: {
      Authorization: token,
    },
    failOnStatusCode: false,
  }).then((response) => {
    return response;
  });
});

Cypress.Commands.add("addItemToCart", (token) => {
  // Adicionando o produto
  cy.addItem({
    route: "produtos",
    data: Cypress.env("PRODUCT_DATA"),
    token,
  }).then((response) => {
    const productId = response.body._id;
    // Adicionando o produto cadastrado ao carrinho
    cy.addItem({
      route: "carrinhos",
      data: {
        produtos: [
          {
            idProduto: productId,
            quantidade: Cypress.env("QUANTIDADE") - 10,
          },
        ],
      },
      token,
    }).then((response) => {
      return { response, productId };
    });
  });
});

Cypress.Commands.add("getItem", ({ route, _id }) => {
  cy.request({
    method: "GET",
    url: `${Cypress.config("baseUrl")}/${route}/${_id}`,
    failOnStatusCode: false,
  }).then((response) => {
    return response;
  });
});

Cypress.Commands.add("editItem", ({ route, data = {}, token }) => {
  // Cadastra item default com base na rota
  const setData = (route) => {
    const routeData = {
      usuarios: {
        nome: Cypress.env("NOME"),
        email: Cypress.env("EMAIL"),
        password: Cypress.env("PASSWORD"),
        administrador: Cypress.env("ADMIN"),
      },
      produtos: {
        nome: Cypress.env("NOME_PRODUTO"),
        preco: Cypress.env("PRECO"),
        descricao: Cypress.env("DESCRICAO"),
        quantidade: Cypress.env("QUANTIDADE"),
      },
    };

    return routeData[route];
  };

  // Edita o item que foi adicionado, com base na rota e no parâmetro passado em "data"
  const setBody = (route, data) => {
    const bodyData = {
      usuarios: {
        nome: data.nome || Cypress.env("NOME"),
        email: data.email || Cypress.env("EMAIL"),
        password: data.password || Cypress.env("PASSWORD"),
        administrador: data.admin || Cypress.env("ADMIN"),
      },
      produtos: {
        nome: data.nome || Cypress.env("NOME_PRODUTO"),
        preco: data.preco || Cypress.env("PRECO"),
        descricao: data.descricao || Cypress.env("DESCRICAO"),
        quantidade: data.quantidade || Cypress.env("QUANTIDADE"),
      },
    };

    return bodyData[route];
  };

  cy.addItem({
    route,
    data: setData(route),
    token,
  }).then((response) => {
    const _id = response.body._id;
    cy.request({
      method: "PUT",
      url: `${Cypress.config("baseUrl")}/${route}/${_id}`,
      body: setBody(route, data),
      headers: {
        Authorization: token,
      },
      failOnStatusCode: false,
    }).then((response) => {
      return { response, data: setBody(route, data), _id };
    });
  });
});

Cypress.Commands.add("deleteItem", ({ route, _id = "testeID", token }) => {
  // Para verificar o caso de deletar um registro inexistente, basta chamar o comando e não passar o parâmetro "_id"
  cy.request({
    method: "DELETE",
    url: `${Cypress.config("baseUrl")}/${route}/${_id}`,
    headers: {
      Authorization: token,
    },
    failOnStatusCode: false,
  }).then((response) => {
    return response;
  });
});
