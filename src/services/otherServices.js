import api from './api';

export const paymentService = {
  payInstallment: (data) => api.post('/payments', data),
  getPaymentsByLoan: (loanId) => api.get(`/payments/loan/${loanId}`),
};

export const simulatorService = {
  simulate: (data) => api.post('/simulator', data),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};