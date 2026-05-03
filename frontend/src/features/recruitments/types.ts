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

export interface RecruitmentCreatePayload {
  position: string;
  companyName: string;
  department: string;
  recruitmentPost: string;
  jobTags: string;
  headcount: number | null;
  city: string;
  workLocation: string;
  salary: string;
  requiredArrivalDate: string;
  recruitmentProgress: string;
  owner: string;
  contactPhone: string;
  jobDescription: string;
  jobRequirement: string;
  skillRequirement: string;
  welfare: string;
  follower: string;
  level: string;
  remark: string;
  cspmPreferred: boolean;
}

export interface RecruitmentDetail extends Omit<RecruitmentCreatePayload, 'headcount'> {
  id: string;
  headcount: number;
  status: string;
}

export interface RecruitmentCreateResponse {
  id: string;
  message: string;
  recruitment: RecruitmentDetail;
}
