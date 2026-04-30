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
  pageSize: 10;
  totalItems: number;
  totalPages: number;
  canCreate: boolean;
}

export interface RecruitmentListQuery {
  positionKeyword?: string;
  city?: string;
  page?: number;
  pageSize?: 10;
}
