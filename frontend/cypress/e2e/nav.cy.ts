describe('Navigation Bar Tests', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/'))

  it('should change the url', () => {
    cy.contains('Home')
      .should('not.have.class', 'bg-navbar-hover')
      .click();

    cy.location('pathname').should((path) => 
      expect(path).to.include('/home')
    );

    cy.contains('Home').should('have.class', 'bg-navbar-hover');
  });

  it('should change the url', () => {
    cy.get('#search-field').should('not.exist');

    cy.contains('Discover')
      .should('not.have.class', 'bg-navbar-hover')
      .click();

    cy.location('pathname').should((path) => 
      expect(path).to.include('/discover')
    );

    cy.get('#search-field').should('be.visible');
    cy.contains('Discover').should('have.class', 'bg-navbar-hover');
  });
});

export{}