import { useState } from 'react';
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

  return (
    <div className="flex flex-row">
      <input
        type="text"
        className="m-2 block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="key"
        disabled={viewOnly}
      ></input>

      <input
        type="text"
        className="m-2 block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="value"
        disabled={viewOnly}
      ></input>
    </div>
  );
};

interface IPropertyEditor {
  onSave?: (properties: Record<string, string>) => void;
  properties: Record<string, string>;
  viewOnly: boolean;
}

const PropertyEditor = ({ onSave, properties, viewOnly }: IPropertyEditor) => {
  const [props, setProps] = useState(properties);

  return (
    <div className="bg-gray m-2">
      <ul className="text-black">
        {Object.entries(props).map(([k, v]) => (
          <li key={k}>
            <Property k={k} v={v} onUpdate={() => {}} viewOnly={viewOnly} />
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
