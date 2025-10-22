export enum View {
  GENERATOR = 'GENERATOR',
  EDITOR = 'EDITOR',
  SUPPORT = 'SUPPORT',
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
}

// Fix: Add CustomerContact interface to resolve import error in CustomerInfo.tsx.
export interface CustomerContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  query: string;
}
