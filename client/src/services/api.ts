import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const startResumeRefinement = async (resumeText: string) => {
  const response = await api.post('/resume/refine', { resumeText });
  return response.data;
};

export const analyzeResume = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const autoFillResume = async (rawText: string) => {
  const response = await api.post('/resume/autofill', { rawText });
  return response.data;
};

export const matchJob = async (resumeText: string, jobDescription: string) => {
  const response = await api.post('/job/match', {
    resumeText,
    jobDescription
  });
  return response.data;
};

export const generateQuestions = async (resumeText: string, jobDescription: string) => {
  const response = await api.post('/interview/generate', {
    resumeText,
    jobDescription
  });
  return response.data;
};

export const evaluateAnswer = async (question: string, answer: string, jobDescription: string) => {
  const response = await api.post('/interview/evaluate', {
    question,
    answer,
    jobDescription
  });
  return response.data;
};

export const generateCoverLetter = async (resumeText: string, jobDescription: string) => {
  const response = await api.post('/resume/cover-letter', {
    resumeText,
    jobDescription
  });
  return response.data;
};

export const optimizeLinkedIn = async (resumeText: string) => {
  const response = await api.post('/resume/linkedin-optimize', { resumeText });
  return response.data;
};

export const getApplications = async () => {
  const response = await api.get('/applications');
  return response.data;
};

export const createApplication = async (appData: any) => {
  const response = await api.post('/applications', appData);
  return response.data;
};

export const updateApplicationStatus = async (id: string, status: string) => {
  const response = await api.patch(`/applications/${id}`, { status });
  return response.data;
};

export const deleteApplication = async (id: string) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};

export default api;
