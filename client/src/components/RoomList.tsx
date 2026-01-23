import React from 'react'
import { RoomState } from '../types'
import RoomCard from './RoomCard'

export default function RoomList({ rooms, onPatch }:{rooms:RoomState[], onPatch:(id:string, patch:any)=>void}){
  return (
    <div className='grid'>
      {rooms.map(r => (
        <RoomCard key={r.id} room={r} onPatch={onPatch} />
      ))}
    </div>
  )
}
