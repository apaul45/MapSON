const email = 'cypress@cypress.com';
const username = 'cypressUser';
const password = 'password';

export const login = () => {
  cy.visit('http://127.0.0.1:5173/login');
  cy.get('#username').type(username);
  cy.get('#password').type(password);

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
