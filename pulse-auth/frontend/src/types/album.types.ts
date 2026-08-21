export interface Album {
  _id: string;
  title: string;
  artistId: any; // Could be an object if populated, or string
  coverUrl?: string;
  releaseYear?: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateAlbumInput = {
  title: string;
  artistId: string;
  coverUrl?: string;
  releaseYear?: number;
}

export type UpdateAlbumInput = Partial<CreateAlbumInput> & { _id: string }

export interface AlbumStats {
  totalAlbums: number;
}

export interface AlbumQueryParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAlbums {
  data: Album[];
  total: number;
  page: number;
  totalPages: number;
}
