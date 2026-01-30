import React from 'react'
import { Room } from '../types'
import RoomCard from './RoomCard'

export default function RoomList({ rooms, onDeviceAction }:{rooms:Room[], onDeviceAction:(roomId:string, deviceId:string, actionId:string)=>Promise<void>}){
  return (
    <div className='grid'>
      {rooms.map(r => (
        <RoomCard key={r.id} room={r} onDeviceAction={onDeviceAction} />
      ))}
    </div>
  )
}
