export interface Company {
  id: string
  name: string
  description?: string
  plan: 'basic' | 'premium' | 'enterprise'
  maxBuildings: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyData {
  name: string
  description?: string
  plan: 'basic' | 'premium' | 'enterprise'
  maxBuildings: number
  isActive?: boolean
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {}