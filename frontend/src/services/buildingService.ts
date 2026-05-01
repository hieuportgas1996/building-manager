import api from './api';

export interface BuildingDto {
  id: number;
  name: string;
  address: string;
  totalFloors: number;
  totalArea: number;
  description?: string;
  floors: FloorDto[];
}

export interface FloorDto {
  id: number;
  buildingId: number;
  buildingName: string;
  floorNumber: number;
  totalArea: number;
  officeCount: number;
}

export const buildingService = {
  getAll: () => api.get<BuildingDto[]>('/buildings').then(r => r.data),
  getById: (id: number) => api.get<BuildingDto>(`/buildings/${id}`).then(r => r.data),
  create: (data: Omit<BuildingDto, 'id' | 'totalFloors' | 'floors'>) =>
    api.post<BuildingDto>('/buildings', data).then(r => r.data),
  update: (id: number, data: Omit<BuildingDto, 'id' | 'totalFloors' | 'floors'>) =>
    api.put<BuildingDto>(`/buildings/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/buildings/${id}`),
  getFloors: (buildingId: number) =>
    api.get<FloorDto[]>(`/buildings/${buildingId}/floors`).then(r => r.data),
  createFloor: (buildingId: number, data: { floorNumber: number; totalArea: number }) =>
    api.post<FloorDto>(`/buildings/${buildingId}/floors`, data).then(r => r.data),
  deleteFloor: (floorId: number) => api.delete(`/buildings/floors/${floorId}`),
};
