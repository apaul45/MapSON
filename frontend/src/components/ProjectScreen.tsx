import { useState } from 'react'
import { ProjectNavbar } from './ProjectNavbar'
import { Map } from '../types'
import { FeatureCollection } from 'geojson'
import { useNavigate } from 'react-router-dom'
import { store } from '../models'
import DeletedMapDialog from './DeletedMapDialog'
import ShareMapDialog from './ShareMapDialog'

const defaultMap: Map = {
  name: "My Map",
  username: "",
  upvotes: [],
  downvotes: [], 
  forks: 0,
  downloads: 0, 
  published: {isPublished: false}, 
  comments: [],
  features: [] as unknown as FeatureCollection
}

export const ProjectScreen = () => {
  const navigate = useNavigate();

  const user = store.getState().user.currentUser;

  const [map, setMap] = useState<Map>(defaultMap);
  const [isMapDeleted, setMapDeleted] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const closeDeletedDialog = () => {
    setMapDeleted(false);
    //navigate(user ? '/home' : '/discover');
  }

  const closeShareDialog = () => { setShareOpen(false); }

  return (
    <div className='bg-black'>
      <ProjectNavbar 
       commentsOpen={commentsOpen} 
       setCommentsOpen={setCommentsOpen} 
       shareOpen={shareOpen} 
       setSharOpen={setShareOpen} 
       mapName = {map.name}
       setMapName = {(name: string) => setMap({...map, name: name})}
      />
      <DeletedMapDialog isOpen={isMapDeleted} closeDialog={closeDeletedDialog} />
      <ShareMapDialog isOpen={shareOpen} closeDialog={closeShareDialog} />
    </div>
  )
}