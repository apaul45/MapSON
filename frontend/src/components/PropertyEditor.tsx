import { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';

interface IProperty {
  k?: string;
  v?: string;
  onUpdate: (newKey: string, newValue?: string, oldKey?: string, deleteKey?: boolean) => void;
  viewOnly: boolean;
  setProp: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}
const Property = ({ k, v, onUpdate, viewOnly, setProp }: IProperty) => {
  const [key, setKey] = useState(k);
  const [value, setValue] = useState(v);

  const updateKey = (newKey: string) => {
    setProp((previous: Record<string, any>) => {
      delete previous[key!];
      previous[newKey] = value;
      return previous;
    });
    setKey(newKey);
  };

  const updateValue = (newValue: string) => {
    setProp((previous: Record<string, any>) => {
      previous[key!] = newValue;
      return previous;
    });
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
    </div>
  );
};

interface IPropertyEditor {
  onSave?: (properties: Record<string, any>) => void;
  properties: Record<string, any>;
  viewOnly: boolean;
}

const PropertyEditor = ({ onSave, properties, viewOnly }: IPropertyEditor) => {
  const [props, setProps] = useState(properties);
  useEffect(() => {
    setProps(properties);
  }, [properties]);

  return (
    <div className="bg-gray m-2">
      <ul className="text-black">
        {Object.entries(props).map(([k, v]) => (
          <li key={k}>
            <Property k={k} v={v} onUpdate={() => {}} viewOnly={viewOnly} setProp={setProps} />
          </li>
        ))}
      </ul>

      {!viewOnly && (
        <div>
          <Button className="m-2" onClick={() => onSave?.(props)}>
            Save
          </Button>
          <Button
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
