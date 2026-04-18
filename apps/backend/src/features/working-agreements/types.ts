export interface WACategoryDto {
  id: string;
  teamId: string;
  name: string;
  orderIndex: number;
  rules: WARuleDto[];
}

export interface WARuleDto {
  id: string;
  teamId: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  description: string | null;
  isActive: boolean;
  agreedAt: string;
  proposedById: string;
  proposedByName: string;
  lastModifiedById: string;
  lastModifiedByName: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface WAListResponseDto {
  categories: WACategoryDto[];
  uncategorizedRules: WARuleDto[];
}

export interface WAHistoryDto {
  id: string;
  ruleId: string;
  changedById: string;
  changedByName: string;
  changedAt: string;
  changeType: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
}
