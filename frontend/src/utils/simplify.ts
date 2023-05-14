import { FeatureCollection } from 'geojson';
import * as topojsonClient from 'topojson-client';
import * as topojsonServer from 'topojson-server';
import * as topojsonSimplify from 'topojson-simplify';
import { Features } from '../types';

type Res = Features & { _id?: any };

export const simplifyGeojson = (inp: Res, tol: number): Res => {
  const id = inp._id;

  const f = { ...inp };
  //@ts-ignore
  f.features = f.features.map((v) => {
    return { ...v, id: v._id, _id: undefined };
  });

  //simplify map
  const topo = topojsonServer.topology({ s: f as FeatureCollection });
  //@ts-ignore
  const pre = topojsonSimplify.presimplify(topo);

  const simp = topojsonSimplify.simplify(pre, tol);
  const res = topojsonClient.feature(simp, simp.objects.s) as FeatureCollection;

  res.features = res.features.map((v) => {
    return { ...v, _id: v.id, id: undefined };
  });

  (res as Res)._id = id;

  return res as Res;
};
