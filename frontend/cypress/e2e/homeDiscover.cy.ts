describe('Home Screen Tests', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/home'));

  it('should sort by downloads', () => {
    cy.get('#add-project').should('be.visible')
    cy.get('#new-project').should('be.visible')

    cy.contains('Sort by').click()

    cy.get('#sort-menu').should('exist')
    cy.contains('Downloads').click()

    cy.contains('Sort by: Downloads').should('exist')
    cy.get('#sort-menu').should('not.exist')
  })
})

describe('Discover Screen Tests', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/discover'));

  it('should sort by downloads', () => {
    cy.get('#add-project').should('not.exist')
    cy.get('#new-project').should('not.exist')

    cy.contains('Sort by').click()

    cy.get('#sort-menu').should('exist')

    cy.contains('Downloads').click()

    cy.contains('Sort by: Downloads').should('exist')
    cy.get('#sort-menu').should('not.exist')
  })
})