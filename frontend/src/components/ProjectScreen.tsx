import React, { useState } from 'react'
import { ProjectNavbar } from './ProjectNavbar'
import { Map } from '../types'
import { FeatureCollection } from 'geojson'

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
  const [map, setMap] = useState<Map>(defaultMap);
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <div>
      <ProjectNavbar 
       commentsOpen={commentsOpen} 
       setCommentsOpen={setCommentsOpen} 
       mapName = {map.name}
       setMapName = {(name: string) => setMap({...map, name: name})}
      />
    </div>
  )
}
