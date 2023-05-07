import { login, logout } from './utils';

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
    cy.visit('http://127.0.0.1:5173/');
    cy.get('#search-field').should('not.exist');

    cy.contains('Discover').should('not.have.class', 'selected-nav-btn').click();

    cy.location('pathname').should((path) => expect(path).to.include('/discover'));

    cy.get('#search-field').should('be.visible');
    cy.contains('Discover').should('have.class', 'selected-nav-btn');
  });

  it('should go to project', () => {
    cy.visit('http://127.0.0.1:5173/project');
    cy.get('#main-nav').should('not.exist');
  });

  it('should create a new map', () => {
    login();
    cy.get('#plus-sign').parent().should('be.visible').click();
    cy.contains('Create new Map').should('be.visible').click();
    cy.location('pathname').should((path) => expect(path).to.include('/project'));
    cy.wait(1000);
    logout();
  });

  describe('Add Map Tests', () => {
    beforeEach(() => {
      login();
      cy.get('#add-dialog').should('not.exist');
      cy.get('#plus-sign').parent().should('be.visible').click();
      cy.contains('Import from Shapefile/GeoJSON').should('be.visible').click();
    });

    it('should open add map dialog', () => {
      cy.get('#add-dialog').should('be.visible');
      cy.get('#close-dialog').should('be.visible').click();
      logout();
    });

    it('should display and hide the dialog', () => {
      cy.get('#add-dialog').should('be.visible');
      cy.get('#close-dialog').should('be.visible').click();
      cy.get('#add-dialog').should('not.exist');
    });

    it('should check a radio button', () => {
      cy.get('#add-dialog').should('be.visible');
      cy.get('[type="radio"]').check('geojson');

      cy.get('[type="radio"]').check('shapefile');

      cy.get('#shapefile').should('be.checked');

      cy.get('#geojson').should('not.be.checked');
      cy.get('#close-dialog').should('be.visible').click();
    });

    it('should error when map name is empty', () => {
      cy.get('#add-dialog').should('be.visible');
      cy.get('[type="radio"]').check('geojson');
      cy.contains('Submit').should('exist').click();

      cy.get('#error-dialog').should('exist');
      cy.contains('Close').should('exist').click();
      cy.get('#close-dialog').should('be.visible').click();
    });

    it('should error when map name is empty', () => {
      cy.get('#add-dialog').should('be.visible');
      cy.get('#map-name').type('test');
      cy.contains('Submit').should('exist').click();

      cy.get('#error-dialog').should('exist');
      cy.contains('Close').should('exist').click();
      cy.get('#close-dialog').should('be.visible').click();
    });

    it('should import a geojson file then go to project page', () => {
      cy.get('#add-dialog').should('be.visible');
      cy.get('[type="radio"]').check('geojson');

      cy.get('input[type=file]').selectFile('cypress/fixtures/mock.geo.json', {
        force: true,
      });
      cy.get('#map-name').type('geojson');

      cy.contains('Submit').should('exist').click();
      cy.location('pathname').should((path) => expect(path).to.include('/project'));
      cy.contains('#error-dialog').should('not.exist');
    });
    it('should import a shapefile zip file then go to project page', () => {
      cy.get('#add-dialog').should('be.visible');
      cy.get('[type="radio"]').check('shapefile');

      cy.get('input[type=file]').selectFile(
        { contents: 'cypress/fixtures/AFG_adm2.zip', mimeType: 'application/x-zip-compressed' },
        {
          force: true,
        }
      );
      cy.wait(1000);
      cy.get('#map-name').type('AFG');

      cy.contains('Submit').should('exist').click();
      cy.location('pathname').should((path) => expect(path).to.include('/project'));
      cy.contains('#error-dialog').should('not.exist');
    });
  });
});

export {};
