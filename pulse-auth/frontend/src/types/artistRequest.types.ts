import type { User } from './user.types';

export interface ArtistRequest {
  _id: string;
  userId: User | string; // Could be populated user or just ID
  type: 'become_artist' | 'revoke_artist';
  stageName: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'revoke_pending' | 'revoke_approved';
  adminMessage?: string;
  revokeReason?: string;
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
