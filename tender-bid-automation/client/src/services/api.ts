import axios, { AxiosResponse } from 'axios';
import {
  Tender,
  ComplianceItem,
  BOQItem,
  ProposalSections,
  CompanyProfile,
  PaymentProof,
  ChatHistoryItem
} from '../types';

const api = axios.create({
  baseURL: '/api'
});

export const tenderAPI = {
  getAll: (): Promise<AxiosResponse<{ success?: boolean; tenders: Tender[] } | any>> => api.get('/tenders'),
  getById: (id: string | number): Promise<AxiosResponse<{ success?: boolean; tender: Tender } | any>> => api.get(`/tenders/${id}`),
  upload: (formData: FormData): Promise<AxiosResponse<any>> => api.post('/tenders/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }),
  createManual: (data: Partial<Tender>): Promise<AxiosResponse<{ success?: boolean; tender: Tender } | any>> => api.post('/tenders/manual', data),
  update: (id: string | number, data: Partial<Tender>): Promise<AxiosResponse<{ success?: boolean; tender: Tender } | any>> => api.put(`/tenders/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<any>> => api.delete(`/tenders/${id}`),
  savePaymentProof: (id: string | number, paymentProof: PaymentProof): Promise<AxiosResponse<any>> => api.put(`/tenders/${id}`, { paymentProof }),
  saveProposalContent: (id: string | number, docName: string, content: string): Promise<AxiosResponse<any>> => api.put(`/tenders/${id}`, { docName, content }),
  saveBinderSequence: (id: string | number, binderSequence: string[]): Promise<AxiosResponse<any>> => api.put(`/tenders/${id}`, { binderSequence })
};

export const analysisAPI = {
  recalculateGoNoGo: (tenderId: string | number): Promise<AxiosResponse<any>> => api.post(`/analysis/gonogo/${tenderId}`)
};

export const complianceAPI = {
  getItems: (tenderId: string | number): Promise<AxiosResponse<ComplianceItem[] | any>> => api.get(`/compliance/${tenderId}`),
  addItem: (tenderId: string | number, item: Partial<ComplianceItem>): Promise<AxiosResponse<any>> => api.post(`/compliance/${tenderId}`, item),
  autoGenerate: (tenderId: string | number): Promise<AxiosResponse<any>> => api.post(`/compliance/${tenderId}/auto-generate`),
  updateItem: (tenderId: string | number, itemId: string | number, data: Partial<ComplianceItem>): Promise<AxiosResponse<any>> => api.put(`/compliance/${tenderId}/items/${itemId}`, data),
  deleteItem: (tenderId: string | number, itemId: string | number): Promise<AxiosResponse<any>> => api.delete(`/compliance/${tenderId}/items/${itemId}`)
};

export const proposalAPI = {
  get: (tenderId: string | number): Promise<AxiosResponse<ProposalSections | any>> => api.get(`/proposals/${tenderId}`),
  update: (tenderId: string | number, data: Partial<ProposalSections>): Promise<AxiosResponse<ProposalSections | any>> => api.put(`/proposals/${tenderId}`, data),
  generateSection: (tenderId: string | number, sectionName: string, customInstructions?: string): Promise<AxiosResponse<any>> =>
    api.post(`/proposals/${tenderId}/generate`, { sectionName, customInstructions })
};

export const boqAPI = {
  getItems: (tenderId: string | number): Promise<AxiosResponse<BOQItem[] | any>> => api.get(`/boq/${tenderId}`),
  saveBatch: (tenderId: string | number, boqItems: BOQItem[]): Promise<AxiosResponse<any>> => api.post(`/boq/${tenderId}/batch`, { boqItems }),
  addItem: (tenderId: string | number, item: Partial<BOQItem>): Promise<AxiosResponse<any>> => api.post(`/boq/${tenderId}/items`, item),
  deleteItem: (tenderId: string | number, itemId: string | number): Promise<AxiosResponse<any>> => api.delete(`/boq/${tenderId}/items/${itemId}`)
};

export const annexureAPI = {
  getForTender: (tenderId: string | number): Promise<AxiosResponse<any>> => api.get(`/annexures/${tenderId}`)
};

export const companyProfileAPI = {
  get: (): Promise<AxiosResponse<{ success?: boolean; companyProfile: CompanyProfile } | any>> => api.get('/company-profile'),
  update: (data: Partial<CompanyProfile>): Promise<AxiosResponse<{ success?: boolean; companyProfile: CompanyProfile } | any>> => api.put('/company-profile', data),
  uploadDocument: (formData: FormData): Promise<AxiosResponse<any>> => api.post('/company-profile/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateDocument: (docId: string | number, formData: FormData): Promise<AxiosResponse<any>> => api.put(`/company-profile/documents/${docId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (docId: string | number): Promise<AxiosResponse<any>> => api.delete(`/company-profile/documents/${docId}`)
};

export const chatAPI = {
  sendQuery: (tenderId: string | number, query: string, chatHistory: ChatHistoryItem[]): Promise<AxiosResponse<any>> => api.post(`/chat/${tenderId}`, { query, chatHistory })
};

export const exportAPI = {
  downloadPackage: async (
    tenderId: string | number,
    format: 'pdf' | 'docx' | string = 'pdf',
    selectedSections: string[] = ['executiveSummary', 'technicalApproach', 'complianceMatrix', 'boqSummary']
  ): Promise<void> => {
    const response = await api.post(
      `/export/${tenderId}`,
      { format, selectedSections },
      { responseType: 'blob' }
    );
    const blob = new Blob([response.data], {
      type: format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Tender_Bid_Package_${tenderId}_${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default api;
