import { api } from '@/lib/api';
import { Tenant } from './tenants.service';

export interface InquiryOption {
    id: number;
    inquiryId: number;
    landResourceId?: number;
    plotId?: number;
    roomId?: number;
    isInterested: boolean;
    adminNote?: string;
    landResource?: any;
    plot?: any;
    room?: any;
    createdAt: string;
}

export interface InquiryTimeline {
    id: number;
    inquiryId: number;
    stage: string;
    action: string;
    performedBy?: number;
    remarks?: string;
    metadata: any;
    createdAt: string;
    user?: any;
}

export interface Inquiry {
    id: number;
    inquiryNumber?: string;
    inquiryType?: string;
    tenantId: number;
    applicantName?: string;
    legalName?: string;
    tradingName?: string;
    registrationNumber?: string;
    applicationDate: string;
    purpose?: string;
    requestedSize?: number;

    // Preferences
    propertyTypeId?: number;
    minArea?: number;
    maxArea?: number;
    minBaseRent?: number;
    maxBaseRent?: number;
    preferredMoveIn?: string;
    furnitureStatusId?: number;
    officeSpreadId?: number;
    leaseTermMonths?: number;
    note?: string;

    // Proposal
    proposalSubmissionDate?: string;
    capexFDI?: number;
    estimatedJobs?: number;
    proposalDecision?: string;
    proposalDecisionDate?: string;
    proposalRemarks?: string;
    proposalDecisionBy?: number;

    // Offer
    offerNumber?: string;
    offerDate?: string;
    offerRemarks?: string;
    offerValidUntil?: string;
    offerStatus?: string;
    offerAcceptedDate?: string;
    offeredSpace?: number;
    offeredRate?: number;
    offeredRateEtb?: number;
    landPriceEtb?: number;
    totalLandValue?: number;
    offeredCurrency?: string;
    offeredAmount?: number;
    landTitleRef?: string;
    phase?: string;
    exchangeRate?: number;
    rateType?: string;

    // Assigned Locations
    assignedZoneId?: number;
    assignedBlockId?: number;
    assignedPlotId?: number;
    assignedRoomId?: number;
    assignedLandResourceId?: number;

    // Contract
    leaseId?: number;
    contractDate?: string;
    contractDuration?: number;
    contractStartDate?: string;
    contractEndDate?: string;
    contractStatus?: string;
    gracePeriod?: number;
    gracePeriodOffset?: number;
    gracePeriodRemarks?: string;
    residencyDate?: string;
    securityDeposit?: number;
    advancePayment?: number;
    contractRemarks?: string;

    // Handover & Residency
    handoverDate?: string;
    handoverRemarks?: string;
    handoverCompleted?: boolean;

    // Exit
    exitDate?: string;
    exitReason?: string;
    exitRemarks?: string;

    status: string;
    metadata: any;
    createdAt: string;
    updatedAt: string;

    // Relations
    tenant?: Tenant;
    propertyType?: any;
    furnitureStatus?: any;
    officeSpread?: any;
    assignedZone?: any;
    assignedPlot?: any;
    assignedRoom?: any;
    lease?: any;
    timeline?: InquiryTimeline[];
    options?: InquiryOption[];
    _count?: {
        options: number;
        timeline: number;
    };
}

class InquiriesService {
    private readonly endpoint = '/inquiries';

    async getAll(filters?: any) {
        return api.get<Inquiry[]>(this.endpoint, { params: filters });
    }

    async getOne(id: number) {
        return api.get<Inquiry>(`${this.endpoint}/${id}`);
    }

    async create(data: Partial<Inquiry>) {
        return api.post<Inquiry>(this.endpoint, data);
    }

    async updateStatus(id: number, status: string, remarks?: string) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}/status`, { status, remarks });
    }

    async submitProposal(id: number, data: any) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}/proposal/submit`, data);
    }

    async evaluateProposal(id: number, data: { decision: string; remarks?: string }) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}/proposal/evaluate`, data);
    }

    async generateOffer(id: number, data: any) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}/offer/generate`, data);
    }

    async acceptOffer(id: number) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}/offer/accept`);
    }

    async fulfillContract(id: number, data: any) {
        return api.post<Inquiry>(`${this.endpoint}/${id}/contract/fulfill`, data);
    }

    async recordExit(id: number, data: any) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}/exit`, data);
    }

    async addOption(inquiryId: number, data: any) {
        return api.post<InquiryOption>(`${this.endpoint}/${inquiryId}/options`, data);
    }

    async markInterested(optionId: number, isInterested: boolean) {
        return api.patch<any>(`${this.endpoint}/options/${optionId}/interest`, { isInterested });
    }

    async recordHandover(id: number, data: { handoverDate: string; remarks?: string; isCompleted?: boolean }) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}/handover`, data);
    }

    async update(id: number, data: any) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}`, data);
    }
}

export const inquiriesService = new InquiriesService();
