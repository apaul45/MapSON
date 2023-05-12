import { User } from '../../src/types';
import { createNew, login } from './utils';

describe('Map Card Tests', () => {
  beforeEach(() => {
    login();
    createNew();
    cy.get('#menu-button').should('exist').click();
    cy.get('#menu-option-exit').should('exist').click();
    cy.wait(1000);
  });
  it('should show the delete dialog', () => {
    cy.get('#delete-button').should('exist').click();
    cy.contains('Cancel').should('be.visible').click();
  });

  it('should close the delete dialog and not delete', () => {
    cy.get('#delete-button').should('exist').click();
    cy.contains('Cancel').should('be.visible').click();
    //cy.contains('My Map').should('be.visible');
  });

  it('should delete the map', () => {
    cy.get('#delete-button').should('exist').click();
    cy.contains('Confirm').should('be.visible').click();
    cy.contains('#delete-button').should('not.exist');
  });

  it('should upvote and unupvote a map', () => {
    cy.get('#upvote-count').then(($cnt) => {
      const upvote = Number($cnt.text());

      cy.get('#upvote-button').should('be.visible').click();

      cy.get('#upvote-count').then(($cnt2) => {
        const newUpvote = Number($cnt2.text());
        expect(newUpvote).to.be.greaterThan(upvote);
      });

      cy.get('#upvote-button').should('be.visible').click();

      cy.get('#upvote-count').then(($cnt2) => {
        const newUpvote = Number($cnt2.text());
        expect(newUpvote).to.be.eql(upvote);
      });
    });
  });

  it('should downvote and undownvote a map', () => {
    cy.get('#upvote-count').then(($cnt) => {
      const downvote = Number($cnt.text());

      cy.get('#downvote-button').should('be.visible').click();

      cy.get('#downvote-count').then(($cnt2) => {
        const newUpvote = Number($cnt2.text());
        expect(newUpvote).to.be.greaterThan(downvote);
      });

      cy.get('#downvote-button').should('be.visible').click();

      cy.get('#downvote-count').then(($cnt2) => {
        const newDownvote = Number($cnt2.text());
        expect(newDownvote).to.be.eql(downvote);
      });
    });
  });

  it('should unupvote and downvote a map', () => {
    cy.get('#upvote-button').should('be.visible').click();
    cy.get('#upvote-count').then(($cnt) => {
      const upvote = Number($cnt.text());

      cy.get('#downvote-count').then(($cnt2) => {
        const downvote = Number($cnt2.text());

        cy.get('#downvote-button').click();

        cy.get('#upvote-count').then(($cnt3) => {
          const newUpvote = Number($cnt3.text());
          expect(newUpvote).to.be.lessThan(upvote);
        });

        cy.get('#downvote-count').then(($cnt2) => {
          const newDownvote = Number($cnt2.text());
          expect(newDownvote).to.be.greaterThan(downvote);
        });
      });
    });
  });
});

describe('Standalone Download Map Test', () => {
  it('should download a map and update map counter', () => {
    const user = {
      email: 'downloadUser@email.com',
      username: 'downloadUser',
      password: 'password',
      maps: [],
    };

    login(user);
    createNew();

    cy.get('#menu-button').click();
    cy.contains('Download as').invoke('show').click({ force: true }).click();
    cy.contains('GeoJSON').should('exist').click().wait(500);
    cy.readFile('cypress/downloads/My Map.geo.json').should('exist');

    cy.get('#menu-button').click();
    cy.contains('Exit project').click();
    cy.reload();
    cy.get('#download-count').then(($cnt) => {
      const download = Number($cnt.text());
      expect(download).to.be.greaterThan(0);
    });
  });
});

export {};
