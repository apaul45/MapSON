import {
  Collapse,
  Dialog,
  DialogBody,
  DialogHeader,
  List,
  ListItem,
} from '@material-tailwind/react';
import { useState } from 'react';

interface ITutorialDialog {
  isOpen: boolean;
  closeDialog: Function;
}

export default function TutorialDialog({ isOpen, closeDialog }: ITutorialDialog) {
  const [openTuto, setOpenTuto] = useState<Array<number>>([]);

  const handleOpenTutorial = (index: number) => {
    setOpenTuto((prev) => {
      const exist = openTuto.indexOf(index);
      let old: number[] = [...prev];
      if (exist > -1) {
        old.splice(exist, 1);
        return old;
      } else {
        old.push(index);
        return old;
      }
    });
  };

  const handleShowTutorial = (index: number) => {
    return openTuto.indexOf(index) > -1;
  };

  const itemList = [
    {
      name: 'Modify Region Name',
      src: '/tutorial/addName.gif',
      description: 'Region name will pop up on mouse hover once added',
    },
    {
      name: 'Modify Region Color',
      src: '/tutorial/addColor.gif',
      description: 'Toggle color showing upon entering/exiting color picker',
    },
    {
      name: 'Add Custom Region Properties',
      src: '/tutorial/addProp.gif',
      description: 'Note duplicate property key will not work',
    },
    {
      name: 'Enter Vertices Editing Mode',
      src: '/tutorial/showVertices.gif',
      description:
        "Double click on the region to enter vertices editing mode. If there a lot of vertices on a region, the map will dynamically render upto 50 of the vertex markers closest to the user's cursor",
    },
    {
      name: 'Add a Vertex',
      src: '/tutorial/addVertices.gif',
      description:
        'In vertices editing mode, click on the green circles on the border of a region to add a vertex',
    },
    {
      name: 'Remove a Vertex',
      src: '/tutorial/deleteVertice.gif',
      description:
        'Right click on vertices to remove them. Note: borders will be re-adjusted if necessary',
    },
    {
      name: 'Add a Region (feature)',
      src: '/tutorial/addRegion.gif',
      description: 'Click on the add polygon icon to start. Click on the cancel button to exit',
    },
    {
      name: 'Remove a Feature',
      src: '/tutorial/removeFeature.gif',
      description: 'In remove feature move, left click on any region to move it',
    },
    {
      name: 'Merge Regions',
      src: '/tutorial/mergeRegion.gif',
      description: '',
    },
    {
      name: 'Split a Region',
      src: '/tutorial/splitRegion.gif',
      description: 'Select the region first, then enter split region mode',
    },
    {
      name: 'Simplify Regions',
      src: '/tutorial/simplify.gif',
      description: 'Note that this operation cannot be undone',
    },
    {
      name: 'Save Thumbnail',
      src: '/tutorial/saveThumbnail.gif',
      description: 'Click Exit project to save map thumbnail',
    },
    {
      name: 'Inivte a User to Edit',
      src: '/tutorial/invite.gif',
      description: 'The share dialog can be displayed from the project menu or from the nav bar',
    },
    {
      name: 'Live Collaboration',
      src: '/tutorial/liveCollab.gif',
      description: 'This application supports live collaboration among users',
    },
    {
      name: 'Edit Map Name',
      src: '/tutorial/editName.gif',
      description: 'Double click on name to enter edit mode, press enter to save',
    },
  ];

  return (
    <Dialog open={isOpen} handler={() => closeDialog()} size="xl" className="bg-gray block">
      <DialogHeader className="text-white flex flex-col">Tutorial</DialogHeader>
      <DialogBody className=" max-h-[55rem] overflow-scroll">
        <List>
          {itemList.map((item, index) => (
            <ListItem
              className="text-white block"
              onClick={() => handleOpenTutorial(index)}
              key={item.name}
            >
              <p>{item.name}</p>
              <Collapse open={handleShowTutorial(index)}>
                <img src={item.src}></img>
                {item.description && <span>{item.description}</span>}
              </Collapse>
            </ListItem>
          ))}
        </List>
      </DialogBody>
    </Dialog>
  );
}
