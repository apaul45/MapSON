describe("Add Map Dialog Tests", () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/home'));

  it('should display and hide the dialog', () => {
    cy.get('#add-dialog').should('not.exist')

    cy.get('#add-project').click()
    cy.get('#add-dialog').should('be.visible')
    cy.contains('Submit').click()
    cy.get('#add-dialog').should('not.exist')

    cy.get('#add-project').click()
    cy.get('#add-dialog').should('be.visible')
    cy.get('#close-dialog').click()
    cy.get('#add-dialog').should('not.exist')
  })

  it('should check a radio button', () => {
    cy.get('#add-project').click()

    cy.get('[type="radio"]').check('geojson')

    cy.get('[type="radio"]').check('shapefile')

    cy.get('#Shapefile').should('be.checked')

    cy.get('#geojson').should('not.be.checked')
  })
})

export { }