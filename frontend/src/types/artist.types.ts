// ─── Artist Domain Types ──────────────────────────────────────────────────────

export interface Artist {
  _id: string;
  userId: string;
  stageName: string;
  bio?: string;
  avatarUrl?: string;
  coverImage?: string;
  followers: number;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type CreateArtistInput = {
  userId: string;
  stageName: string;
  bio?: string;
  avatarUrl?: string;
  coverImage?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export type UpdateArtistInput = Partial<CreateArtistInput> & { _id: string }

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface ArtistStats {
  totalArtists: number;
}

// ─── Filter / Query ───────────────────────────────────────────────────────────

export interface ArtistQueryParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedArtists {
  data: Artist[];
  total: number;
  page: number;
  totalPages: number;
}
