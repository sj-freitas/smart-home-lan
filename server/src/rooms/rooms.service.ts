import { Injectable } from '@nestjs/common';
import { state } from '../state';

@Injectable()
export class RoomsService {
  getState() {
    return state;
  }

  updateRoom(roomId: string, patch: any) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return null;
    Object.assign(room, patch);
    return room;
  }
}
