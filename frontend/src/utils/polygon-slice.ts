import { point, polygon, multiPolygon, lineString, Polygon } from '@turf/helpers';
import lineIntersect from '@turf/line-intersect';
import lineOffset from '@turf/line-offset';
import lineOverlap from '@turf/line-overlap';
import lineToPolygon from '@turf/line-to-polygon';
import unkinkPolygon from '@turf/unkink-polygon';
import difference from '@turf/difference';
import { getGeom } from '@turf/invariant';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { Feature, LineString } from 'geojson';

type Direction = 1 | -1;
type ID = 'upper' | 'lower';

export default function polygonSlice(
  ipoly: Feature<Polygon>,
  isplitter: Feature<LineString>
): Feature<Polygon>[] {
  const poly = getGeom(ipoly);
  const splitter = getGeom(isplitter);

  const line = trimStartEndPoints(poly, splitter);
  if (line == null) return [ipoly];

  const newPolygons = [];

  let cutDone = false;
  const upperCut = cutPolygon(poly, line, 1, 'upper');
  const lowerCut = cutPolygon(poly, line, -1, 'lower');
  if (upperCut != null && lowerCut != null) {
    cutDone = true;
  }
  if (cutDone) {
    newPolygons.push(upperCut!.geometry);
    newPolygons.push(lowerCut!.geometry);
  } else {
    newPolygons.push(poly);
  }

  const generatedPolygons: Polygon[] = [];
  newPolygons.forEach((polyg) => {
    if (polyg.type == 'Polygon') {
      generatedPolygons.push(polyg);
    }

    if (polyg.type == 'MultiPolygon') {
      polyg.coordinates.forEach((p) => {
        generatedPolygons.push(polygon([p[0]]).geometry);
      });
    }
  });

  return generatedPolygons.map((p) => polygon(p.coordinates));
}

function cutPolygon(poly: Polygon, line: LineString, direction: Direction, id: ID) {
  const cutPolyGeoms = [];
  let retVal = null;

  if (poly.type != 'Polygon' || line.type != 'LineString') return retVal;

  const intersectPoints = lineIntersect(poly, line);
  const nPoints = intersectPoints.features.length;
  if (nPoints == 0 || nPoints % 2 != 0) return retVal;

  const thickLinePolygon = prepareDiffLinePolygon(line, direction)!;

  let clipped;
  try {
    clipped = difference(poly, thickLinePolygon)!;
  } catch (e) {
    return retVal;
  }

  if (clipped.geometry.type == 'MultiPolygon') {
    for (let j = 0; j < clipped.geometry.coordinates.length; j++) {
      const polyg = polygon(clipped.geometry.coordinates[j]);
      const overlap = lineOverlap(polyg, line, { tolerance: 0.00005 });

      if (overlap.features.length > 0) {
        cutPolyGeoms.push(polyg.geometry.coordinates);
      }
    }
  } else {
    const polyg = polygon(clipped.geometry.coordinates);
    const overlap = lineOverlap(polyg, line, { tolerance: 0.00005 });

    if (overlap.features.length > 0) {
      cutPolyGeoms.push(polyg.geometry.coordinates);
    }
  }

  if (cutPolyGeoms.length == 1) {
    retVal = polygon(cutPolyGeoms[0], { id: id });
  } else if (cutPolyGeoms.length > 1) {
    retVal = multiPolygon(cutPolyGeoms, { id: id });
  }

  return retVal;
}

function prepareDiffLinePolygon(line: LineString, direction: Direction) {
  let offsetLine,
    polyCoords = [],
    thickLinePolygon;

  const offsetScales = [0.01, 0.001, 0.0001];

  for (let j = 0; j < offsetScales.length; j++) {
    polyCoords = [];
    offsetLine = lineOffset(line, offsetScales[j] * direction, {
      units: 'kilometers',
    });
    for (let k = 0; k < line.coordinates.length; k++) {
      polyCoords.push(line.coordinates[k]);
    }
    for (let k = offsetLine.geometry.coordinates.length - 1; k >= 0; k--) {
      polyCoords.push(offsetLine.geometry.coordinates[k]);
    }
    polyCoords.push(line.coordinates[0]);
    const thickLineString = lineString(polyCoords);
    thickLinePolygon = lineToPolygon(thickLineString) as Feature<Polygon>;

    const result = unkinkPolygon(thickLinePolygon);

    const selfIntersectPolygons = result.features.length;

    if (selfIntersectPolygons == 1) {
      return thickLinePolygon;
    }
  }
  return thickLinePolygon;
}

function trimStartEndPoints(poly: Polygon, line: LineString) {
  let startAt = 0;
  let endAt = line.coordinates.length;

  for (let j = 0; j < line.coordinates.length; j++) {
    if (booleanPointInPolygon(point(line.coordinates[j]), poly)) {
      startAt++;
    } else {
      break;
    }
  }

  for (let j = line.coordinates.length - 1; j >= 0; j--) {
    if (booleanPointInPolygon(point(line.coordinates[j]), poly)) {
      endAt--;
    } else {
      break;
    }
  }

  line.coordinates = line.coordinates.slice(startAt, endAt);

  return line.coordinates.length > 1 ? line : null;
}
