import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const tenderAPI = {
  getAll: () => api.get('/tenders'),
  getById: (id) => api.get(`/tenders/${id}`),
  upload: (formData) => api.post('/tenders/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }),
  createManual: (data) => api.post('/tenders/manual', data),
  update: (id, data) => api.put(`/tenders/${id}`, data),
  delete: (id) => api.delete(`/tenders/${id}`),
  savePaymentProof: (id, paymentProof) => api.put(`/tenders/${id}`, { paymentProof }),
  saveProposalContent: (id, docName, content) => api.put(`/tenders/${id}`, { docName, content }),
  saveBinderSequence: (id, binderSequence) => api.put(`/tenders/${id}`, { binderSequence })
};

export const analysisAPI = {
  recalculateGoNoGo: (tenderId) => api.post(`/analysis/gonogo/${tenderId}`)
};

export const complianceAPI = {
  getItems: (tenderId) => api.get(`/compliance/${tenderId}`),
  addItem: (tenderId, item) => api.post(`/compliance/${tenderId}`, item),
  autoGenerate: (tenderId) => api.post(`/compliance/${tenderId}/auto-generate`),
  updateItem: (tenderId, itemId, data) => api.put(`/compliance/${tenderId}/items/${itemId}`, data),
  deleteItem: (tenderId, itemId) => api.delete(`/compliance/${tenderId}/items/${itemId}`)
};

export const proposalAPI = {
  get: (tenderId) => api.get(`/proposals/${tenderId}`),
  update: (tenderId, data) => api.put(`/proposals/${tenderId}`, data),
  generateSection: (tenderId, sectionName, customInstructions) =>
    api.post(`/proposals/${tenderId}/generate`, { sectionName, customInstructions })
};

export const boqAPI = {
  getItems: (tenderId) => api.get(`/boq/${tenderId}`),
  saveBatch: (tenderId, boqItems) => api.post(`/boq/${tenderId}/batch`, { boqItems }),
  addItem: (tenderId, item) => api.post(`/boq/${tenderId}/items`, item),
  deleteItem: (tenderId, itemId) => api.delete(`/boq/${tenderId}/items/${itemId}`)
};

export const annexureAPI = {
  getForTender: (tenderId) => api.get(`/annexures/${tenderId}`)
};

export const companyProfileAPI = {
  get: () => api.get('/company-profile'),
  update: (data) => api.put('/company-profile', data),
  uploadDocument: (formData) => api.post('/company-profile/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (docId) => api.delete(`/company-profile/documents/${docId}`)
};

export const chatAPI = {
  sendQuery: (tenderId, query, chatHistory) => api.post(`/chat/${tenderId}`, { query, chatHistory })
};

export const exportAPI = {
  downloadPackage: async (tenderId, format = 'pdf', selectedSections = ['executiveSummary', 'technicalApproach', 'complianceMatrix', 'boqSummary']) => {
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
