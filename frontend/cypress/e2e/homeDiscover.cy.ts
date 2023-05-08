import { login, logout } from './utils';

describe('Discover Screen Tests', () => {
  beforeEach(() => {
    login();

    //Create new map, and publish it using PUT request
    cy.request('POST', 'http://localhost:4000/maps/map', { mapName: 'Cypress Test Map' }).then(
      (response) => {
        expect(response.status).to.equal(200);

        const map = response.body.map;

        // Make downloads = 200 to test/use sort by downloads
        cy.request('PUT', `http://localhost:4000/maps/map/${map._id}`, {
          changes: { published: { isPublished: true }, downloads: 200 },
        }).then((response) => expect(response.status).to.equal(201));
      }
    );

    logout();
    cy.visit('http://127.0.0.1:5173/discover');
  });

  it('should sort by downloads', () => {
    cy.get('#add-project').should('not.exist');
    cy.get('#new-project').should('not.exist');

    cy.contains('Sort by').should('be.visible').click();

    cy.get('#menu-Downloads').should('be.visible').click();

    cy.contains('Sort by: Downloads').should('exist');
    cy.get('#sort-menu').should('not.exist');
  });

  it('should search for the created map', () => {
    cy.contains('Sort by').should('be.visible').click();
    cy.get('#menu-Downloads').should('be.visible').click();
    cy.get('#sort-menu').should('not.exist');

    cy.get('#discover-input').should('be.visible').type('cypressUser');

    cy.contains('Cypress Test Map').should('be.visible');
  });

  it('should not show the logged in user maps', () => {
    login();

    //First check if created map in home screen
    cy.visit('http://127.0.0.1:5173/home');
    cy.contains('Cypress Test Map').should('be.visible');

    //Then check that it's not present in discover
    cy.visit('http://127.0.0.1:5173/discover');
    cy.get('#discover-input').should('be.visible').type('cypressUser');
    cy.contains('Cypress Test Map').should('not.exist');
  });
});

export {};
