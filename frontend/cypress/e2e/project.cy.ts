import { createNew, login, logout, register, upload } from './utils';

describe('Project Screen Tests', () => {
  before(() => {
    login(null, null, null);
    cy.get('#plus-sign').parent().should('be.visible').click();
    cy.contains('Create new Map').should('be.visible').click();
    cy.location('href').should((path) => {
      expect(path).to.include('/project');
    });
  });

  beforeEach(() => {
    login(null, null, null);
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
    login(null, null, null);
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

describe('Project Invitation Tests', () => {
  beforeEach(() => {
    register('10', '20', '30');
    login(null, null, null);
    createNew();
  });
  afterEach(() => logout());

  it('should invite a new member to the project', () => {
    invite();
    cy.get('#root').click('right', { force: true });
    cy.get('#project-name').dblclick();
    cy.get('#project-namefield').clear().type('Invitation Map One{enter}');

    logout();

    login('10', '20', '30');
    cy.contains('Invitation Map One').should('be.visible');
  });

  it('should remove a new memeber to the project', () => {
    invite();
    cy.get('#root').click('right', { force: true });
    cy.get('#project-name').dblclick();
    cy.get('#project-namefield').clear().type('Invitation Map Two{enter}');

    cy.url().then((url) => {
      logout();

      login('10', '20', '30');
      cy.contains('Invitation Map Two').should('be.visible');

      logout();
      login(null, null, null);
      cy.visit(url);
      cy.wait(1000);
      cy.contains('Share').should('be.visible').click();
      cy.contains('Remove Access').click();
      cy.get('#root').click('right', { force: true });

      logout();

      login('10', '20', '30');
      cy.contains('Invitation Map Two').should('not.exist');
    });
  });

  it('should fail with an invalid username', () => {
    cy.contains('Share').should('be.visible').click();
    cy.contains('Invite').should('be.visible').click();
    cy.get('#error-dialog').should('exist');
    cy.get('#root').click('right', { force: true });
  });
});

const invite = () => {
  cy.contains('Share').should('be.visible').click();
  cy.get('#invitation-username').type('20');
  cy.contains('Invite').should('be.visible').click();
  cy.contains('20').should('be.visible');
  cy.contains('Remove Access').should('be.visible');
};

describe('Publish Tests', () => {
  beforeEach(() => {
    login(null, null, null);
    createNew();
  });
  afterEach(() => logout());

  it('should publish and unpublish the map', () => {
    publish()
    cy.contains('Unpublish').should('be.visible').click();
    //cy.contains('Publish').should('be.visible');
  });
});

const publish = () => {
  cy.contains('Share').should('be.visible').click();
  cy.contains('Publish').should('be.visible').click();
};

export {};
