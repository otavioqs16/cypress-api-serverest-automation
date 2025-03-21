describe("API Tests - ServeRest", () => {
  it("teste rota protegida", () => {
    cy.request("POST", "https://serverest.dev/login", {
      email: "ayla.barroso@gmail.com",
      password: "teste",
    }).then((response) => {
      const token = response.body.authorization;
      window.localStorage.setItem("serverest/userToken", token);

      cy.addItem({
        route: "/produtos",
        data: {
          nome: "Teste Produto QA",
          preco: 150,
          descricao: "Produto QA",
          quantidade: 20,
        },
        token,
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.message).to.eq(
          "Rota exclusiva para administradores"
        );
        expect(response.body).to.not.have.property("_id");
      });
    });
  });
});
