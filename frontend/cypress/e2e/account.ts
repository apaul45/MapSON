const username = Cypress.env('CYPRESS_USER')
const password = Cypress.env('CYPRESS_PASSWORD')

export const login = () => {
  cy.visit('http://127.0.0.1:5173/login')
  cy.get('#username').type(username)
  cy.get('#password').type(password)

  cy.contains('Login').click()
  cy.location('pathname').should((path) => expect(path).to.include('/home'))
  cy.get('#user-menu-button').should('exist')
}

export const logout = () => {
  cy.get('#user-menu-button').should('exist').click()

  cy.contains('Logout').should('exist').click()

  cy.location('pathname').should((path) => expect(path).to.deep.equal('/'))
}

// will not be needed once real mapcards are implemented on home page
export const upload = () => {
  cy.get('#add-project').should('be.visible').click()
  cy.get('#add-dialog').should('be.visible')
  cy.get('[type="radio"]').check('geojson')

  cy.get('input[type=file]').selectFile('cypress/fixtures/mock.geo.json', {
    force: true,
  })
  cy.get('#map-name').type('test')

  cy.contains('Submit').should('exist').click()
  cy.location('pathname').should((path) => expect(path).to.include('/project'))
}
