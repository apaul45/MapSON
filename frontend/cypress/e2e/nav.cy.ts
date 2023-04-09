describe('Navigation Bar Tests', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/'))

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
    cy.get('#search-field').should('not.exist');

    cy.contains('Discover')
      .should('not.have.class', 'selected-nav-btn')
      .click();

    cy.location('pathname').should((path) => 
      expect(path).to.include('/discover')
    );

    cy.get('#search-field').should('be.visible');
    cy.contains('Discover').should('have.class', 'selected-nav-btn');
  });

  it('should go to project', () => {
    cy.visit('http://127.0.0.1:5173/project');
    cy.get('#main-nav').should('not.exist');
  });
});

export{}