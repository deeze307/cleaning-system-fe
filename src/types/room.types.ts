export interface Room {
  id: string
  name: string
  buildingId: string
  bedConfiguration: {
    kingBeds: number
    individualBeds: number
  }
  bedsSummary: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRoomData {
  name: string
  buildingId: string
  bedConfiguration: {
    kingBeds: number
    individualBeds: number
  }
}

export interface UpdateRoomData {
  name?: string
  bedConfiguration?: {
    kingBeds: number
    individualBeds: number
  }
  isActive?: boolean
}