import { login } from './utils';

const mapSelector = '#map-container';
const DELAY = 500;

beforeEach(() => {
  login();
  cy.get('#plus-sign', { timeout: 10000 }).parent().should('be.visible').click();
  cy.contains('Create new Map', { timeout: 10000 }).should('be.visible').click();
  cy.location('href', { timeout: 10000 }).should((path) => {
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

    cy.hasLayers(1);

    // ONLY WORKS WITH SVG RENDERER
    cy.get('.leaflet-interactive[fill="blue"]')
      .trigger('mouseover')
      .should('have.attr', 'fill')
      .and('equal', 'green');
    clickRegions(1);
    cy.get('.leaflet-interactive[fill="red"]')
      .trigger('mouseover')
      .should('have.attr', 'fill')
      .and('equal', 'teal');

    deletePolygon();
  });

  it('should delete a polygon', () => {
    drawPolygon();

    cy.hasLayers(1);

    deletePolygon();

    cy.hasLayers(0);
  });

  it('should undo and redo for delete', () => {
    drawPolygon();

    cy.hasLayers(1);

    triggerUndo();

    cy.hasLayers(0);

    triggerRedo();

    cy.hasLayers(1);

    triggerUndo();
  });

  it('should add and remove a vertex from polygon', () => {
    drawPolygon();

    doubleClickRegion(300, 300);

    let vertex = cy.get('.marker-icon-middle').first();

    // adds vertex
    vertex.click();

    cy.hasVertexMarkers(5);

    //deletes vertex
    vertex.rightclick();

    cy.hasVertexMarkers(4);
  });

  it('should undo and redo for vertex editing', () => {
    drawPolygon();

    doubleClickRegion(300, 300);

    let vertex = cy.get('.marker-icon-middle').first();

    // adds vertex
    vertex.click();

    cy.hasVertexMarkers(5);

    triggerUndo();

    cy.hasVertexMarkers(4);

    triggerRedo();

    cy.hasVertexMarkers(5);

    //undo edit
    triggerUndo();
    //undo draw
    triggerUndo();
  });
});

describe('Polyline tests', () => {
  beforeEach(() => {
    login();
    cy.get('.mapcard').last().click();
  });

  it('should draw a polyline', () => {
    drawPolyline();

    doubleClickRegion(100, 150);

    cy.hasVertexMarkers(2);

    deletePolyline();
  });

  it('should delete a polyline', () => {
    drawPolyline();

    doubleClickRegion(100, 150);

    cy.hasVertexMarkers(2);

    doubleClickRegion(100, 150);

    deletePolyline();

    doubleClickRegion(100, 150);

    cy.hasVertexMarkers(0);

    doubleClickRegion(100, 150);
  });
});

