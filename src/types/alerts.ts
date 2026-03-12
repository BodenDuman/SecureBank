export type RequestType = 'General Inquiry' | 'Technical Issue' | 'Transaction Problem' | 'Security/Scam';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RequestStatus = 'Unread' | 'In Analysis' | 'Action Required' | 'Resolved';
export type AccountType = 'Personal' | 'Business';

export interface AiAction {
  id: string;
  label: string;
  checked: boolean;
}

export interface AiReasoning {
  quote: string;
  keyword: string;
  explanation: string;
}

export interface CustomerData {
  name: string;
  phone: string;
  accountType: AccountType;
}

export interface AiResponse {
  summary: string;
  suggestedActions: AiAction[];
  reasoningQuotes: AiReasoning[];
}

export interface SentimentAnalysis {
  /** Эмоциональный профиль (0–100) */
  aggression: number;
  joy: number;
  stress: number;
  disappointment: number;
  gratitude: number;
  sarcasm: number;
  /** Индекс срочности (0–100) */
  urgencyIndex: number;
  /** Риск манипуляции / социальной инженерии (0–100) */
  manipulationRisk: number;
  /** Вероятность оттока клиента (0–100) */
  churnProbability: number;
  /** Доля фактов в сообщении (0–100) */
  factsRatio: number;
  /** Доля эмоций в сообщении (0–100) */
  emotionsRatio: number;
  /** Ключевые эмоциональные слова */
  keywords: Array<{ word: string; type: 'danger' | 'warning' | 'safe' }>;
  /** Краткое резюме инцидента на русском */
  aiSummaryRu: string;
}

export interface BankRequest {
  id: string;
  type: RequestType;
  priority: RequestPriority;
  status: RequestStatus;
  customerData: CustomerData;
  description: string;
  createdAt: Date;
  aiResponse: AiResponse;
  sentiment?: SentimentAnalysis;
}

// Priority weight for sorting (higher = more urgent)
export const PRIORITY_WEIGHT: Record<RequestPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};
