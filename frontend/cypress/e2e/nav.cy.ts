import { login, logout } from './account'

describe('Navigation Bar Tests', () => {
  // it('should go to home', () => {
  //   cy.contains('Home')
  //     .should('not.have.class', 'bg-navbar-hover')
  //     .click();

  //   cy.location('pathname').should((path) =>
  //     expect(path).to.include('/home')
  //   );

  //   cy.contains('Home').should('have.class', 'bg-navbar-hover');
  //   cy.get('#main-nav').should('be.visible');
  // });

  it('should go to discover', () => {
    cy.visit('http://127.0.0.1:5173/')
    cy.get('#search-field').should('not.exist')

    cy.contains('Discover').should('not.have.class', 'selected-nav-btn').click()

    cy.location('pathname').should((path) =>
      expect(path).to.include('/discover')
    )

    cy.get('#search-field').should('be.visible')
    cy.contains('Discover').should('have.class', 'selected-nav-btn')
  })

  it('should go to project', () => {
    cy.visit('http://127.0.0.1:5173/project')
    cy.get('#main-nav').should('not.exist')
  })

  it('should create a new map', () => {
    login()
    cy.get('#plus-sign').parent().should('be.visible').click()
    cy.contains('Create new Map').should('be.visible').click()
    cy.location('pathname').should((path) =>
      expect(path).to.include('/project')
    )
    cy.wait(1000)
    logout()
  })

  it('should open add map dialog', () => {
    login()
    cy.get('#plus-sign').parent().should('be.visible').click()
    cy.contains('Import from Shapefile/GeoJSON').should('be.visible').click()
    cy.get('#add-dialog').should('be.visible')
    cy.get('#close-dialog').should('be.visible').click()
    logout()
  })
})

export {}
