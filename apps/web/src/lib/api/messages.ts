import http from '../http';

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface Thread {
  id: string; // This is the bookingId
  bookingRef: string;
  status: string;
  user?: { firstName: string; lastName: string; email: string; phone: string };
  tenant?: { name: string; type: string };
  messages: Message[];
}

export const getThreads = async (): Promise<Thread[]> => {
  const { data } = await http.get('/messaging/threads');
  return data;
};

export const getMessages = async (bookingId: string): Promise<Message[]> => {
  const { data } = await http.get(`/messaging/${bookingId}`);
  return data;
};

export const sendMessage = async (bookingId: string, content: string): Promise<Message> => {
  const { data } = await http.post(`/messaging/${bookingId}`, { content });
  return data;
};
