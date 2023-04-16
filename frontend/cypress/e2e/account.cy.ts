const username = Cypress.env('CYPRESS_USER')
const password = Cypress.env('CYPRESS_PASSWORD')

describe('Login Screen Test', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/login'))

  it('should login user and go to home page', () => {
    cy.get('#username').type(username)
    cy.get('#password').type(password)

    cy.contains('Login').click()

    cy.location('pathname').should((path) => expect(path).to.include('/home'))
    cy.get('#user-menu-button').should('exist').click()
  })

  it('should go to forget password page', () => {
    cy.contains('Forgot Password?').click()
    cy.location('pathname').should((path) =>
      expect(path).to.include('/recover-account')
    )
  })
})

describe('Logout Test', () => {
  beforeEach(() => cy.visit('http://127.0.0.1:5173/login'))

  it('should login and logout user', () => {
    cy.get('#username').type(username)
    cy.get('#password').type(password)

    cy.contains('Login').click()

    cy.location('pathname').should((path) => expect(path).to.include('/home'))

    cy.get('#user-menu-button').should('exist').click()

    cy.contains('Logout').should('exist').click()

    cy.location('pathname').should((path) => expect(path).to.deep.equal('/'))
  })
})

export {}
