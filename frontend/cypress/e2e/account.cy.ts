import { login, logout } from './utils';

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
