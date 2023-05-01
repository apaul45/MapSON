import * as turf from '@turf/turf';
import {
  Feature,
  FeatureCollection,
  LineString,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from 'geojson';
import union from '@turf/union-5';

declare module '@turf/union-5' {
  export default function (
    ...features: (
      | Feature<Polygon | LineString | MultiLineString>
      | FeatureCollection<LineString | MultiLineString>
    )[]
  ): Feature<LineString | MultiLineString>;
}

export default function polygonSlice(
  poly: Feature<Polygon | MultiPolygon>,
  line: Feature<LineString>
): Feature<Polygon | MultiPolygon>[] {
  if (poly.geometry.type === 'MultiPolygon') {
    const polygons = poly.geometry.coordinates.map((c) => turf.polygon(c));

    let larger = [];
    let smaller = [];

    //keep the larger parts of the polygon together
    for (const p of polygons) {
      const slices = polygonSlice(p, line);

      if (slices.length === 1) {
        larger.push(...slices);
      } else {
        const [largest, ...rest] = slices.sort((a, b) => turf.area(b) - turf.area(a));
        larger.push(largest);
        smaller.push(...rest);
      }
    }

    const multi = turf.combine(turf.featureCollection(larger)).features as Feature<MultiPolygon>[];

    return [...smaller, ...multi];
  }

  const polyAsLine = turf.polygonToLine(poly);
  //turf-5 unions work with (multi)linestrings
  const unionedLines = union(polyAsLine, line)!;
  console.log({ unionedLines });
  const polygonized = turf.polygonize(unionedLines);
  return polygonized.features.filter((ea) => {
    const point = turf.pointOnFeature(ea);
    const isInPoly = turf.booleanPointInPolygon(point.geometry.coordinates, poly.geometry);
    return isInPoly;
  });
}
