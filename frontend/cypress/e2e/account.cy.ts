import { login, logout } from './account';

// Make register the first test for cicd
describe('Register Screen Test', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/login'));

  it('should try registering a user', () => {
    cy.request({
      url: 'http://localhost:4000/user/register',
      method: 'POST',
      body: {
        email: 'cypress@cypress.com',
        username: 'cypress',
        password: 'password',
      },
      failOnStatusCode: false,
    });
  });
});

describe('Login Screen Test', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/login'));

  it('should go to forget password page', () => {
    cy.contains('Forgot Password?').click();
    cy.location('pathname').should((path) => expect(path).to.include('/recover-account'));
  });
});

describe('Logout Test', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/login'));

  it('should login and logout user', () => {
    login();
    logout();

    cy.location('pathname').should((path) => expect(path).to.deep.equal('/'));
  });
});

describe('Stay Logged In Test', () => {
  it('should keep the user logged in', () => {
    login();

    cy.get('#user-menu-button').should('be.visible');

    cy.reload();
    cy.get('#user-menu-button').should('be.visible');
  });
});

export {};
