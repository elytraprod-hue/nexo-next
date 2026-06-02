export type RelationshipType = "cliente" | "recorrente" | "parceria" | "freelancer";

export type Client = {
  id: string;
  workspaceId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  relationshipType: RelationshipType;
  service?: string;
  monthlyValue?: number;
  partnerTerms?: string;
  freelancerRole?: string;
  freelancerRate?: number;
  nextAction?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectStatus = "lead" | "briefing" | "production" | "review" | "delivered" | "archived";

export type Project = {
  id: string;
  workspaceId: string;
  clientId?: string;
  title: string;
  presetId?: string;
  status: ProjectStatus;
  deadline?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
};
