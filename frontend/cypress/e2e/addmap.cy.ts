const username = Cypress.env('CYPRESS_USER')
const password = Cypress.env('CYPRESS_PASSWORD')

const login = () => {
  cy.visit('http://127.0.0.1:5173/login')
  cy.get('#username').type(username)
  cy.get('#password').type(password)

  cy.contains('Login').click()
  cy.location('pathname').should((path) => expect(path).to.include('/home'))
}

const logout = () => {
  cy.get('#user-menu-button').should('exist').click()

  cy.contains('Logout').should('exist').click()

  cy.location('pathname').should((path) => expect(path).to.deep.equal('/'))
}

describe('Add Map Dialog Tests', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/home'))
  before(() => login())
  after(() => logout())

  it('should display and hide the dialog', () => {
    cy.get('#add-dialog').should('not.exist')

    cy.get('#add-project').should('be.visible').click()
    cy.get('#add-dialog').should('be.visible')
    cy.get('#close-dialog').should('be.visible').click()
    cy.get('#add-dialog').should('not.exist')

    cy.get('#add-project').should('be.visible').click()
    cy.get('#add-dialog').should('be.visible')
  })

  it('should check a radio button', () => {
    cy.get('#add-project').should('be.visible').click()

    cy.get('[type="radio"]').check('geojson')

    cy.get('[type="radio"]').check('shapefile')

    cy.get('#Shapefile').should('be.checked')

    cy.get('#geojson').should('not.be.checked')
  })

  it('should import a file then go to project page', () => {
    cy.get('#add-project').should('be.visible').click()
    cy.get('#add-dialog').should('be.visible')
    cy.get('[type="radio"]').check('geojson')

    cy.get('input[type=file]').selectFile('cypress/fixtures/mock.geo.json')
    cy.get('#map-name').type('test')

    cy.contains('Submit').should('be.visible').click()
    cy.location('pathname').should((path) =>
      expect(path).to.include('/project')
    )
  })
})

export {}
