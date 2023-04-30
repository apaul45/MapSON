import { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';

interface IProperty {
  k?: string;
  v?: string;
  onUpdate: (newKey: string, newValue?: string, oldKey?: string, deleteKey?: boolean) => void;
  viewOnly: boolean;
}
const Property = ({ k, v, onUpdate, viewOnly }: IProperty) => {
  const [key, setKey] = useState(k);
  const [value, setValue] = useState(v);

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
        placeholder="value"
        disabled={viewOnly}
      ></input>
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
}

const PropertyEditor = ({ onSave, properties, viewOnly, type }: IPropertyEditor) => {
  const [props, setProps] = useState(properties);
  useEffect(() => {
    setProps(properties);
  }, [properties]);

  const onUpdate = (newKey: string, newValue?: string, oldKey?: string, deleteKey?: boolean) => {
    if (deleteKey) {
      setProps((prev) => {
        let oldState = { ...prev };
        delete oldState[oldKey!];
        return oldState;
      });
    } else {
      setProps((prev) => {
        let oldState = { ...prev };
        delete oldState[oldKey!];
        oldState[newKey] = newValue;
        return oldState;
      });
    }
  };

  return (
    <div className="bg-gray m-2">
      <ul className="text-black">
        {Object.entries(props).map(([k, v]) => (
          <li key={k}>
            <Property k={k} v={v} onUpdate={onUpdate} viewOnly={viewOnly} />
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