describe('Region Properties Tests', () => {
  const type = 'feature';
  it('should attach a property to a region', () => {
    drawPolygon();

    clickRegions(1);

    cy.contains('Feature Properties:').should('exist');

    addProp(type);

    clickRegions(1).wait(100);
    clickRegions(1).wait(100);

    cy.get(`input[value=mapson_${type}_test_key]`).should('be.visible');
    cy.get(`input[value=mapson_${type}_test_value]`).should('be.visible');
  });

  it('should modify a property of a region', () => {
    drawPolygon();

    clickRegions(1);

    cy.contains('Feature Properties:').should('exist');

    addProp(type);

    clickRegions(1).wait(100);
    clickRegions(1).wait(100);

    modProp(type);

    clickRegions(1).wait(100);
    clickRegions(1).wait(100);

    cy.get(`input[value=mapson_${type}_test_key_2]`).should('be.visible');
    cy.get(`input[value=mapson_${type}_test_value_2]`).should('be.visible');
  });

  it('should add a name to a region', () => {
    drawPolygon();
    clickRegions(1);
    cy.contains('Feature Properties:').should('exist');

    cy.get("input[placeholder='name value']").should('exist').type('unique name');
    cy.get('#' + type + '-save-button')
      .should('exist')
      .click();

    clickRegions(1);

    cy.get(mapSelector).trigger('mouseover', [300, 300]).wait(10);
    cy.contains('unique name').should('exist');
    cy.wait(10);

    clickRegions(1);
    cy.get("input[placeholder='name value']").should('exist').clear().type('unique name 2');
    cy.get('#' + type + '-save-button')
      .should('exist')
      .click();

    clickRegions(1);
    cy.get(mapSelector).trigger('mouseover', [300, 300]).wait(DELAY);
    cy.contains('unique name 2').should('exist');
  });

  it('should modify the color of a region', () => {
    drawPolygon();
    clickRegions(1);
    cy.contains('Feature Properties:').should('exist');

    cy.get("input[placeholder='color value']").should('exist').type('pink');
    cy.get('#' + type + '-save-button')
      .should('exist')
      .click()
      .wait(1000);

    clickRegions(1);

    cy.get('.leaflet-interactive[fill="pink"]', { timeout: 10000 }).should('exist');

    clickRegions(1);
    cy.get("input[placeholder='color value']").clear().type('yellow');
    cy.get('#' + type + '-save-button')
      .should('exist')
      .click()
      .wait(1000);

    clickRegions(1);
    cy.get('.leaflet-interactive[fill="yellow"]', { timeout: 10000 }).should('exist');
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
    cy.wait(1000);
    modProp(type);
    cy.get(`input[value=mapson_${type}_test_key_2]`).should('be.visible');
    cy.get(`input[value=mapson_${type}_test_value_2]`).should('be.visible');
  });
});

describe('Split tests', () => {
  beforeEach(() => {
    login();
    cy.get('.mapcard').last().click();
  });

  it('should split region into two', () => {
    drawPolygon2();

    clickRegions(1);

    //draw split line
    cy.toolbarButton('split').click();

    clickRegion(50, 200).click(350, 200).click(350, 200);

    cy.hasLayers(2);

    cy.toolbarButton('delete').click();

    clickRegions(2);

    cy.toolbarButton('delete').click();
  });

  it('should be able to merge region back', () => {
    drawPolygon2();

    clickRegions(1);

    //draw split line
    cy.toolbarButton('split').click();

    clickRegion(50, 200).click(350, 200).click(350, 200);

    //select split features
    clickRegions(2);

    cy.once('window:confirm', (text) => {
      expect(text).to.equal('Merge the two selected regions?');

      return true;
    });

    cy.toolbarButton('merge').click();

    cy.get('a.action-undefined').filter(':visible').click().wait(500);

    cy.hasLayers(1);
  });

  // it('should undo and redo split', () => {
  //   drawPolygon2();

  //   cy.hasLayers(1);

  //   clickRegion(200, 200);

  //   //draw split line
  //   cy.toolbarButton('split').click();

  //   clickRegion(50, 200).click(350, 200).click(350, 200);

  //   cy.hasLayers(2);

  //   triggerUndo();

  //   cy.hasLayers(1);

  //   triggerRedo();

  //   cy.hasLayers(2);

  //   //undo split
  //   triggerUndo();
  //   //undo draw poly
  //   triggerUndo();
  // });
});

