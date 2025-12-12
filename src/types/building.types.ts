export interface Building {
  id: string
  name: string
  type: 'hotel' | 'apartment' | 'house'
  address: string
  companyId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBuildingData {
  name: string
  type: 'hotel' | 'apartment' | 'house'
  address: string
  companyId?: string // Opcional porque puede venir del usuario autenticado
}

export interface UpdateBuildingData {
  name?: string
  type?: 'hotel' | 'apartment' | 'house'
  address?: string
  isActive?: boolean
}