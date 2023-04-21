import { useSelector } from 'react-redux';
import { RootState, store } from '../../models';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import shp, { FeatureCollectionWithFilename } from 'shpjs';
import { GeoJsonProperties, Geometry, FeatureCollection } from 'geojson';
import Pbf from 'pbf';
// @ts-ignore
import * as gb from 'geobuf';

export const AddMapDialog = () => {
  const [uploadPrompt, setUploadPrompt] = useState('Drag files into box \n or click to browse');
  const [fileType, setFileType] = useState('');
  const [mapName, setMapName] = useState('');
  const [geojson, setGeojson] = useState<
    FeatureCollectionWithFilename | FeatureCollection<Geometry, GeoJsonProperties> | undefined
  >();
  const { error, mapStore } = store.dispatch;
  const isOpen = useSelector((state: RootState) => state.mapStore.addDialog);
  const navigate = useNavigate();

  const closeDialog = () => {
    store.dispatch.mapStore.setAddDialog(false);
    setFileType('');
    setGeojson(undefined);
    setUploadPrompt('Drag files into box \n or click to browse');
  };

  const handleRadio = (type: string) => {
    setFileType(type);
    setUploadPrompt('Drag files into box \n or click to browse');
    setGeojson(undefined);
  };

  const submitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    console.log(e.target.files);

    if (fileType === '') {
      error.setError('Please choose a file format before uploading a file');
      return;
    }

    if (!e.target?.files) {
      error.setError('Please upload valid files');
      return;
    }

    if (
      (fileType === 'GeoJSON' && e.target.files[0].type === 'application/json') ||
      (fileType === 'Shapefile' && e.target.files[0].type === 'application/x-zip-compressed')
    ) {
      setUploadPrompt(e.target.files[0].name);
      await processFile([...e.target.files]);
    } else if (fileType === 'Shapefile' && e.target.files.length > 1) {
      const files = [...e.target.files];
      let names = '';
      files.forEach((file) => {
        names += file.name + '\n';
      });
      setUploadPrompt(names);
      await processFile(files);
    } else {
      error.setError('Please upload a zip file, geojson, or shp+dbf files');
      return;
    }
  };

  const processFile = async (files: File[]) => {
    let geojson;
    if (fileType === 'GeoJSON') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target) {
          return;
        }

        const text = e.target.result as string;
        console.log(text);
        setGeojson(JSON.parse(text));
      };
      reader.readAsText(files[0]);
      return;
    } else if (fileType === 'Shapefile' && files.length > 1) {
      const shps = files.filter((file) => file.name.includes('.shp'));
      const dbfs = files.filter((file) => file.name.includes('.dbf'));

      const toGeoJSON = async (file: File) => {
        const name = file.name.slice(0, -4);

        let dbfFile = dbfs.find((file) => file.name.slice(0, -4) === name);

        let geojson;

        if (dbfFile) {
          let shpf = shp.parseShp(await file!.arrayBuffer());

          let dbf =
            dbfFile &&
            // @ts-ignore
            shp.parseDbf(await dbfFile!.arrayBuffer());

          geojson = shp.combine([shpf, dbf]);
        } else {
          geojson = await shp(await file.arrayBuffer());
        }

        return geojson;
      };

      geojson = await Promise.all(shps.map(toGeoJSON));
    } else if (fileType === 'Shapefile') {
      geojson = await shp(await files[0].arrayBuffer());
    }
    console.log(geojson);

    if (Array.isArray(geojson) && geojson.length > 1) {
      error.setError('Please upload a single layer shapefile zip');
      setUploadPrompt('Drag files into box \n or click to browse');
      return;
    }
    if (JSON.stringify(geojson).length > 17000000) {
      error.setError('(converted) GeoJSON too large for database query');
      setUploadPrompt('Drag files into box \n or click to browse');
      return;
    }
    if (Array.isArray(geojson)) {
      //@ts-ignore
      setGeojson(geojson[0]);
      return;
    }
    setGeojson(geojson);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (mapName === '') {
      error.setError('Please enter a map name');
      return;
    }

    if (geojson === undefined) {
      error.setError('Please upload a file');
      return;
    }

    // const encodedGeo = gb.encode(geojson, new Pbf())
    // console.log(encodedGeo)
    const id = await mapStore.createNewMap({
      mapName: mapName,
      geojson: geojson,
    });
    closeDialog();
    navigate(`/project/${id}`);
  };

  return (
    <>
      {isOpen && (
        <div
          className="relative z-10"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center">
              <div
                id="add-dialog"
                className="relative overflow-hidden rounded-lg bg-gray shadow-xl sm:my-8 sm:w-full sm:max-w-sm border-white border-2 m-auto flex flex-col justify-center items-center"
              >
                <button
                  id="close-dialog"
                  className="absolute top-0 right-0"
                  onClick={() => closeDialog()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="current"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <span className="text-xl text-white pt-10 pb-5">Map Name</span>

                <input
                  id="map-name"
                  className="peer w-3/4 h-10 rounded-[7px] border border-white bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-white"
                  placeholder="Enter a name"
                  onChange={(e) => setMapName(e.target.value)}
                />

                <span className="text-xl text-white pt-10 pb-5">Format</span>

                <div className="flex items-center mb-4 space-x-5">
                  <div>
                    <input
                      id="shapefile"
                      type="radio"
                      value="shapefile"
                      name="import"
                      className="text-blue"
                      onClick={() => {
                        handleRadio('Shapefile');
                      }}
                    />
                    <label htmlFor="Shapefile" className="text-white">
                      ESRI Shapefile
                    </label>
                  </div>
                  <div>
                    <input
                      id="geojson"
                      type="radio"
                      value="geojson"
                      name="import"
                      className="text-blue"
                      onClick={() => {
                        handleRadio('GeoJSON');
                      }}
                    />
                    <label htmlFor="geojson" className="text-white">
                      GeoJSON
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-center w-3/4">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-white border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="text-drag-text whitespace-pre-wrap">{uploadPrompt}</p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        submitUpload(e);
                      }}
                    />
                  </label>
                </div>

                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-5"
                  onClick={(e) => {
                    handleSubmit(e);
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
