describe("template spec", () => {
  beforeEach(() => {
    cy.request("POST", "https://serverest.dev/login", {
      email: "otavioqs@qa.com.br",
      password: "senha123",
    }).then((response) => {
      window.localStorage.setItem(
        "serverest/userToken",
        response.body.authorization
      );
      cy.log(response.body.authorization);
    });
  });

  it("passes", () => {
    const token = window.localStorage.getItem("serverest/userToken");
    cy.request({
      method: "POST",
      url: "https://serverest.dev/produtos",
      headers: {
        Authorization: token,
      },
      body: {
        nome: "TESTE OTÀVIOASDKASOD",
        preco: 470,
        descricao: "Mouse",
        quantidade: 381,
      },
    }).then((response) => {
      cy.log(response);
    });
  });
});
