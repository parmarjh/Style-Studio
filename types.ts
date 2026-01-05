
export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

export interface Garment {
  id: string;
  name: string;
  description: string;
  category: 'Top' | 'Bottom' | 'Dress' | 'Outerwear' | 'Shoes' | 'Accessories' | 'Bags';
  fit: 'Slim' | 'Regular' | 'Relaxed' | 'Oversized';
  imageUrl: string;
  tags: string[];
}

export interface TryOnResult {
  originalImage: string;
  resultImage: string;
  timestamp: number;
  garmentName: string;
  recommendation?: string;
}
