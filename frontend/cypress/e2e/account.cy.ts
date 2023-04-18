import { login, logout } from './account';

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

export {};
