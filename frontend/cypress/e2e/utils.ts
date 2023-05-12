import { User } from '../../src/types';

const cypressUser: User = {
  username: 'cypressUser',
  password: 'password',
  email: 'cypress@cypress.com',
  maps: [],
};

export const register = (user: User = cypressUser) => {
  cy.request({
    url: 'http://localhost:4000/user/register',
    method: 'POST',
    body: user,
    failOnStatusCode: false,
  });
};

export const login = (user: User = cypressUser) => {
  register(user);

  cy.visit('http://localhost:5173/login');
  cy.get('#username').type(user.username);
  cy.get('#password').type(user.password);

  cy.contains('Login').click();

  cy.location('pathname').should((path) => expect(path).to.include('/home'));
  cy.get('#user-menu-button').should('exist');
};

export const logout = () => {
  cy.get('#user-menu-button').should('exist').click();

  cy.contains('Logout').should('exist').click();

  cy.location('pathname').should((path) => expect(path).to.deep.equal('/'));
};

// will not be needed once real mapcards are implemented on home page
export const upload = () => {
  cy.get('#add-dialog').should('not.exist');
  cy.get('#plus-sign').parent().should('be.visible').click();
  cy.contains('Import from Shapefile/GeoJSON').should('be.visible').click();
  cy.get('[type="radio"]').check('geojson');

  cy.get('input[type=file]').selectFile('cypress/fixtures/mock.geo.json', {
    force: true,
  });
  cy.get('#map-name').type('test');

  cy.contains('Submit').should('exist').click();
  cy.location('pathname').should((path) => expect(path).to.include('/project'));
};

export const createNew = () => {
  cy.get('#add-dialog').should('not.exist');
  cy.get('#plus-sign').parent().should('be.visible').click();
  cy.contains('Create new Map').should('be.visible').click();
  cy.wait(1000);
};

export const importNew = (mapName: string) => {
  cy.get('#add-dialog').should('not.exist');
  cy.get('#plus-sign').parent().should('be.visible').click();
  cy.contains('Import from Shapefile/GeoJSON').should('be.visible').click({ force: true });

  cy.get('#add-dialog').should('be.visible');
  cy.get('[type="radio"]').check('geojson');

  cy.get('input[type=file]').selectFile('cypress/fixtures/mock.geo.json', {
    force: true,
  });
  cy.get('#map-name').type(mapName);

  cy.contains('Submit').should('exist').click();
  cy.location('pathname').should((path) => expect(path).to.include('/project'));
  cy.contains('#error-dialog').should('not.exist');
};
