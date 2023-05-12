import { User } from '../../src/types';
import { createNew, importNew, login, logout, register, upload } from './utils';

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

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

describe('Project Invitation Tests', () => {
  const user = {
    email: '10',
    username: '20',
    password: '30',
    maps: [],
  };

  beforeEach(() => {
    register(user);
    login();
    createNew();
  });
  afterEach(() => logout());

  it('should invite a new member to the project', () => {
    invite();
    cy.get('#root').click('right', { force: true });
    cy.get('#project-name').dblclick();
    cy.get('#project-namefield').clear().type('Invitation Map One{enter}');

    logout();

    login(user);
    cy.contains('Invitation Map One').should('be.visible');
  });

  it('should remove a new member to the project', () => {
    invite();
    cy.get('#root').click('right', { force: true });
    cy.get('#project-name').dblclick();
    cy.get('#project-namefield').clear().type('Invitation Map Two{enter}');

    cy.url().then((url) => {
      logout();

      login(user);
      cy.contains('Invitation Map Two').should('be.visible');

      logout();
      login();
      cy.visit(url);
      cy.wait(1000);
      cy.contains('Share').should('be.visible').click();
      cy.contains('Remove Access').click();
      cy.get('#root').click('right', { force: true });

      logout();

      login(user);
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
    login();
    createNew();
  });

  it('should publish and unpublish the map', () => {
    cy.contains('Share').should('be.visible').click();
    cy.contains('Publish').should('be.visible').click();
    cy.contains('Unpublish').should('be.visible').click();
    //cy.contains('Publish').should('be.visible');
  });
});

describe('Comment Test', () => {
  beforeEach(() => login());

  it('should add a new comment', () => {
    createNew();

    //Then open comment panel and make a new comment
    cy.get('#comment-button').click();
    cy.get('#comment-panel').should('be.visible');

    cy.get('#comment-input').type('Brand New Comment');
    cy.get('#comment-submit-button').click();

    cy.contains('Brand New Comment').should('be.visible');
  });
});

describe('Fork Map Test', () => {
  it('should fork a existing published map', async () => {
    login();
    cy.wait(1000);

    importNew('Brand New Forked Map');
    cy.get('#menu-button').click();
    cy.contains('Publish').should('be.visible').click();

    cy.url().then((oldUrl) => {
      logout();

      login({ email: '100', username: '200', password: '300', maps: [] });
      cy.visit(oldUrl);

      cy.get('#menu-button').click();
      cy.contains('Make a copy').click();

      cy.url().then((url) => expect(url).to.not.equal(oldUrl));
    });
  });
});

export {};
