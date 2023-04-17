const username = Cypress.env('CYPRESS_USER')
const password = Cypress.env('CYPRESS_PASSWORD')

export const login = () => {
  cy.visit('http://127.0.0.1:5173/login')
  cy.get('#username').type(username)
  cy.get('#password').type(password)

  cy.contains('Login').click()
  cy.location('pathname').should((path) => expect(path).to.include('/home'))
}

export const logout = () => {
  cy.get('#user-menu-button').should('exist').click()

  cy.contains('Logout').should('exist').click()

  cy.location('pathname').should((path) => expect(path).to.deep.equal('/'))
}
