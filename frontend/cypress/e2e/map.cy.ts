import { login } from './account';

const mapSelector = '#map-container';

beforeEach(() => {
  login();
  cy.get('#plus-sign').parent().should('be.visible').click();
  cy.contains('Create new Map').should('be.visible').click();
  cy.location('href').should((path) => {
    expect(path).to.include('/project');
  });
});

describe('Map interaction tests', () => {
  beforeEach(() => {
    login();
    cy.get('.mapcard').last().click();
  });

  it('should have a map', () => {
    cy.get(mapSelector).should('be.visible');
  });

  it('should display all toolbar items', () => {
    const items = ['polygon', 'polyline', 'delete', 'merge', 'split', 'simplify'];

    items.forEach((label) => cy.toolbarButton(label).should('be.visible'));
  });
});

describe('Polygon tests', () => {
  beforeEach(() => {
    login();
    cy.get('.mapcard').last().click();
  });

  it('should draw a polygon with proper hover change states', () => {
    drawPolygon();

    cy.get(mapSelector).dblclick(300, 300);

    cy.hasVertexMarkers(4);

    cy.get(mapSelector).dblclick(300, 300);

    deletePolygon();

    // ONLY WORKS WITH SVG RENDERER
    // cy.get('leaflet-interactive[fill="blue"]').trigger('mouseover').should('have.attr', 'fill').and('equal', 'green')
    // cy.get(mapSelector).click(300, 300)
    // cy.get('leaflet-interactive[fill="red"]').trigger('mouseover').should('have.attr', 'fill').and('equal', 'teal')
  });

  it('should delete a polygon', () => {
    drawPolygon();

    cy.get(mapSelector).dblclick(300, 300);

    cy.hasVertexMarkers(4);

    cy.get(mapSelector).dblclick(300, 300);

    deletePolygon();

    cy.get(mapSelector).dblclick(300, 300);

    cy.hasVertexMarkers(0);
  });

  it('should add and remove a vertex from polygon', () => {
    drawPolygon();

    cy.get(mapSelector).dblclick(300, 300);

    let vertex = cy.get('.marker-icon-middle').first();

    // adds vertex
    vertex.click();

    cy.hasVertexMarkers(5);

    //deletes vertex
    vertex.rightclick();

    cy.hasVertexMarkers(4);
  });
});

describe('Polyline tests', () => {
  beforeEach(() => {
    login();
    cy.get('.mapcard').last().click();
  });

  it('should draw a polyline', () => {
    drawPolyline();

    cy.get(mapSelector).dblclick(100, 150);

    cy.hasVertexMarkers(2);

    deletePolyline();
  });

  it('should delete a polyline', () => {
    drawPolyline();

    cy.get(mapSelector).dblclick(100, 150);

    cy.hasVertexMarkers(2);

    cy.get(mapSelector).dblclick(100, 150);

    deletePolyline();

    cy.get(mapSelector).dblclick(100, 150);

    cy.hasVertexMarkers(0);

    cy.get(mapSelector).dblclick(100, 150);
  });
});

describe('Region Properties Tests', () => {
  const type = 'feature';
  it('should attach a property to a region', () => {
    drawPolygon();

    cy.get(mapSelector).click(300, 300);

    cy.contains('Feature Properties:').should('exist');

    addProp(type);

    cy.get(mapSelector).click(300, 300);
    cy.get(mapSelector).click(300, 300);

    cy.get(`input[value=mapson_${type}_test_key]`).should('be.visible');
    cy.get(`input[value=mapson_${type}_test_value]`).should('be.visible');
  });

  it('should modify a property of a region', () => {
    drawPolygon();

    cy.get(mapSelector).click(300, 300);

    cy.contains('Feature Properties:').should('exist');

    addProp(type);

    cy.get(mapSelector).click(300, 300);
    cy.get(mapSelector).click(300, 300);

    modProp(type);

    cy.get(mapSelector).click(300, 300);
    cy.get(mapSelector).click(300, 300);

    cy.get(`input[value=mapson_${type}_test_key_2]`).should('be.visible');
    cy.get(`input[value=mapson_${type}_test_value_2]`).should('be.visible');
  });
});

describe('Map Properties Tests', () => {
  const type = 'map';
  it('should attach property to a map', () => {
    cy.contains(/^Map$/).should('exist').click();

    addProp(type);
    cy.get(`input[value=mapson_${type}_test_key]`).should('be.visible');
    cy.get(`input[value=mapson_${type}_test_value]`).should('be.visible');
  });

  it('should modify a property of a map', () => {
    cy.contains(/^Map$/).should('exist').click();

    addProp(type);
    modProp(type);
    cy.get(`input[value=mapson_${type}_test_key_2]`).should('be.visible');
    cy.get(`input[value=mapson_${type}_test_value_2]`).should('be.visible');
  });
});

const drawPolygon = () => {
  cy.toolbarButton('polygon').click();

  cy.get(mapSelector)
    .click(200, 200)
    .click(200, 400)
    .click(400, 400)
    .click(400, 200)
    .click(200, 200);

  cy.get('a.action-cancel').filter(':visible').click();
};

const deletePolygon = () => {
  cy.toolbarButton('delete').click();

  cy.get(mapSelector).click(300, 300);

  cy.toolbarButton('delete').click();
};

const drawPolyline = () => {
  cy.toolbarButton('polyline').click();

  cy.get(mapSelector).click(100, 100).click(100, 200).click(100, 200);

  cy.get('a.action-cancel').filter(':visible').click();
};

const deletePolyline = () => {
  cy.toolbarButton('delete').click();

  cy.get(mapSelector).click(100, 150);

  cy.toolbarButton('delete').click();
};

const addProp = (type: string) => {
  cy.get('#' + type + '-add-button')
    .should('exist')
    .click();
  cy.get("input[placeholder='key']")
    .should('exist')
    .type('mapson_' + type + '_test_key');
  cy.get("input[placeholder='value']")
    .should('exist')
    .type('mapson_' + type + '_test_value');
  cy.get('#' + type + '-save-button')
    .should('exist')
    .click();
};

const modProp = (type: string) => {
  cy.get(`input[value=mapson_${type}_test_key]`)
    .should('exist')
    .clear()
    .type('mapson_' + type + '_test_key_2');
  cy.get(`input[value=mapson_${type}_test_value]`)
    .should('exist')
    .clear()
    .type('mapson_' + type + '_test_value_2');
  cy.get('#' + type + '-save-button')
    .should('exist')
    .click();
};