import { login, logout, upload } from './account'

describe('Project Screen Tests', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/project/default'))

  it('should update the map name', () => {
    cy.get('#project-namefield').should('not.exist')
    cy.get('#project-name').dblclick()

    cy.get('#project-namefield').clear().type('Cypress Map{enter}')

    cy.get('#project-namefield').should('not.exist')
    cy.get('#project-name').should('contain.text', 'Cypress Map')
  })

  it('should exit the project', () => {
    cy.get('#menu-button').click()

    cy.contains('Exit project').click()

    cy.location('pathname').should((path) =>
      expect(path).to.include('/discover')
    )
  })
})

describe('Project Nav Bar Tests', () => {
  beforeEach(() => {
    login()
    upload()
  })
  afterEach(() => logout())

  it('should download a geojson', () => {
    cy.get('#menu-button').click()

    cy.contains('Download as').invoke('show').click({ force: true }).click()

    cy.contains('GeoJSON').should('exist').click()
    cy.readFile('cypress/downloads/test.geo.json').should('exist')
  })

  it('should download a shapefile zip', () => {
    cy.get('#menu-button').click()

    cy.contains('Download as').invoke('show').click({ force: true }).click()

    cy.contains('Shapefile').should('exist').click()
    cy.readFile('cypress/downloads/test.geo.json').should('exist')
  })
})

export {}
