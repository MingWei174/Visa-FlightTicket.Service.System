/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: number;
  title: string;
  category: '簽證文件' | '行前準備';
  daysBefore: number; // Days before departure to complete
  desc: string;
  completed: boolean;
  importance: '最高' | '高' | '中' | '低';
  recommendOshc?: boolean;
}

export interface FlightPoint {
  date: string;
  price: number;
  status: 'high' | 'down' | 'best' | 'up' | 'critical';
}

export interface FlightRecommendation {
  airline: string;
  flightNo: string;
  departureTime: string;
  arrivalTime: string;
  stops: number;
  baggage: string;
  price: number;
  matchScore: number;
  recommended: boolean;
  transitText?: string;
}

export interface OSHCProvider {
  name: string;
  pricePerYear: number;
  rating: number;
  badge: string;
  desc: string;
  benefits: string[];
}

export interface LoanOption {
  id: string;
  bankName: string;
  programName: string;
  maxAmount: string;
  interestRate: string;
  repaymentPeriod: string;
  gracePeriod: string;
  eligibility: string;
  features: string[];
  url: string;
}

export interface StudentProgress {
  id: string;
  studentName: string;
  studentId: string;
  studentNumber?: string;
  studentGmail: string;
  country?: string;
  university: string;
  intendedDeparture: string;
  progressPercentage: number;
  riskStatus: '正常' | '預警' | '緊急';
  tasksProgress: { taskId: number; completed: boolean }[];
  advisorNotes: string;
  lastActive: string;
  lineUserId?: string;
  phone?: string;
}
