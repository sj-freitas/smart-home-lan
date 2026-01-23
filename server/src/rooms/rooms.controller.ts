import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('state')
  getState() {
    return this.roomsService.getState();
  }

  @Post(':id/patch')
  patchRoom(@Param('id') id: string, @Body() patch: any) {
    const updated = this.roomsService.updateRoom(id, patch);
    if (!updated) return { error: 'room-not-found' };
    return { ok: true, room: updated };
  }
}
