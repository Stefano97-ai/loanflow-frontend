import api from './api';

export const loanService = {
  // Para el admi
  getAllLoans: () => api.get('/loans/all'),
  createLoanForClient: (data) => api.post('/loans', data),
  updateLoanStatus: (id, status) => api.put(`/loans/${id}/status`, { status }),
  getLoanDetail: (id) => api.get(`/loans/${id}`),
  getLoanTypes: () => api.get('/loan-types'),

  // Client
  getMyLoans: () => api.get('/loans/my'),
  requestLoan: (data) => api.post('/loans', data),
};