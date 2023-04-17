import { login, logout } from './account'

describe('Add Map Dialog Tests', () => {
  beforeEach(() => {
    login()
  })

  afterEach(() => {
    logout()
  })

  it('should display and hide the dialog', () => {
    cy.get('#add-dialog').should('not.exist')

    cy.get('#add-project').should('be.visible').click()
    cy.get('#add-dialog').should('be.visible')
    cy.get('#close-dialog').should('be.visible').click()
    cy.get('#add-dialog').should('not.exist')

    cy.get('#add-project').should('be.visible').click()
    cy.get('#add-dialog').should('be.visible')
    cy.get('#close-dialog').should('be.visible').click()
  })

  it('should check a radio button', () => {
    cy.get('#add-project').should('be.visible').click()

    cy.get('[type="radio"]').check('geojson')

    cy.get('[type="radio"]').check('shapefile')

    cy.get('#Shapefile').should('be.checked')

    cy.get('#geojson').should('not.be.checked')
    cy.get('#close-dialog').should('be.visible').click()
  })

  it('should error when map name is empty', () => {
    cy.get('#add-project').should('be.visible').click()
    cy.get('[type="radio"]').check('geojson')
    cy.contains('Submit').should('exist').click()

    cy.get('#error-dialog').should('exist')
    cy.contains('Close').should('exist').click()
    cy.get('#close-dialog').should('be.visible').click()
  })

  it('should error when map name is empty', () => {
    cy.get('#add-project').should('be.visible').click()
    cy.get('#map-name').type('test')
    cy.contains('Submit').should('exist').click()

    cy.get('#error-dialog').should('exist')
    cy.contains('Close').should('exist').click()
    cy.get('#close-dialog').should('be.visible').click()
  })

  it('should import a file then go to project page', () => {
    cy.get('#add-project').should('be.visible').click()
    cy.get('#add-dialog').should('be.visible')
    cy.get('[type="radio"]').check('geojson')

    cy.get('input[type=file]').selectFile('cypress/fixtures/mock.geo.json', {
      force: true,
    })
    cy.get('#map-name').type('test')

    cy.contains('Submit').should('exist').click()
    cy.location('pathname').should((path) =>
      expect(path).to.include('/project')
    )
  })
})

export {}
