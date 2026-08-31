// ─── Artist Domain Types ──────────────────────────────────────────────────────

export interface Artist {
  _id: string;
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

export interface ArtistRevenue {
  artistId: string;
  stageName: string;
  totalSongs: number;
  totalPlays: number;
  ratePerPlay: number;
  estimatedRevenue: number;
  currency: string;
}

export interface ArtistDashboardStats {
  artist: {
    id: string;
    stageName: string;
    avatarUrl: string;
    coverImage: string;
  };
  statistics: {
    totalSongs: number;
    totalAlbums: number;
    totalFollowers: number;
    totalPlays: number;
  };
}
