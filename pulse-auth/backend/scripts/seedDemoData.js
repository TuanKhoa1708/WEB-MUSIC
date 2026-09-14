/**
 * seedDemoData.js
 *
 * Comprehensive demo data seed for the Pulse Music platform.
 *
 * Creates:
 *   - 25 demo artist accounts (User + Artist documents)
 *   - 40 demo albums
 *   - 200 demo songs (referencing Cloudinary-hosted royalty-free audio)
 *   - 15 demo playlists with songs
 *
 * IDEMPOTENT: Uses deterministic email/username identifiers prefixed with
 * "demo_" to detect existing records. Running multiple times is SAFE.
 *
 * Usage:
 *   node scripts/seedDemoData.js
 *   (or via: npm run seed)
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// ─── Import Models ────────────────────────────────────────────────────────────
import User from "../src/models/User.js";
import Artist from "../src/models/Artist.js";
import Album from "../src/models/Album.js";
import Song from "../src/models/Song.js";
import Playlist from "../src/models/Playlist.js";
import PlaylistSong from "../src/models/PlaylistSong.js";

// ─── Demo Audio URLs ──────────────────────────────────────────────────────────
// Royalty-free MP3s hosted on Cloudinary (the project's own cloud account).
// These are short, free-to-use audio samples from the Free Music Archive /
// public domain. They cycle across all demo songs so the player is functional.
//
// NOTE: These 8 URLs point to publicly accessible, royalty-free audio files
// served from Cloudinary. Replace with your own uploads if desired.
const DEMO_AUDIO_URLS = [
  "https://res.cloudinary.com/f0qjkped/video/upload/v1/pulse/audio/demo-01.mp3",
  "https://res.cloudinary.com/f0qjkped/video/upload/v1/pulse/audio/demo-02.mp3",
  "https://res.cloudinary.com/f0qjkped/video/upload/v1/pulse/audio/demo-03.mp3",
  "https://res.cloudinary.com/f0qjkped/video/upload/v1/pulse/audio/demo-04.mp3",
  "https://res.cloudinary.com/f0qjkped/video/upload/v1/pulse/audio/demo-05.mp3",
  "https://res.cloudinary.com/f0qjkped/video/upload/v1/pulse/audio/demo-06.mp3",
  "https://res.cloudinary.com/f0qjkped/video/upload/v1/pulse/audio/demo-07.mp3",
  "https://res.cloudinary.com/f0qjkped/video/upload/v1/pulse/audio/demo-08.mp3",
];

// Fallback: Free Music Archive public CDN samples (no account required, always accessible)
const FMA_AUDIO_URLS = [
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Broke_For_Free/Directionless_EP/Broke_For_Free_-_01_-_Night_Owl.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/WFMU/Kris_Keyser/From_The_Basement/Kris_Keyser_-_01_-_Running_From_Myself.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/KEXP/Starfucker/Starfucker/Starfucker_-_01_-_Julius.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Josh_Woodward/Swansongs/Josh_Woodward_-_01_-_I_Can_Feel_It.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps_and_Leads/Chad_Crouch_-_Algorithms.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Satin/Kai_Engel_-_01_-_Satin.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Jahzzar/Travellers_Guide/Jahzzar_-_01_-_Aeon.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Podington_Bear/Ambient/Podington_Bear_-_Warmth.mp3",
  "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Piano_Works/Kevin_MacLeod_-_01_-_Gymnopedie_No_1.mp3",
];

// Use FMA URLs as primary (always accessible, no Cloudinary account needed for demo)
const AUDIO_POOL = FMA_AUDIO_URLS;

// ─── Cover Image URLs ─────────────────────────────────────────────────────────
// Safe placeholder images using picsum.photos (public domain photographs)
// Each seed ID gives a deterministic, stable image.
const coverImageBase = (seed) => `https://picsum.photos/seed/${seed}/400/400`;
const coverWideBase = (seed) => `https://picsum.photos/seed/${seed}w/800/400`;

// ─── Helper ───────────────────────────────────────────────────────────────────
const pick = (arr, idx) => arr[idx % arr.length];

// ─── Artist Data ──────────────────────────────────────────────────────────────
const DEMO_ARTISTS = [
  {
    slug: "demo_artist_001",
    fullName: "Aria Voss",
    username: "demo_aria_voss",
    email: "demo_artist_001@pulse-demo.com",
    stageName: "Aria Voss",
    bio: "Singer-songwriter blending ethereal vocals with ambient electronic textures. Known for cinematic soundscapes that blur the line between pop and art music.",
    genre: "Indie Pop",
    followers: 142500,
    avatarSeed: "aria_voss",
  },
  {
    slug: "demo_artist_002",
    fullName: "Marcus Cole",
    username: "demo_marcus_cole",
    email: "demo_artist_002@pulse-demo.com",
    stageName: "Nova Lane",
    bio: "Multi-instrumentalist and producer from Chicago. His sound fuses jazz harmonics with contemporary R&B grooves and lo-fi aesthetics.",
    genre: "R&B / Jazz",
    followers: 98300,
    avatarSeed: "nova_lane",
  },
  {
    slug: "demo_artist_003",
    fullName: "Elena Marsh",
    username: "demo_elena_marsh",
    email: "demo_artist_003@pulse-demo.com",
    stageName: "Echo Miles",
    bio: "Producer and vocalist crafting hypnotic alternative pop with lush synthesizers and introspective lyrics about distance and longing.",
    genre: "Alternative Pop",
    followers: 215000,
    avatarSeed: "echo_miles",
  },
  {
    slug: "demo_artist_004",
    fullName: "James Harlow",
    username: "demo_james_harlow",
    email: "demo_artist_004@pulse-demo.com",
    stageName: "Luna Vale",
    bio: "Acoustic guitar maestro and poet. Luna Vale's intimate folk-pop songs have been streamed over 50 million times worldwide.",
    genre: "Folk / Acoustic",
    followers: 67000,
    avatarSeed: "luna_vale",
  },
  {
    slug: "demo_artist_005",
    fullName: "Tyler Rhodes",
    username: "demo_tyler_rhodes",
    email: "demo_artist_005@pulse-demo.com",
    stageName: "The Midnight Club",
    bio: "Synth-wave collective from Los Angeles. Their cinematic retro sound channels 80s nostalgia with modern production polish.",
    genre: "Synth-Wave",
    followers: 330000,
    avatarSeed: "midnight_club",
  },
  {
    slug: "demo_artist_006",
    fullName: "Sophie Kim",
    username: "demo_sophie_kim",
    email: "demo_artist_006@pulse-demo.com",
    stageName: "Neon Harbor",
    bio: "Electronic music producer blending city nightlife vibes with deep house grooves. Every track is a journey through neon-lit streets.",
    genre: "Electronic / House",
    followers: 188000,
    avatarSeed: "neon_harbor",
  },
  {
    slug: "demo_artist_007",
    fullName: "Avery Stone",
    username: "demo_avery_stone",
    email: "demo_artist_007@pulse-demo.com",
    stageName: "Avery Stone",
    bio: "Indie rock frontwoman with a raw, unfiltered voice. Avery's songs capture the grit of urban life with poetic precision.",
    genre: "Indie Rock",
    followers: 127000,
    avatarSeed: "avery_stone",
  },
  {
    slug: "demo_artist_008",
    fullName: "Kai Rivers",
    username: "demo_kai_rivers",
    email: "demo_artist_008@pulse-demo.com",
    stageName: "Kai Rivers",
    bio: "Bedroom pop producer who went viral at 19. Kai blends dreamy lo-fi textures with confessional songwriting.",
    genre: "Lo-Fi / Bedroom Pop",
    followers: 456000,
    avatarSeed: "kai_rivers",
  },
  {
    slug: "demo_artist_009",
    fullName: "Milo Grey",
    username: "demo_milo_grey",
    email: "demo_artist_009@pulse-demo.com",
    stageName: "Milo Grey",
    bio: "Jazz pianist and composer whose work sits at the intersection of contemporary jazz and neo-soul. Debut album won a regional music award.",
    genre: "Jazz / Neo-Soul",
    followers: 45000,
    avatarSeed: "milo_grey",
  },
  {
    slug: "demo_artist_010",
    fullName: "Vera North",
    username: "demo_vera_north",
    email: "demo_artist_010@pulse-demo.com",
    stageName: "Velvet North",
    bio: "Alt-pop duo with theatrical flair. Velvet North's orchestral pop arrangements and bold visuals have earned them a devoted cult following.",
    genre: "Orchestral Pop",
    followers: 211000,
    avatarSeed: "velvet_north",
  },
  {
    slug: "demo_artist_011",
    fullName: "Derek Santos",
    username: "demo_derek_santos",
    email: "demo_artist_011@pulse-demo.com",
    stageName: "Solaris",
    bio: "Ambient electronic artist creating meditative soundscapes for focus, sleep, and exploration. His music has been featured in numerous podcasts.",
    genre: "Ambient / Electronic",
    followers: 89000,
    avatarSeed: "solaris",
  },
  {
    slug: "demo_artist_012",
    fullName: "Cleo Zhang",
    username: "demo_cleo_zhang",
    email: "demo_artist_012@pulse-demo.com",
    stageName: "Cleo Zhang",
    bio: "R&B vocalist with Chinese-American roots, weaving personal heritage into contemporary soul music. Her voice has been compared to a modern-day Nina Simone.",
    genre: "R&B / Soul",
    followers: 175000,
    avatarSeed: "cleo_zhang",
  },
  {
    slug: "demo_artist_013",
    fullName: "Owen Blake",
    username: "demo_owen_blake",
    email: "demo_artist_013@pulse-demo.com",
    stageName: "Owen Blake",
    bio: "Hip-hop lyricist and beatmaker from Atlanta. Known for intricate wordplay and socially conscious themes layered over boom-bap production.",
    genre: "Hip-Hop",
    followers: 392000,
    avatarSeed: "owen_blake",
  },
  {
    slug: "demo_artist_014",
    fullName: "Isla Frost",
    username: "demo_isla_frost",
    email: "demo_artist_014@pulse-demo.com",
    stageName: "Isla Frost",
    bio: "Dark-pop songstress with gothic undertones. Isla's cinematic approach to pop music creates immersive worlds listeners get lost in.",
    genre: "Dark Pop",
    followers: 263000,
    avatarSeed: "isla_frost",
  },
  {
    slug: "demo_artist_015",
    fullName: "Finn Calloway",
    username: "demo_finn_calloway",
    email: "demo_artist_015@pulse-demo.com",
    stageName: "Finn Calloway",
    bio: "Folk rock storyteller who tours with just an acoustic guitar and a harmonica. His live shows are legendary for their raw emotional power.",
    genre: "Folk Rock",
    followers: 78000,
    avatarSeed: "finn_calloway",
  },
  {
    slug: "demo_artist_016",
    fullName: "Zara Blue",
    username: "demo_zara_blue",
    email: "demo_artist_016@pulse-demo.com",
    stageName: "Zara Blue",
    bio: "Pop star-in-the-making with roots in gospel music. Zara's powerful voice and infectious hooks make every song an event.",
    genre: "Pop / Gospel",
    followers: 512000,
    avatarSeed: "zara_blue",
  },
  {
    slug: "demo_artist_017",
    fullName: "Remi Noir",
    username: "demo_remi_noir",
    email: "demo_artist_017@pulse-demo.com",
    stageName: "Remi Noir",
    bio: "French-inspired electronic producer crafting cinematic compositions for film, games, and midnight listening sessions.",
    genre: "Cinematic Electronic",
    followers: 134000,
    avatarSeed: "remi_noir",
  },
  {
    slug: "demo_artist_018",
    fullName: "Tara Sun",
    username: "demo_tara_sun",
    email: "demo_artist_018@pulse-demo.com",
    stageName: "Tara Sun",
    bio: "Acoustic soul artist drawing on diverse influences from bossa nova to indie folk. Each album feels like a season changing.",
    genre: "Acoustic / Soul",
    followers: 56000,
    avatarSeed: "tara_sun",
  },
  {
    slug: "demo_artist_019",
    fullName: "Logan Pierce",
    username: "demo_logan_pierce",
    email: "demo_artist_019@pulse-demo.com",
    stageName: "Pulse Theory",
    bio: "Experimental electronic duo pushing the boundaries of what a song can be. Their live performances incorporate visuals, code, and controlled chaos.",
    genre: "Experimental Electronic",
    followers: 97000,
    avatarSeed: "pulse_theory",
  },
  {
    slug: "demo_artist_020",
    fullName: "Nina Holt",
    username: "demo_nina_holt",
    email: "demo_artist_020@pulse-demo.com",
    stageName: "Nina Holt",
    bio: "Classically trained violinist turned indie pop composer. Nina's strings-meets-electronics sound is instantly recognizable.",
    genre: "Indie / Classical",
    followers: 88000,
    avatarSeed: "nina_holt",
  },
  {
    slug: "demo_artist_021",
    fullName: "Caleb Stone",
    username: "demo_caleb_stone",
    email: "demo_artist_021@pulse-demo.com",
    stageName: "Desert Echo",
    bio: "Psychedelic rock project born out of the Arizona desert. Long, hypnotic tracks that take listeners on a journey across vast sonic landscapes.",
    genre: "Psychedelic Rock",
    followers: 143000,
    avatarSeed: "desert_echo",
  },
  {
    slug: "demo_artist_022",
    fullName: "Maya Cross",
    username: "demo_maya_cross",
    email: "demo_artist_022@pulse-demo.com",
    stageName: "Maya Cross",
    bio: "Contemporary R&B artist with a minimalist approach. Sparse production, rich harmonies, and deeply personal lyrics.",
    genre: "Contemporary R&B",
    followers: 229000,
    avatarSeed: "maya_cross",
  },
  {
    slug: "demo_artist_023",
    fullName: "Eli Storm",
    username: "demo_eli_storm",
    email: "demo_artist_023@pulse-demo.com",
    stageName: "Storm Circuit",
    bio: "Drum-and-bass and jungle producer from London. High-energy tracks built for warehouse dancefloors and late-night headphone sessions alike.",
    genre: "Drum & Bass",
    followers: 167000,
    avatarSeed: "storm_circuit",
  },
  {
    slug: "demo_artist_024",
    fullName: "Lily Chen",
    username: "demo_lily_chen",
    email: "demo_artist_024@pulse-demo.com",
    stageName: "Lily Chen",
    bio: "Indie folk singer with a gift for melody. Her songs about travel, heartbreak, and wonder have resonated with millions around the globe.",
    genre: "Indie Folk",
    followers: 304000,
    avatarSeed: "lily_chen",
  },
  {
    slug: "demo_artist_025",
    fullName: "Sam Vega",
    username: "demo_sam_vega",
    email: "demo_artist_025@pulse-demo.com",
    stageName: "Sam Vega",
    bio: "Salsa-infused pop artist celebrating Latin roots with global appeal. Every track is a dance floor invitation.",
    genre: "Latin Pop",
    followers: 415000,
    avatarSeed: "sam_vega",
  },
];

// ─── Album Data ───────────────────────────────────────────────────────────────
// artistSlug references DEMO_ARTISTS[n].slug
const DEMO_ALBUMS = [
  { title: "Midnight Signals", artistSlug: "demo_artist_001", releaseYear: 2024, coverSeed: "album_ms" },
  { title: "Neon Dreams", artistSlug: "demo_artist_001", releaseYear: 2023, coverSeed: "album_nd" },
  { title: "Afterglow", artistSlug: "demo_artist_002", releaseYear: 2025, coverSeed: "album_ag" },
  { title: "City Lights", artistSlug: "demo_artist_002", releaseYear: 2024, coverSeed: "album_cl" },
  { title: "Parallel Hearts", artistSlug: "demo_artist_003", releaseYear: 2025, coverSeed: "album_ph" },
  { title: "Late Night Radio", artistSlug: "demo_artist_003", releaseYear: 2023, coverSeed: "album_lnr" },
  { title: "Ocean Static", artistSlug: "demo_artist_004", releaseYear: 2024, coverSeed: "album_os" },
  { title: "Falling Forward", artistSlug: "demo_artist_004", releaseYear: 2022, coverSeed: "album_ff" },
  { title: "Electric Memory", artistSlug: "demo_artist_005", releaseYear: 2025, coverSeed: "album_em" },
  { title: "Blue Hour", artistSlug: "demo_artist_005", releaseYear: 2024, coverSeed: "album_bh" },
  { title: "Harbour Lights", artistSlug: "demo_artist_006", releaseYear: 2025, coverSeed: "album_hl" },
  { title: "After Dark", artistSlug: "demo_artist_006", releaseYear: 2024, coverSeed: "album_ad" },
  { title: "Concrete Sky", artistSlug: "demo_artist_007", releaseYear: 2024, coverSeed: "album_cs" },
  { title: "Soft Static", artistSlug: "demo_artist_008", releaseYear: 2025, coverSeed: "album_ss" },
  { title: "Pillow Talk", artistSlug: "demo_artist_008", releaseYear: 2023, coverSeed: "album_pt" },
  { title: "Midnight Sessions", artistSlug: "demo_artist_009", releaseYear: 2024, coverSeed: "album_mse" },
  { title: "Velvet Dreams", artistSlug: "demo_artist_010", releaseYear: 2025, coverSeed: "album_vd" },
  { title: "Glass Horizon", artistSlug: "demo_artist_010", releaseYear: 2023, coverSeed: "album_gh" },
  { title: "Solar Drift", artistSlug: "demo_artist_011", releaseYear: 2024, coverSeed: "album_sd" },
  { title: "Pulse & Glow", artistSlug: "demo_artist_012", releaseYear: 2025, coverSeed: "album_pg" },
  { title: "Golden Thread", artistSlug: "demo_artist_012", releaseYear: 2024, coverSeed: "album_gt" },
  { title: "Street Level", artistSlug: "demo_artist_013", releaseYear: 2025, coverSeed: "album_sl" },
  { title: "Cipher", artistSlug: "demo_artist_013", releaseYear: 2024, coverSeed: "album_ci" },
  { title: "Shadow Garden", artistSlug: "demo_artist_014", releaseYear: 2025, coverSeed: "album_sg" },
  { title: "Road Songs", artistSlug: "demo_artist_015", releaseYear: 2024, coverSeed: "album_rs" },
  { title: "Revival", artistSlug: "demo_artist_016", releaseYear: 2025, coverSeed: "album_rv" },
  { title: "Éclipse", artistSlug: "demo_artist_017", releaseYear: 2024, coverSeed: "album_ec" },
  { title: "Morning Bloom", artistSlug: "demo_artist_018", releaseYear: 2025, coverSeed: "album_mb" },
  { title: "Signal Noise", artistSlug: "demo_artist_019", releaseYear: 2024, coverSeed: "album_sn" },
  { title: "String Theory", artistSlug: "demo_artist_020", releaseYear: 2025, coverSeed: "album_st" },
  { title: "Red Canyon", artistSlug: "demo_artist_021", releaseYear: 2024, coverSeed: "album_rc" },
  { title: "Warmth", artistSlug: "demo_artist_022", releaseYear: 2025, coverSeed: "album_wa" },
  { title: "Bass Station", artistSlug: "demo_artist_023", releaseYear: 2024, coverSeed: "album_bs" },
  { title: "Wander", artistSlug: "demo_artist_024", releaseYear: 2025, coverSeed: "album_wr" },
  { title: "Baile", artistSlug: "demo_artist_025", releaseYear: 2025, coverSeed: "album_ba" },
  { title: "Starfield", artistSlug: "demo_artist_011", releaseYear: 2023, coverSeed: "album_sf" },
  { title: "Ultraviolet", artistSlug: "demo_artist_006", releaseYear: 2023, coverSeed: "album_uv" },
  { title: "Deep Cuts", artistSlug: "demo_artist_013", releaseYear: 2023, coverSeed: "album_dc" },
  { title: "Homecoming", artistSlug: "demo_artist_015", releaseYear: 2023, coverSeed: "album_hc" },
  { title: "Gravity", artistSlug: "demo_artist_003", releaseYear: 2022, coverSeed: "album_gv" },
];

// ─── Song Data ────────────────────────────────────────────────────────────────
// Songs are grouped by album. Some songs have albumId: null (singles).
// Duration is in seconds.
const DEMO_SONGS = [
  // ── Aria Voss – Midnight Signals ──────────────────────────────────────────
  { title: "Neon After Rain", albumTitle: "Midnight Signals", artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 222, description: "A shimmering opener about city lights after a storm." },
  { title: "Signal Lost", albumTitle: "Midnight Signals", artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 198, description: "Driving synths and airy vocals chasing a fading connection." },
  { title: "Pulse (Acoustic)", albumTitle: "Midnight Signals", artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 185, description: "Stripped-back version of a fan favourite." },
  { title: "Ghost Light", albumTitle: "Midnight Signals", artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 241, description: "A hauntingly beautiful meditation on memory." },
  { title: "Frequency", albumTitle: "Midnight Signals", artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 213, description: "Radio-ready indie pop with a pulsing electronic backbone." },
  // ── Aria Voss – Neon Dreams ───────────────────────────────────────────────
  { title: "Neon Dreams", albumTitle: "Neon Dreams", artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 237, description: "Title track brimming with synth euphoria." },
  { title: "Still Waters", albumTitle: "Neon Dreams", artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 204, description: "Melancholy ballad with lush orchestration." },
  { title: "After Midnight", albumTitle: "Neon Dreams", artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 218, description: "Late-night reflections over a driving beat." },
  // ── Nova Lane – Afterglow ─────────────────────────────────────────────────
  { title: "Afterglow", albumTitle: "Afterglow", artistSlug: "demo_artist_002", genre: "R&B / Jazz", duration: 254, description: "Sunset-drenched R&B with jazz chord voicings." },
  { title: "Smoke & Mirrors", albumTitle: "Afterglow", artistSlug: "demo_artist_002", genre: "R&B / Jazz", duration: 229, description: "Introspective track about illusion and truth." },
  { title: "Warm Honey", albumTitle: "Afterglow", artistSlug: "demo_artist_002", genre: "R&B", duration: 218, description: "Smooth R&B groove perfect for a golden hour." },
  { title: "Into the Crowd", albumTitle: "Afterglow", artistSlug: "demo_artist_002", genre: "R&B / Jazz", duration: 196, description: "Bustling city energy captured in musical form." },
  { title: "Sable Nights", albumTitle: "Afterglow", artistSlug: "demo_artist_002", genre: "Jazz", duration: 271, description: "Extended jazz instrumental with a melancholy sax solo." },
  // ── Nova Lane – City Lights ───────────────────────────────────────────────
  { title: "City Lights", albumTitle: "City Lights", artistSlug: "demo_artist_002", genre: "R&B", duration: 209, description: "Ode to urban loneliness and beauty." },
  { title: "Rain on Glass", albumTitle: "City Lights", artistSlug: "demo_artist_002", genre: "R&B / Jazz", duration: 233, description: "Reflective piece inspired by rainy windows and neon signs." },
  { title: "Five AM", albumTitle: "City Lights", artistSlug: "demo_artist_002", genre: "R&B", duration: 187, description: "The quiet magic of an empty city at dawn." },
  // ── Echo Miles – Parallel Hearts ─────────────────────────────────────────
  { title: "Parallel Hearts", albumTitle: "Parallel Hearts", artistSlug: "demo_artist_003", genre: "Alternative Pop", duration: 248, description: "Lush, layered alt-pop exploring parallel universe relationships." },
  { title: "Distance", albumTitle: "Parallel Hearts", artistSlug: "demo_artist_003", genre: "Alternative Pop", duration: 215, description: "A song about longing across time zones." },
  { title: "Echoes", albumTitle: "Parallel Hearts", artistSlug: "demo_artist_003", genre: "Alternative Pop", duration: 234, description: "Layered vocal harmonies reverberating through space." },
  { title: "Invisible Thread", albumTitle: "Parallel Hearts", artistSlug: "demo_artist_003", genre: "Alternative Pop", duration: 201, description: "Connection that cannot be seen but always felt." },
  { title: "Tomorrow's Light", albumTitle: "Parallel Hearts", artistSlug: "demo_artist_003", genre: "Alternative Pop", duration: 262, description: "Hopeful closer with a cinematic swell." },
  // ── Echo Miles – Late Night Radio ────────────────────────────────────────
  { title: "Static Frequency", albumTitle: "Late Night Radio", artistSlug: "demo_artist_003", genre: "Alternative Pop", duration: 222, description: "Channel-surfing metaphors for emotional avoidance." },
  { title: "Last Song", albumTitle: "Late Night Radio", artistSlug: "demo_artist_003", genre: "Alternative Pop", duration: 238, description: "Emotional ballad to close the late night session." },
  { title: "Drive Through Fog", albumTitle: "Late Night Radio", artistSlug: "demo_artist_003", genre: "Alternative", duration: 207, description: "Atmospheric indie track with dark undertones." },
  // ── Luna Vale – Ocean Static ──────────────────────────────────────────────
  { title: "Shoreline", albumTitle: "Ocean Static", artistSlug: "demo_artist_004", genre: "Folk / Acoustic", duration: 195, description: "Gentle acoustic ode to the ocean's edge." },
  { title: "Driftwood", albumTitle: "Ocean Static", artistSlug: "demo_artist_004", genre: "Folk / Acoustic", duration: 212, description: "Finding beauty in what the tide brings in." },
  { title: "Salt & Pine", albumTitle: "Ocean Static", artistSlug: "demo_artist_004", genre: "Folk", duration: 229, description: "Pacific Northwest imagery set to fingerpicked guitar." },
  { title: "Tidal", albumTitle: "Ocean Static", artistSlug: "demo_artist_004", genre: "Folk / Acoustic", duration: 246, description: "Long, meditative folk track following the ebb and flow." },
  // ── Luna Vale – Falling Forward ───────────────────────────────────────────
  { title: "Free Fall", albumTitle: "Falling Forward", artistSlug: "demo_artist_004", genre: "Folk / Acoustic", duration: 203, description: "Letting go and trusting the journey." },
  { title: "Wings", albumTitle: "Falling Forward", artistSlug: "demo_artist_004", genre: "Folk", duration: 189, description: "A short, perfect song about freedom." },
  { title: "Golden Hour", albumTitle: "Falling Forward", artistSlug: "demo_artist_004", genre: "Acoustic", duration: 218, description: "Bathed in warm light and gratitude." },
  // ── The Midnight Club – Electric Memory ───────────────────────────────────
  { title: "Electric Memory", albumTitle: "Electric Memory", artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 261, description: "Retro synth epic that sounds like a John Hughes movie." },
  { title: "Neon Boulevard", albumTitle: "Electric Memory", artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 248, description: "Cruising down a lit-up boulevard at 2am." },
  { title: "Analog Love", albumTitle: "Electric Memory", artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 235, description: "A love letter written on a cassette tape." },
  { title: "Drive", albumTitle: "Electric Memory", artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 219, description: "Synth-wave road trip anthem." },
  { title: "Rewind", albumTitle: "Electric Memory", artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 243, description: "Nostalgia as a superpower." },
  // ── The Midnight Club – Blue Hour ─────────────────────────────────────────
  { title: "Blue Hour", albumTitle: "Blue Hour", artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 254, description: "The bittersweet moment between day and night." },
  { title: "Violet Sky", albumTitle: "Blue Hour", artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 228, description: "Twilight painted in synthesizer." },
  { title: "Echoes of You", albumTitle: "Blue Hour", artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 211, description: "A tender synth ballad about remembering." },
  // ── Neon Harbor – Harbour Lights ──────────────────────────────────────────
  { title: "Harbour Lights", albumTitle: "Harbour Lights", artistSlug: "demo_artist_006", genre: "Electronic / House", duration: 238, description: "Deep house odyssey inspired by port city nights." },
  { title: "Midnight Tide", albumTitle: "Harbour Lights", artistSlug: "demo_artist_006", genre: "Electronic / House", duration: 264, description: "Waves of bass washing over a four-on-the-floor beat." },
  { title: "Voltage", albumTitle: "Harbour Lights", artistSlug: "demo_artist_006", genre: "Electronic", duration: 219, description: "High-energy electro track crackling with tension." },
  { title: "Open Water", albumTitle: "Harbour Lights", artistSlug: "demo_artist_006", genre: "Electronic / House", duration: 282, description: "Expansive, oceanic house music." },
  // ── Neon Harbor – After Dark ──────────────────────────────────────────────
  { title: "After Dark", albumTitle: "After Dark", artistSlug: "demo_artist_006", genre: "Electronic / House", duration: 274, description: "The city after the sun goes down, pulsing and alive." },
  { title: "Strobe", albumTitle: "After Dark", artistSlug: "demo_artist_006", genre: "Electronic", duration: 248, description: "Hypnotic and relentless like a strobe light." },
  { title: "Ultraviolet", albumTitle: "After Dark", artistSlug: "demo_artist_006", genre: "Electronic / House", duration: 235, description: "Frequencies beyond what eyes can see." },
  // ── Avery Stone – Concrete Sky ────────────────────────────────────────────
  { title: "Concrete Sky", albumTitle: "Concrete Sky", artistSlug: "demo_artist_007", genre: "Indie Rock", duration: 214, description: "Looking up at city rooftops and dreaming bigger." },
  { title: "Broken Glass", albumTitle: "Concrete Sky", artistSlug: "demo_artist_007", genre: "Indie Rock", duration: 199, description: "Raw indie rock about picking up the pieces." },
  { title: "Wasteland", albumTitle: "Concrete Sky", artistSlug: "demo_artist_007", genre: "Indie Rock", duration: 237, description: "Post-everything anthem for the burned out." },
  { title: "Radio Silence", albumTitle: "Concrete Sky", artistSlug: "demo_artist_007", genre: "Indie Rock", duration: 222, description: "When no one is listening, you scream into the void." },
  // ── Kai Rivers – Soft Static ──────────────────────────────────────────────
  { title: "Soft Static", albumTitle: "Soft Static", artistSlug: "demo_artist_008", genre: "Lo-Fi / Bedroom Pop", duration: 181, description: "Cozy lo-fi haze for late study nights." },
  { title: "Half Asleep", albumTitle: "Soft Static", artistSlug: "demo_artist_008", genre: "Lo-Fi / Bedroom Pop", duration: 167, description: "Drifting between waking and dreaming." },
  { title: "Dusty Vinyl", albumTitle: "Soft Static", artistSlug: "demo_artist_008", genre: "Lo-Fi", duration: 174, description: "Crackles and warmth from a well-loved record." },
  { title: "Sunday Morning", albumTitle: "Soft Static", artistSlug: "demo_artist_008", genre: "Lo-Fi / Bedroom Pop", duration: 193, description: "Lazy morning light through dusty curtains." },
  { title: "Haze", albumTitle: "Soft Static", artistSlug: "demo_artist_008", genre: "Lo-Fi", duration: 162, description: "Dreamy lo-fi instrumental." },
  // ── Kai Rivers – Pillow Talk ──────────────────────────────────────────────
  { title: "Pillow Talk", albumTitle: "Pillow Talk", artistSlug: "demo_artist_008", genre: "Bedroom Pop", duration: 188, description: "Whispered confessions set to indie pop." },
  { title: "3am Thoughts", albumTitle: "Pillow Talk", artistSlug: "demo_artist_008", genre: "Lo-Fi / Bedroom Pop", duration: 175, description: "The strange clarity that arrives at 3am." },
  { title: "Cassette Love", albumTitle: "Pillow Talk", artistSlug: "demo_artist_008", genre: "Bedroom Pop", duration: 196, description: "Making a mixtape for someone special." },
  // ── Milo Grey – Midnight Sessions ────────────────────────────────────────
  { title: "Midnight Sessions", albumTitle: "Midnight Sessions", artistSlug: "demo_artist_009", genre: "Jazz / Neo-Soul", duration: 312, description: "Extended live-in-the-studio jazz performance." },
  { title: "Blue Note", albumTitle: "Midnight Sessions", artistSlug: "demo_artist_009", genre: "Jazz", duration: 268, description: "Piano-led jazz tribute to the greats." },
  { title: "Coltrane Dreams", albumTitle: "Midnight Sessions", artistSlug: "demo_artist_009", genre: "Jazz", duration: 354, description: "Inspired by the modal jazz of John Coltrane." },
  { title: "Soul Kitchen", albumTitle: "Midnight Sessions", artistSlug: "demo_artist_009", genre: "Neo-Soul", duration: 241, description: "Neo-soul grooves with jazz sensibilities." },
  // ── Velvet North – Velvet Dreams ──────────────────────────────────────────
  { title: "Velvet Dreams", albumTitle: "Velvet Dreams", artistSlug: "demo_artist_010", genre: "Orchestral Pop", duration: 274, description: "Grand orchestral pop opener full of drama." },
  { title: "Overture", albumTitle: "Velvet Dreams", artistSlug: "demo_artist_010", genre: "Orchestral Pop", duration: 198, description: "Instrumental introduction to the album's world." },
  { title: "Crimson Tide", albumTitle: "Velvet Dreams", artistSlug: "demo_artist_010", genre: "Orchestral Pop", duration: 246, description: "Rising tension and sweeping strings." },
  { title: "The Last Scene", albumTitle: "Velvet Dreams", artistSlug: "demo_artist_010", genre: "Orchestral Pop", duration: 291, description: "A cinematic closer worthy of a standing ovation." },
  // ── Velvet North – Glass Horizon ──────────────────────────────────────────
  { title: "Glass Horizon", albumTitle: "Glass Horizon", artistSlug: "demo_artist_010", genre: "Orchestral Pop", duration: 263, description: "A fragile, beautiful view of what could be." },
  { title: "Paper Wings", albumTitle: "Glass Horizon", artistSlug: "demo_artist_010", genre: "Orchestral Pop", duration: 229, description: "Soaring despite imperfection." },
  // ── Solaris – Solar Drift ─────────────────────────────────────────────────
  { title: "Solar Drift", albumTitle: "Solar Drift", artistSlug: "demo_artist_011", genre: "Ambient / Electronic", duration: 421, description: "A long ambient drift through solar systems." },
  { title: "Nebula", albumTitle: "Solar Drift", artistSlug: "demo_artist_011", genre: "Ambient", duration: 368, description: "Clouds of interstellar gas rendered in sound." },
  { title: "Orbit", albumTitle: "Solar Drift", artistSlug: "demo_artist_011", genre: "Ambient / Electronic", duration: 395, description: "Circular ambient meditation on gravity." },
  { title: "Event Horizon", albumTitle: "Solar Drift", artistSlug: "demo_artist_011", genre: "Ambient", duration: 447, description: "The point of no return, stretched into music." },
  // ── Cleo Zhang – Pulse & Glow ─────────────────────────────────────────────
  { title: "Pulse & Glow", albumTitle: "Pulse & Glow", artistSlug: "demo_artist_012", genre: "R&B / Soul", duration: 227, description: "The heartbeat of a relationship in its golden phase." },
  { title: "Crimson", albumTitle: "Pulse & Glow", artistSlug: "demo_artist_012", genre: "R&B", duration: 214, description: "Passionate R&B ballad drenched in emotion." },
  { title: "Honey Gold", albumTitle: "Pulse & Glow", artistSlug: "demo_artist_012", genre: "Soul", duration: 239, description: "Soulful and warm as afternoon sun." },
  { title: "Silk", albumTitle: "Pulse & Glow", artistSlug: "demo_artist_012", genre: "R&B / Soul", duration: 201, description: "Smooth and sensuous neo-soul groove." },
  // ── Owen Blake – Street Level ─────────────────────────────────────────────
  { title: "Street Level", albumTitle: "Street Level", artistSlug: "demo_artist_013", genre: "Hip-Hop", duration: 218, description: "Down-to-earth hip-hop about everyday reality." },
  { title: "Corner Store Philosophy", albumTitle: "Street Level", artistSlug: "demo_artist_013", genre: "Hip-Hop", duration: 201, description: "Deep thoughts from a simple vantage point." },
  { title: "Skyline View", albumTitle: "Street Level", artistSlug: "demo_artist_013", genre: "Hip-Hop", duration: 234, description: "Looking at the city from above and dreaming." },
  { title: "Grind Season", albumTitle: "Street Level", artistSlug: "demo_artist_013", genre: "Hip-Hop", duration: 197, description: "Motivational hip-hop for the hustle." },
  { title: "Crown Me", albumTitle: "Street Level", artistSlug: "demo_artist_013", genre: "Hip-Hop", duration: 211, description: "Confidence anthem delivered with swagger." },
  // ── Isla Frost – Shadow Garden ────────────────────────────────────────────
  { title: "Shadow Garden", albumTitle: "Shadow Garden", artistSlug: "demo_artist_014", genre: "Dark Pop", duration: 243, description: "Growing in the dark, blooming at midnight." },
  { title: "Thorns", albumTitle: "Shadow Garden", artistSlug: "demo_artist_014", genre: "Dark Pop", duration: 227, description: "Beauty and pain coexisting in every rose." },
  { title: "Moth to Flame", albumTitle: "Shadow Garden", artistSlug: "demo_artist_014", genre: "Dark Pop", duration: 218, description: "Dangerous attraction rendered in dark pop." },
  { title: "Glass Coffin", albumTitle: "Shadow Garden", artistSlug: "demo_artist_014", genre: "Dark Pop", duration: 261, description: "Fairy tale imagery meets gothic pop." },
  // ── Finn Calloway – Road Songs ────────────────────────────────────────────
  { title: "Open Road", albumTitle: "Road Songs", artistSlug: "demo_artist_015", genre: "Folk Rock", duration: 234, description: "The freedom of the highway in song form." },
  { title: "Campfire", albumTitle: "Road Songs", artistSlug: "demo_artist_015", genre: "Folk Rock", duration: 218, description: "Gathering around the fire with old friends." },
  { title: "Blue Ridge", albumTitle: "Road Songs", artistSlug: "demo_artist_015", genre: "Folk", duration: 247, description: "Inspired by the mountains of western Virginia." },
  { title: "Small Town Stories", albumTitle: "Road Songs", artistSlug: "demo_artist_015", genre: "Folk Rock", duration: 203, description: "Characters and color from small-town America." },
  // ── Zara Blue – Revival ───────────────────────────────────────────────────
  { title: "Revival", albumTitle: "Revival", artistSlug: "demo_artist_016", genre: "Pop / Gospel", duration: 231, description: "Uplifting pop anthem with gospel fire." },
  { title: "Rise Up", albumTitle: "Revival", artistSlug: "demo_artist_016", genre: "Pop / Gospel", duration: 214, description: "Call-to-action pop with a heavenly choir." },
  { title: "Overflow", albumTitle: "Revival", artistSlug: "demo_artist_016", genre: "Gospel", duration: 268, description: "Full gospel production with incredible vocal runs." },
  { title: "Hallelujah (Modern)", albumTitle: "Revival", artistSlug: "demo_artist_016", genre: "Pop / Gospel", duration: 247, description: "Contemporary take on a classic spiritual theme." },
  // ── Remi Noir – Éclipse ───────────────────────────────────────────────────
  { title: "Éclipse", albumTitle: "Éclipse", artistSlug: "demo_artist_017", genre: "Cinematic Electronic", duration: 328, description: "The moment the light disappears, in music." },
  { title: "La Nuit", albumTitle: "Éclipse", artistSlug: "demo_artist_017", genre: "Cinematic Electronic", duration: 294, description: "French nighttime ambience with electronic pulse." },
  { title: "Solstice", albumTitle: "Éclipse", artistSlug: "demo_artist_017", genre: "Cinematic Electronic", duration: 341, description: "The longest night rendered as orchestral electronic." },
  // ── Tara Sun – Morning Bloom ──────────────────────────────────────────────
  { title: "Morning Bloom", albumTitle: "Morning Bloom", artistSlug: "demo_artist_018", genre: "Acoustic / Soul", duration: 208, description: "Fresh morning energy in acoustic soul form." },
  { title: "Bossa Nova Dream", albumTitle: "Morning Bloom", artistSlug: "demo_artist_018", genre: "Bossa Nova", duration: 234, description: "Soft Brazilian rhythms for a lazy Sunday." },
  { title: "Petal", albumTitle: "Morning Bloom", artistSlug: "demo_artist_018", genre: "Acoustic / Soul", duration: 191, description: "Delicate and tender as a flower opening." },
  { title: "Summer Spell", albumTitle: "Morning Bloom", artistSlug: "demo_artist_018", genre: "Acoustic", duration: 219, description: "The magic of a perfect summer day." },
  // ── Pulse Theory – Signal Noise ───────────────────────────────────────────
  { title: "Signal Noise", albumTitle: "Signal Noise", artistSlug: "demo_artist_019", genre: "Experimental Electronic", duration: 378, description: "Deconstructed electronic experiment in signal processing." },
  { title: "Glitch", albumTitle: "Signal Noise", artistSlug: "demo_artist_019", genre: "Experimental Electronic", duration: 291, description: "Beauty found in digital artifacts and errors." },
  { title: "Binary Bloom", albumTitle: "Signal Noise", artistSlug: "demo_artist_019", genre: "Experimental Electronic", duration: 334, description: "Organic growth expressed in binary code." },
  // ── Nina Holt – String Theory ─────────────────────────────────────────────
  { title: "String Theory", albumTitle: "String Theory", artistSlug: "demo_artist_020", genre: "Indie / Classical", duration: 287, description: "Violin and electronics in beautiful conversation." },
  { title: "Resonance", albumTitle: "String Theory", artistSlug: "demo_artist_020", genre: "Indie / Classical", duration: 261, description: "Every note resonates into infinity." },
  { title: "Fourth Movement", albumTitle: "String Theory", artistSlug: "demo_artist_020", genre: "Classical / Indie", duration: 318, description: "Inspired by Beethoven, reimagined for today." },
  // ── Desert Echo – Red Canyon ──────────────────────────────────────────────
  { title: "Red Canyon", albumTitle: "Red Canyon", artistSlug: "demo_artist_021", genre: "Psychedelic Rock", duration: 412, description: "Vast, psychedelic rock journey through desert landscapes." },
  { title: "Mirage", albumTitle: "Red Canyon", artistSlug: "demo_artist_021", genre: "Psychedelic Rock", duration: 367, description: "Heat shimmer and hallucination in musical form." },
  { title: "Sand Ritual", albumTitle: "Red Canyon", artistSlug: "demo_artist_021", genre: "Psychedelic Rock", duration: 389, description: "Ancient desert ceremony reimagined as psychedelic rock." },
  // ── Maya Cross – Warmth ───────────────────────────────────────────────────
  { title: "Warmth", albumTitle: "Warmth", artistSlug: "demo_artist_022", genre: "Contemporary R&B", duration: 222, description: "Intimate R&B with minimal production and maximum feeling." },
  { title: "Between the Lines", albumTitle: "Warmth", artistSlug: "demo_artist_022", genre: "Contemporary R&B", duration: 207, description: "What's unsaid matters more than what is." },
  { title: "Tender", albumTitle: "Warmth", artistSlug: "demo_artist_022", genre: "R&B", duration: 218, description: "Gentle, caring R&B for soft moments." },
  { title: "Halo Effect", albumTitle: "Warmth", artistSlug: "demo_artist_022", genre: "Contemporary R&B", duration: 234, description: "Seeing someone through the most beautiful filter." },
  // ── Storm Circuit – Bass Station ──────────────────────────────────────────
  { title: "Bass Station", albumTitle: "Bass Station", artistSlug: "demo_artist_023", genre: "Drum & Bass", duration: 314, description: "Full-throttle drum and bass banger." },
  { title: "Warpzone", albumTitle: "Bass Station", artistSlug: "demo_artist_023", genre: "Drum & Bass", duration: 287, description: "Enter the warp at 174 BPM." },
  { title: "Neural Network", albumTitle: "Bass Station", artistSlug: "demo_artist_023", genre: "Drum & Bass", duration: 302, description: "Machine-like precision meeting organic chaos." },
  // ── Lily Chen – Wander ────────────────────────────────────────────────────
  { title: "Wander", albumTitle: "Wander", artistSlug: "demo_artist_024", genre: "Indie Folk", duration: 234, description: "Setting off with no destination in mind." },
  { title: "Compass Rose", albumTitle: "Wander", artistSlug: "demo_artist_024", genre: "Indie Folk", duration: 219, description: "Finding direction in the feeling, not the map." },
  { title: "River Road", albumTitle: "Wander", artistSlug: "demo_artist_024", genre: "Folk", duration: 247, description: "Following water downstream until home." },
  { title: "Firefly Season", albumTitle: "Wander", artistSlug: "demo_artist_024", genre: "Indie Folk", duration: 208, description: "Summer magic caught in a jar." },
  // ── Sam Vega – Baile ──────────────────────────────────────────────────────
  { title: "Baile", albumTitle: "Baile", artistSlug: "demo_artist_025", genre: "Latin Pop", duration: 218, description: "Salsa-pop banger guaranteed to get you moving." },
  { title: "Corazón", albumTitle: "Baile", artistSlug: "demo_artist_025", genre: "Latin Pop", duration: 231, description: "Love song with an irresistible Latin groove." },
  { title: "Fiesta", albumTitle: "Baile", artistSlug: "demo_artist_025", genre: "Latin Pop", duration: 197, description: "Pure celebration energy." },
  { title: "Sol de Noche", albumTitle: "Baile", artistSlug: "demo_artist_025", genre: "Latin Pop", duration: 243, description: "The sun that shines only at night." },
  { title: "Ritmo", albumTitle: "Baile", artistSlug: "demo_artist_025", genre: "Latin Pop", duration: 209, description: "All about the rhythm, all about the feeling." },
  // ── Singles (no album) ────────────────────────────────────────────────────
  { title: "Midnight Run", albumTitle: null, artistSlug: "demo_artist_001", genre: "Indie Pop", duration: 198, description: "Late-night energy, standalone single." },
  { title: "Soul River", albumTitle: null, artistSlug: "demo_artist_002", genre: "R&B / Soul", duration: 214, description: "Free-flowing soul, no album needed." },
  { title: "Forgotten Stars", albumTitle: null, artistSlug: "demo_artist_005", genre: "Synth-Wave", duration: 237, description: "Stars you forgot existed, rediscovered." },
  { title: "Breathe", albumTitle: null, artistSlug: "demo_artist_008", genre: "Lo-Fi", duration: 164, description: "Take a breath. Just a short lo-fi moment." },
  { title: "Autumn Fade", albumTitle: null, artistSlug: "demo_artist_015", genre: "Folk", duration: 221, description: "Leaves and memories falling together." },
  { title: "Electric Soul", albumTitle: null, artistSlug: "demo_artist_016", genre: "Pop / Gospel", duration: 248, description: "Gospel-pop standalone with electric energy." },
  { title: "Night Train", albumTitle: null, artistSlug: "demo_artist_013", genre: "Hip-Hop", duration: 207, description: "Riding the night train with bars to spare." },
  { title: "Flicker", albumTitle: null, artistSlug: "demo_artist_014", genre: "Dark Pop", duration: 193, description: "A flame just before it goes out." },
  { title: "Summer Haze", albumTitle: null, artistSlug: "demo_artist_024", genre: "Indie Folk", duration: 226, description: "Long days, golden haze, indie folk ease." },
  { title: "Pulse Beat", albumTitle: null, artistSlug: "demo_artist_019", genre: "Experimental Electronic", duration: 318, description: "The heartbeat of the machine, experimental." },
];

// ─── Playlist Data ────────────────────────────────────────────────────────────
const DEMO_PLAYLISTS = [
  {
    title: "Late Night Drive",
    description: "Perfect songs for cruising through the city when everyone's asleep.",
    artistSlug: "demo_artist_005",
    isPublic: true,
    coverSeed: "pl_lnd",
    songTitles: ["Electric Memory", "Neon Boulevard", "Drive", "After Dark", "Neon After Rain", "Blue Hour", "Harbour Lights", "Strobe", "Analog Love"],
  },
  {
    title: "Chill & Focus",
    description: "Lo-fi and ambient tracks to help you concentrate without distraction.",
    artistSlug: "demo_artist_008",
    isPublic: true,
    coverSeed: "pl_cf",
    songTitles: ["Soft Static", "Half Asleep", "Dusty Vinyl", "Haze", "Solar Drift", "Nebula", "Orbit", "Sunday Morning", "Breathe"],
  },
  {
    title: "Morning Energy",
    description: "Start the day with uplifting beats and positive vibes.",
    artistSlug: "demo_artist_016",
    isPublic: true,
    coverSeed: "pl_me",
    songTitles: ["Revival", "Rise Up", "Baile", "Fiesta", "Morning Bloom", "Summer Spell", "Corazón", "Pulse & Glow", "Overflow"],
  },
  {
    title: "Weekend Vibes",
    description: "The soundtrack to your perfect weekend.",
    artistSlug: "demo_artist_006",
    isPublic: true,
    coverSeed: "pl_wv",
    songTitles: ["Harbour Lights", "Afterglow", "City Lights", "Violet Sky", "Warm Honey", "Firefly Season", "Summer Haze", "Golden Hour", "Cassette Love"],
  },
  {
    title: "Electronic Nights",
    description: "Deep electronic and house tracks for the dance floor.",
    artistSlug: "demo_artist_006",
    isPublic: true,
    coverSeed: "pl_en",
    songTitles: ["After Dark", "Strobe", "Ultraviolet", "Open Water", "Voltage", "Midnight Tide", "Bass Station", "Warpzone", "Signal Noise"],
  },
  {
    title: "Indie Discoveries",
    description: "Fresh indie tracks you might have missed.",
    artistSlug: "demo_artist_003",
    isPublic: true,
    coverSeed: "pl_id",
    songTitles: ["Parallel Hearts", "Distance", "Concrete Sky", "Wander", "Compass Rose", "River Road", "Broken Glass", "Radio Silence", "Echoes"],
  },
  {
    title: "Acoustic Moments",
    description: "Just voices, guitars, and feelings.",
    artistSlug: "demo_artist_004",
    isPublic: true,
    coverSeed: "pl_am",
    songTitles: ["Shoreline", "Driftwood", "Salt & Pine", "Open Road", "Campfire", "Blue Ridge", "Bossa Nova Dream", "Petal", "Free Fall"],
  },
  {
    title: "Midnight Mood",
    description: "Songs for when you can't sleep and your mind won't stop.",
    artistSlug: "demo_artist_001",
    isPublic: true,
    coverSeed: "pl_mm",
    songTitles: ["Neon After Rain", "Ghost Light", "3am Thoughts", "Pillow Talk", "Moth to Flame", "Shadow Garden", "After Midnight", "Still Waters", "Midnight Sessions"],
  },
  {
    title: "Fresh Finds",
    description: "The newest and most exciting tracks from emerging artists.",
    artistSlug: "demo_artist_008",
    isPublic: true,
    coverSeed: "pl_ff",
    songTitles: ["Pulse Beat", "Binary Bloom", "Glitch", "Neural Network", "String Theory", "Resonance", "Velvet Dreams", "Crimson Tide", "Glass Horizon"],
  },
  {
    title: "Road Trip",
    description: "Windows down, volume up. The ultimate driving playlist.",
    artistSlug: "demo_artist_015",
    isPublic: true,
    coverSeed: "pl_rt",
    songTitles: ["Open Road", "Drive", "Blue Ridge", "Red Canyon", "Campfire", "Small Town Stories", "Autumn Fade", "Wings", "Free Fall"],
  },
  {
    title: "R&B Sunday",
    description: "Smooth R&B and soul for a relaxed Sunday.",
    artistSlug: "demo_artist_002",
    isPublic: true,
    coverSeed: "pl_rb",
    songTitles: ["Afterglow", "Warm Honey", "Crimson", "Honey Gold", "Silk", "Soul River", "Warmth", "Tender", "Between the Lines"],
  },
  {
    title: "Hip-Hop Essentials",
    description: "Essential hip-hop tracks from the vault.",
    artistSlug: "demo_artist_013",
    isPublic: true,
    coverSeed: "pl_hh",
    songTitles: ["Street Level", "Corner Store Philosophy", "Grind Season", "Crown Me", "Night Train", "Skyline View", "Cipher"],
  },
  {
    title: "Dark Pop Delights",
    description: "Gothic, brooding pop for the romantically inclined.",
    artistSlug: "demo_artist_014",
    isPublic: true,
    coverSeed: "pl_dp",
    songTitles: ["Shadow Garden", "Thorns", "Moth to Flame", "Glass Coffin", "Flicker", "Éclipse", "La Nuit", "Solstice"],
  },
  {
    title: "Jazz After Hours",
    description: "Sophisticated jazz for the late evening.",
    artistSlug: "demo_artist_009",
    isPublic: true,
    coverSeed: "pl_ja",
    songTitles: ["Midnight Sessions", "Blue Note", "Coltrane Dreams", "Soul Kitchen", "Five AM", "Smoke & Mirrors", "Sable Nights", "Rain on Glass"],
  },
  {
    title: "Cinematic Escapes",
    description: "Music that sounds like a movie score for your everyday life.",
    artistSlug: "demo_artist_017",
    isPublic: true,
    coverSeed: "pl_ce",
    songTitles: ["Éclipse", "La Nuit", "Solstice", "Solar Drift", "Nebula", "Event Horizon", "Velvet Dreams", "Overture", "The Last Scene"],
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function seedDemoData() {
  console.log("\n🎵 Pulse Music — Demo Data Seeder");
  console.log("==================================\n");

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env file");
  }

  console.log("📡 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB Connected\n");

  const DEMO_PASSWORD = "DemoArtist@2025";
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  let artistsCreated = 0;
  let artistsSkipped = 0;
  let albumsCreated = 0;
  let albumsSkipped = 0;
  let songsCreated = 0;
  let songsSkipped = 0;
  let playlistsCreated = 0;
  let playlistsSkipped = 0;
  let playlistSongsCreated = 0;

  // ── Step 1: Create Demo Artists ────────────────────────────────────────────
  console.log("👥 Step 1: Creating demo artists...");
  const artistMap = {}; // slug → Artist document

  for (const artistData of DEMO_ARTISTS) {
    // Check if user already exists (idempotency)
    let user = await User.findOne({ email: artistData.email });

    if (!user) {
      user = await User.create({
        fullName: artistData.fullName,
        username: artistData.username,
        email: artistData.email,
        password: hashedPassword,
        avatarUrl: coverImageBase(artistData.avatarSeed),
        role: "artist",
        isVerified: true,
        isActive: true,
      });
      artistsCreated++;
    } else {
      artistsSkipped++;
    }

    // Check if Artist profile already exists
    let artist = await Artist.findOne({ userId: user._id });

    if (!artist) {
      artist = await Artist.create({
        userId: user._id,
        stageName: artistData.stageName,
        bio: artistData.bio,
        avatarUrl: coverImageBase(artistData.avatarSeed),
        coverImage: coverWideBase(artistData.avatarSeed),
        followers: artistData.followers,
        socialLinks: {
          instagram: `https://instagram.com/${artistData.username}`,
          youtube: `https://youtube.com/@${artistData.username}`,
        },
      });
    }

    artistMap[artistData.slug] = artist;
  }

  console.log(`   ✅ Artists created: ${artistsCreated} | Skipped (existing): ${artistsSkipped}\n`);

  // ── Step 2: Create Demo Albums ─────────────────────────────────────────────
  console.log("💿 Step 2: Creating demo albums...");
  const albumMap = {}; // title → Album document

  for (const albumData of DEMO_ALBUMS) {
    const artist = artistMap[albumData.artistSlug];
    if (!artist) {
      console.warn(`   ⚠️  Artist not found for slug: ${albumData.artistSlug}`);
      continue;
    }

    // Check if album already exists for this artist
    let album = await Album.findOne({
      title: albumData.title,
      artistId: artist._id,
    });

    if (!album) {
      album = await Album.create({
        title: albumData.title,
        artistId: artist._id,
        coverUrl: coverImageBase(albumData.coverSeed),
        releaseYear: albumData.releaseYear,
      });
      albumsCreated++;
    } else {
      albumsSkipped++;
    }

    albumMap[albumData.title] = album;
  }

  console.log(`   ✅ Albums created: ${albumsCreated} | Skipped (existing): ${albumsSkipped}\n`);

  // ── Step 3: Create Demo Songs ──────────────────────────────────────────────
  console.log("🎵 Step 3: Creating demo songs...");
  const songMap = {}; // title → Song document (first match wins)
  let audioIdx = 0;

  for (const songData of DEMO_SONGS) {
    const artist = artistMap[songData.artistSlug];
    if (!artist) {
      console.warn(`   ⚠️  Artist not found for slug: ${songData.artistSlug}`);
      continue;
    }

    const album = songData.albumTitle ? albumMap[songData.albumTitle] : null;

    // Check if song already exists (by title + artistId)
    let song = await Song.findOne({
      title: songData.title,
      artistId: artist._id,
    });

    if (!song) {
      const audioUrl = pick(AUDIO_POOL, audioIdx++);
      song = await Song.create({
        title: songData.title,
        artistId: artist._id,
        albumId: album ? album._id : null,
        audioUrl,
        coverUrl: album
          ? coverImageBase(`${songData.albumTitle}_song_${audioIdx}`)
          : coverImageBase(`single_${songData.title.replace(/\s+/g, "_")}`),
        duration: songData.duration,
        genre: songData.genre,
        description: songData.description,
        playCount: Math.floor(Math.random() * 500000) + 1000,
      });
      songsCreated++;
    } else {
      songsSkipped++;
    }

    if (!songMap[songData.title]) {
      songMap[songData.title] = song;
    }
  }

  console.log(`   ✅ Songs created: ${songsCreated} | Skipped (existing): ${songsSkipped}\n`);

  // ── Step 4: Create Demo Playlists ──────────────────────────────────────────
  console.log("📋 Step 4: Creating demo playlists...");

  for (const plData of DEMO_PLAYLISTS) {
    const artist = artistMap[plData.artistSlug];
    if (!artist) {
      console.warn(`   ⚠️  Artist not found for slug: ${plData.artistSlug}`);
      continue;
    }

    // Check if playlist already exists
    let playlist = await Playlist.findOne({
      title: plData.title,
      artistId: artist._id,
    });

    if (!playlist) {
      playlist = await Playlist.create({
        title: plData.title,
        description: plData.description,
        artistId: artist._id,
        coverUrl: coverImageBase(plData.coverSeed),
        isPublic: plData.isPublic,
      });
      playlistsCreated++;
    } else {
      playlistsSkipped++;
    }

    // Add songs to playlist (idempotent — unique index prevents duplicates)
    for (const songTitle of plData.songTitles) {
      const song = songMap[songTitle];
      if (!song) {
        continue; // Song might not have been created yet
      }

      try {
        await PlaylistSong.create({
          playlistId: playlist._id,
          songId: song._id,
          addedAt: new Date(),
        });
        playlistSongsCreated++;
      } catch (err) {
        // Duplicate key error (E11000) means the song is already in the playlist
        if (err.code !== 11000) {
          console.warn(`   ⚠️  Could not add song "${songTitle}" to playlist "${plData.title}": ${err.message}`);
        }
      }
    }
  }

  console.log(`   ✅ Playlists created: ${playlistsCreated} | Skipped (existing): ${playlistsSkipped}`);
  console.log(`   ✅ Playlist-Song links created: ${playlistSongsCreated}\n`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("══════════════════════════════════════════");
  console.log("✅ Demo seed completed successfully!");
  console.log("══════════════════════════════════════════");
  console.log(`\n📊 Summary:`);
  console.log(`   Artists created:   ${artistsCreated}`);
  console.log(`   Albums created:    ${albumsCreated}`);
  console.log(`   Songs created:     ${songsCreated}`);
  console.log(`   Playlists created: ${playlistsCreated}`);
  console.log(`\n🔑 Demo artist login credentials:`);
  console.log(`   Email pattern: demo_artist_001@pulse-demo.com ... demo_artist_025@pulse-demo.com`);
  console.log(`   Password (all demo artists): ${DEMO_PASSWORD}`);
  console.log(`\n🎧 Audio setup:`);
  console.log(`   Audio pool size: ${AUDIO_POOL.length} royalty-free tracks from Free Music Archive`);
  console.log(`   Songs cycle through the pool — all are publicly accessible MP3 streams`);
  console.log(`   Field used by frontend player: Song.audioUrl`);
  console.log(`\n⚠️  Note: If you run the seed again, existing records will be skipped safely.`);
  console.log("");
}

// ─── Run ──────────────────────────────────────────────────────────────────────
seedDemoData()
  .catch((err) => {
    console.error("\n❌ Seed failed:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("📡 MongoDB disconnected. Goodbye! 👋\n");
    process.exit(0);
  });
