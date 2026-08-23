import type { User } from './auth.types';

export interface ArtistRequest {
  _id: string;
  userId: User | string; // Could be populated user or just ID
  stageName: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  adminMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateArtistRequestInput = {
  stageName: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}
