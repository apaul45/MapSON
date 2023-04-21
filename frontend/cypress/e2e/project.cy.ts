import { login, logout, upload } from './account';

describe('Project Screen Tests', () => {
  before(() => {
    login();
    cy.get('#plus-sign').parent().should('be.visible').click();
    cy.contains('Create new Map').should('be.visible').click();
    cy.location('href').should((path) => {
      expect(path).to.include('/project');
    });
  });

  beforeEach(() => {
    login();
    cy.get('.mapcard').last().click();
  });

  it('should update the map name', () => {
    cy.get('#project-namefield').should('not.exist');
    cy.get('#project-name').dblclick();

    cy.get('#project-namefield').clear().type('Cypress Map{enter}');

    cy.get('#project-namefield').should('not.exist');
    cy.get('#project-name').should('contain.text', 'Cypress Map');
  });

  it('should exit the project', () => {
    cy.get('#menu-button').click();

    cy.get('#menu-option-exit').click();

    cy.location('pathname').should((path) => expect(path).to.include('/home'));
  });
});

describe('Project Nav Bar Tests', () => {
  beforeEach(() => {
    login();
    upload();
  });
  afterEach(() => logout());

  it('should download a geojson', () => {
    cy.get('#menu-button').click();

    cy.contains('Download as').invoke('show').click({ force: true }).click();

    cy.contains('GeoJSON').should('exist').click();
    cy.readFile('cypress/downloads/test.geo.json').should('exist');
  });

  it('should download a shapefile zip', () => {
    cy.get('#menu-button').click();

    cy.contains('Download as').invoke('show').click({ force: true }).click();

    cy.contains('Shapefile').should('exist').click();
    cy.readFile('cypress/downloads/test.geo.json').should('exist');
  });
});

export {};
