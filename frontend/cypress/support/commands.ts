/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
  namespace Cypress {
    interface Chainable {
      toolbarButton(name: string): Chainable<JQuery<Node>>;
      hasVertexMarkers(count: number): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add('toolbarButton', (name) => cy.get(`.leaflet-pm-icon-${name}`));

Cypress.Commands.add('hasVertexMarkers', (count) =>
  cy.get('.marker-icon:not(.marker-icon-middle)', { timeout: 10000 }).should(($p) => {
    expect($p).to.have.length(count);
  })
);

export {};
