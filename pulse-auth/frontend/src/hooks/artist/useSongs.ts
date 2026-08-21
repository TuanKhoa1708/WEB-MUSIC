// Re-export song hooks for use in artist pages.
// Artists use the same song APIs as admins — backend doesn't restrict by role.
export {
  useSongs,
  useSongStats,
  useArtistOptions,
  useAlbumOptions,
  useCreateSong,
  useUpdateSong,
  useDeleteSong,
  SONG_KEYS,
} from '@/hooks/admin/useSongs'
