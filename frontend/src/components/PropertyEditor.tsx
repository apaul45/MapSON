import { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import { SketchPicker } from 'react-color';
import Popup from 'reactjs-popup';
import { SELECTED, SelectedFeature } from './map/MapComponent';

interface IProperty {
  k?: string;
  v?: string;
  onUpdate: (newKey: string, newValue?: string, oldKey?: string, deleteKey?: boolean) => void;
  viewOnly: boolean;
  selectedFeature: SelectedFeature | null;
}
const Property = ({ k, v, onUpdate, viewOnly, selectedFeature }: IProperty) => {
  const [key, setKey] = useState(k);
  const [value, setValue] = useState(v);
  const [color, setColor] = useState(key === 'color' ? (value === '' ? 'blue' : value) : null);

  const updateKey = (newKey: string) => {
    onUpdate(newKey, value, key, false);
    setKey(newKey);
  };

  const updateValue = (newValue: string) => {
    onUpdate(key!, newValue, key, false);
    setValue(newValue);
  };

  return (
    <div className="flex flex-row">
      <input
        type="text"
        className="m-2 block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={key}
        onChange={(e) => updateKey(e.target.value)}
        placeholder="key"
        disabled={viewOnly}
      ></input>

      <input
        type="text"
        className="m-2 block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={value}
        onChange={(e) => updateValue(e.target.value)}
        placeholder={key === 'name' ? 'name value' : key === 'color' ? 'color value' : 'value'}
        disabled={viewOnly}
      ></input>
      {key === 'color' ? (
        <Popup
          trigger={
            <button data-popover-target="popover-bottom-end" className="">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="gray"
                className="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                />
              </svg>
            </button>
          }
          position="bottom right"
          onOpen={() =>
            selectedFeature?.layer.setStyle({
              fillColor: value === '' ? 'blue' : value,
              fillOpacity: 0.5,
              color: value === '' ? 'blue' : value,
            })
          }
          onClose={() => selectedFeature?.layer.setStyle(SELECTED)}
        >
          <SketchPicker
            //@ts-ignore
            color={color}
            onChangeComplete={(color) => {
              updateValue(color.hex);
            }}
            onChange={(color) => {
              // @ts-ignore
              setColor(color.rgb);
              selectedFeature?.layer.setStyle({
                fillColor: color.hex,
                fillOpacity: 0.2,
                color: color.hex,
              });
            }}
          ></SketchPicker>
        </Popup>
      ) : null}

      <button onClick={() => onUpdate(key!, value, key, true)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="gray"
          className=" w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </button>
    </div>
  );
};

interface IPropertyEditor {
  onSave?: (properties: Record<string, any>) => void;
  properties: Record<string, any>;
  viewOnly: boolean;
  type: string;
  selectedFeature: SelectedFeature | null;
}

const PropertyEditor = ({
  onSave,
  properties,
  viewOnly,
  type,
  selectedFeature,
}: IPropertyEditor) => {
  const [props, setProps] = useState(properties);
  useEffect(() => {
    setProps(properties);
  }, [properties]);

  const onUpdate = (newKey: string, newValue?: string, oldKey?: string, deleteKey?: boolean) => {
    if (deleteKey) {
      setProps((prev) => {
        let newState = Object.fromEntries(Object.entries(prev).filter(([k, v]) => k !== newKey));
        return newState;
      });
    } else {
      setProps((prev) => {
        let newState = Object.fromEntries(
          Object.entries(prev).map(([k, v]) => {
            if (k === oldKey) return [newKey, newValue];
            return [k, v];
          })
        );
        return newState;
      });
    }
  };

  return (
    <div className="bg-gray m-2">
      <ul className="text-black">
        {Object.entries(props).map(([k, v], i) => (
          <li key={i}>
            <Property
              k={k}
              v={v}
              onUpdate={onUpdate}
              viewOnly={viewOnly}
              selectedFeature={selectedFeature}
            />
          </li>
        ))}
      </ul>

      {!viewOnly && (
        <div>
          <Button id={type + '-save-button'} className="m-2" onClick={() => onSave?.(props)}>
            Save
          </Button>
          <Button
            id={type + '-add-button'}
            className="m-2"
            variant="text"
            onClick={() => {
              setProps((prev) => {
                return { ...prev, '': '' };
              });
            }}
          >
            Add Item
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyEditor;