describe('Merge tests', () => {
  beforeEach(() => {
    login();
    cy.get('.mapcard').last().click();
  });

  it('should merge two adjacent polygons', () => {
    cy.on('window:confirm', (text) => {
      expect(text).to.equal('Merge the two selected regions?');
      return true;
    });

    drawPolygon();
    drawPolygon2();

    //deselects and turns off editing
    triggerUndo();
    triggerUndo();
    triggerRedo();
    triggerRedo();

    //wait for undos/redos to propogate and for layers event handlers to properly set
    cy.wait(500);

    clickRegions(2);

    cy.toolbarButton('merge').click();

    cy.get('a.action-undefined').filter(':visible').click();

    //triggers window:confirm

    deletePolygon();
  });

  // it('should undo and redo merge', () => {
  //   cy.on('window:confirm', (text) => {
  //     expect(text).to.equal('Merge the two selected regions?');
  //     return true;
  //   });

  //   drawPolygon();
  //   drawPolygon2();

  //   //deselects and turns off editing
  //   triggerUndo();
  //   triggerUndo();
  //   triggerRedo();
  //   triggerRedo();

  //   cy.hasLayers(2);

  //   clickRegion(150, 150);
  //   clickRegion(350, 350);

  //   cy.toolbarButton('merge').click();

  //   cy.get('a.action-undefined').filter(':visible').click();

  //   cy.hasLayers(1);

  //   triggerUndo(1000);

  //   cy.hasLayers(2);

  //   triggerRedo(1000);

  //   cy.hasLayers(1);

  //   //undo merge
  //   triggerUndo();

  //   //undo first poly
  //   triggerUndo();
  //   //undo second poly
  //   triggerUndo();
  // });

  it('should prompt user if merge is to result in a non-contiguous polygon', () => {
    cy.once('window:confirm', (text) => {
      expect(text).to.equal('Merge the two selected regions?');

      cy.once('window:confirm', (text) => {
        expect(text).to.equal(
          'This merge results in a non-contiguous polygon. Do you still want to continue?'
        );
        return true;
      });

      return true;
    });

    drawPolygon2();
    drawPolygon3();

    clickRegions(2);

    cy.toolbarButton('merge').click();

    cy.get('a.action-undefined').filter(':visible').click();

    //triggers both confirms

    deletePolygon2();
  });
});

const drawPolygon3 = () => {
  cy.toolbarButton('polygon').click();

  clickRegion(350, 350).click(350, 450).click(450, 450).click(450, 350).click(350, 350);

  cy.get('a.action-cancel').filter(':visible').click();
};

const drawPolygon2 = () => {
  cy.toolbarButton('polygon').click();

  clickRegion(100, 100).click(300, 100).click(300, 300).click(100, 300).click(100, 100);

  cy.get('a.action-cancel').filter(':visible').click();
};

const deletePolygon2 = () => {
  cy.toolbarButton('delete').click();

  clickRegion(150, 150);

  cy.toolbarButton('delete').click();
};

const drawPolygon = () => {
  cy.toolbarButton('polygon').click();

  clickRegion(200, 200).click(200, 400).click(400, 400).click(400, 200).click(200, 200);

  cy.get('a.action-cancel').filter(':visible').click();
};

const deletePolygon = () => {
  cy.toolbarButton('delete').click();

  clickRegion(300, 300);

  cy.toolbarButton('delete').click();
};

const drawPolyline = () => {
  cy.toolbarButton('polyline').click();

  clickRegion(100, 100).click(100, 200).click(100, 200);

  cy.get('a.action-cancel').filter(':visible').click();
};

const deletePolyline = () => {
  cy.toolbarButton('delete').click();

  clickRegion(100, 150);

  cy.toolbarButton('delete').click();
};

const addProp = (type: string) => {
  cy.get('#' + type + '-add-button')
    .should('exist')
    .click();
  cy.get("input[placeholder='key']")
    .last()
    .should('exist')
    .type('mapson_' + type + '_test_key');
  cy.get("input[placeholder='value']")
    .last()
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

const doubleClickRegion = (x: number, y: number) => {
  return cy.get(mapSelector).dblclick(x, y).wait(DELAY);
};

const clickRegion = (x: number, y: number) => {
  return cy.get(mapSelector).click(x, y);
};

const clickRegions = (count: number) => {
  return cy
    .hasLayers(count)
    .each((e) => {
      cy.wrap(e).click({ force: true });
    })
    .wait(10);
};

const triggerUndo = (delay = DELAY) => {
  cy.get('body').trigger('keydown', { ctrlKey: true, key: 'z' }).wait(delay);
};
const triggerRedo = (delay = DELAY) => {
  cy.get('body').trigger('keydown', { ctrlKey: true, shiftKey: true, key: 'z' }).wait(delay);
};
