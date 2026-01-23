import { RoomState } from '../../client/src/types';

export const state: { rooms: RoomState[] } = {
  rooms: [
    {
      id: 'living-room',
      name: 'Living Room',
      hasAC: true,
      acMode: 'cooling',
      acOn: false,
      acOn: true,
      switches: [
        { id: 'piano', name: 'Piano', on: false },
        { id: 'tv', name: 'Television', on: true }
      ],
      lights: [
        { id: 'living-main-light', name: 'Smart Light', mode: 'warm' }
      ]
    },
    {
      id: 'main-bedroom',
      name: 'Main Bedroom',
      hasAC: true,
      acMode: 'heating',
      acOn: true,
      switches: [
        { id: 'tall-lamp', name: 'Tall Lamp', on: true }
      ],
      lights: [
        { id: 'main-bed-light', name: 'Smart Light', mode: 'night' }
      ]
    },
    {
      id: 'guest-bedroom',
      name: 'Guest Bedroom',
      hasAC: true,
      acMode: 'cooling',
      acOn: false,
      switches: [
        { id: 'bedside-lamp', name: 'Bedside Lamp', on: false }
      ],
      lights: []
    }
  ]
};
