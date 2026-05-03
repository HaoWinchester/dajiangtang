export interface RecruitmentListItem {
  id: string;
  position: string;
  salary: string;
  companyName: string;
  city: string;
  owner: string;
  headcount: number;
}

export interface RecruitmentListResponse {
  items: RecruitmentListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  canCreate: boolean;
}

export interface RecruitmentListQuery {
  positionKeyword?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}
