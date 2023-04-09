describe('Project Screen Tests', () => {
    beforeEach(() => cy.visit('http://127.0.0.1:5173/project'));

    it('should update the map name', () => {
        cy.get('#project-namefield').should('not.exist');
        cy.get('#project-name').dblclick();

        cy.get('#project-namefield')
          .clear()
          .type('Cypress Map{enter}');
        
        cy.get('#project-namefield').should('not.exist');
        cy.get('#project-name').should('contain.text', 'Cypress Map');
    });

    it('should update the comments button', () => {
        cy.get('#unfilled-comment')
          .should('be.visible')
          .click();

        cy.get('#filled-comment')
          .should('be.visible')
          .click();
        
        cy.get('#unfilled-comment').should('be.visible');
    });

    it('should exit the project', () => {
      cy.get('#menu-button').click();

      cy.contains('Exit project')
        .click();
      
      cy.location('pathname').should((path) => 
        expect(path).to.include('/discover')
      );
    })
});

export{}