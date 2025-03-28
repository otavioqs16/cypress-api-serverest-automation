const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://serverest.dev/",
    specPattern: [
      "**/usuarios.cy.js",
      "**/produtos.cy.js",
      "**/carrinhos.cy.js",
      "**/rota_admin.cy.js",
    ],
  },
});
