const API_BASE = '/api/v1';

let authToken: string | null = localStorage.getItem('fieldnerve_token');

export function setApiToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('fieldnerve_token', token);
  } else {
    localStorage.removeItem('fieldnerve_token');
  }
}

export function getApiToken() {
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch('/health');
    return res.json();
  },

  // Auth
  login: async (email: string, password = 'Password123!') => {
    const res: any = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setApiToken(res.data.token);
    return res.data;
  },
  register: async (payload: { email: string; password: string; name: string; role?: string }) => {
    const res: any = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setApiToken(res.data.token);
    return res.data;
  },
  me: async () => {
    const res: any = await request('/auth/me');
    return res.data;
  },

  // Vendors
  getVendors: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') query.append(key, String(val));
    });
    const res: any = await request(`/vendors?${query.toString()}`);
    return { items: res.data, meta: res.meta };
  },
  getVendorById: async (id: string) => {
    const res: any = await request(`/vendors/${id}`);
    return res.data;
  },
  createVendor: async (payload: any) => {
    const res: any = await request('/vendors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  updateVendor: async (id: string, payload: any) => {
    const res: any = await request(`/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  deleteVendor: async (id: string) => {
    const res: any = await request(`/vendors/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },

  // Documents
  getVendorDocuments: async (vendorId: string) => {
    const res: any = await request(`/vendor-documents/vendor/${vendorId}`);
    return res.data;
  },
  createDocument: async (payload: any) => {
    const res: any = await request('/vendor-documents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
  updateDocumentStatus: async (docId: string, status: string) => {
    const res: any = await request(`/vendor-documents/${docId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },
  deleteDocument: async (docId: string) => {
    const res: any = await request(`/vendor-documents/${docId}`, {
      method: 'DELETE',
    });
    return res.data;
  },
  reviewCompliance: async (vendorId: string, notes?: string, overrideStatus?: string) => {
    const res: any = await request(`/vendor-documents/vendor/${vendorId}/review-compliance`, {
      method: 'POST',
      body: JSON.stringify({ notes, overrideStatus }),
    });
    return res.data;
  },
  verifyAllDocuments: async (vendorId: string) => {
    const res: any = await request(`/vendor-documents/vendor/${vendorId}/verify-all`, {
      method: 'POST',
    });
    return res.data;
  },

  // Work Requirements
  getWorkRequirements: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') query.append(key, String(val));
    });
    const res: any = await request(`/work-requirements?${query.toString()}`);
    return { items: res.data, meta: res.meta };
  },
  getWorkRequirementById: async (id: string) => {
    const res: any = await request(`/work-requirements/${id}`);
    return res.data;
  },
  createWorkRequirement: async (payload: any) => {
    const res: any = await request('/work-requirements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Recommendations
  getRecommendations: async (requirementId: string, options: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(options).forEach(([k, v]) => {
      if (v !== undefined) query.append(k, String(v));
    });
    const res: any = await request(`/work-requirements/${requirementId}/recommendations?${query.toString()}`);
    return {
      recommendations: res.data,
      meta: res.meta,
    };
  },
  getRecommendationHistory: async (requirementId: string) => {
    const res: any = await request(`/work-requirements/${requirementId}/recommendations/history`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) query.append(k, String(v));
    });
    const res: any = await request(`/audit-logs?${query.toString()}`);
    return { items: res.data, meta: res.meta };
  },
};
