import { ProjectNavbar } from '../ProjectNavbar'
import { Map } from '../../types'
import { useNavigate } from 'react-router-dom'
import DeletedMapDialog from '../dialogs/DeletedMapDialog'
import ShareMapDialog from '../dialogs/ShareMapDialog'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import MapComponent, { SelectedFeature } from '../map/MapComponent'
import { RootState } from '../../models'
import { useSelector } from 'react-redux'
import CommentsSidePanel from '../CommentsSidePanel'
import ProjectSidePanel from '../ProjectSidePanel'

const defaultMap: Map = {
  _id: 'DEFAULT_MAP',
  name: 'My Map',
  username: '',
  upvotes: [],
  downvotes: [],
  forks: 0,
  downloads: 0,
  published: { isPublished: false },
  comments: [],
  features: [],
}

export const ProjectScreen = () => {
  const navigate = useNavigate()

  const user = useSelector((state: RootState) => state.user.currentUser)

  const { id } = useParams()

  useEffect(() => {
    //load data from db
    setMap(defaultMap)
  }, [id])

  const [map, setMap] = useState<Map>(defaultMap)
  const [isMapDeleted, setMapDeleted] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null)
  // true for comments, false for property editor
  const [sidePanelToggle, setSidePanelToggle] = useState(false)

  const closeDeletedDialog = () => {
    setMapDeleted(false)
    //navigate(user ? '/home' : '/discover');
  }

  const closeShareDialog = () => {
    setShareOpen(false)
  }

  // const canEdit = (user && user.maps?.some((v) => v._id === map._id)) ?? false;
  const canEdit = true // allow editing for build 2

  return (
    <div className="bg-black w-screen h-[calc(100vh-64px)]">
      <ProjectNavbar
        shareOpen={shareOpen}
        setShareOpen={setShareOpen}
        mapName={map.name}
        setMapName={(name: string) => setMap({ ...map, name: name })}
        setSidePanelToggle={setSidePanelToggle}
        sidePanelToggle={sidePanelToggle}
      />

      <div className="flex flex-row">
        <MapComponent
          canEdit={canEdit}
          setSelectedFeature={setSelectedFeature}
          key={'MAP'}
          {...map}
        />
        {!sidePanelToggle && (
          <ProjectSidePanel selectedFeature={selectedFeature} />
        )}
        {sidePanelToggle && <CommentsSidePanel />}
      </div>

      <DeletedMapDialog
        isOpen={isMapDeleted}
        closeDialog={closeDeletedDialog}
      />
      <ShareMapDialog isOpen={shareOpen} closeDialog={closeShareDialog} />
    </div>
  )
}