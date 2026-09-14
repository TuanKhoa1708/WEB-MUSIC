/**
 * fixAudioUrls.js
 * 
 * Run this script ONCE to update all songs/albums in MongoDB
 * from localhost:5000 URLs to the production Render URL.
 * 
 * Usage:
 *   node fixAudioUrls.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const OLD_BASE = 'http://localhost:5000';
const NEW_BASE = 'https://web-music-zb6r.onrender.com';

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

// Fix Songs
const Song = mongoose.model('Song', new mongoose.Schema({}, { strict: false }), 'songs');
const songs = await Song.find({
    $or: [
        { audioUrl: { $regex: 'localhost' } },
        { coverUrl: { $regex: 'localhost' } },
    ]
});

console.log(`🔍 Found ${songs.length} song(s) with localhost URLs`);

for (const song of songs) {
    const updates = {};
    if (song.audioUrl?.includes('localhost')) {
        updates.audioUrl = song.audioUrl.replace(OLD_BASE, NEW_BASE);
    }
    if (song.coverUrl?.includes('localhost')) {
        updates.coverUrl = song.coverUrl.replace(OLD_BASE, NEW_BASE);
    }
    if (Object.keys(updates).length > 0) {
        await Song.updateOne({ _id: song._id }, { $set: updates });
        console.log(`  ✔ Song "${song.title}" updated`);
    }
}

// Fix Artists (avatar/banner)
const Artist = mongoose.model('Artist', new mongoose.Schema({}, { strict: false }), 'artists');
const artists = await Artist.find({
    $or: [
        { avatar: { $regex: 'localhost' } },
        { banner: { $regex: 'localhost' } },
    ]
});

console.log(`🔍 Found ${artists.length} artist(s) with localhost URLs`);

for (const artist of artists) {
    const updates = {};
    if (artist.avatar?.includes('localhost')) {
        updates.avatar = artist.avatar.replace(OLD_BASE, NEW_BASE);
    }
    if (artist.banner?.includes('localhost')) {
        updates.banner = artist.banner.replace(OLD_BASE, NEW_BASE);
    }
    if (Object.keys(updates).length > 0) {
        await Artist.updateOne({ _id: artist._id }, { $set: updates });
        console.log(`  ✔ Artist "${artist.stageName}" updated`);
    }
}

// Fix Albums (coverUrl)
const Album = mongoose.model('Album', new mongoose.Schema({}, { strict: false }), 'albums');
const albums = await Album.find({ coverUrl: { $regex: 'localhost' } });

console.log(`🔍 Found ${albums.length} album(s) with localhost URLs`);

for (const album of albums) {
    if (album.coverUrl?.includes('localhost')) {
        await Album.updateOne(
            { _id: album._id },
            { $set: { coverUrl: album.coverUrl.replace(OLD_BASE, NEW_BASE) } }
        );
        console.log(`  ✔ Album "${album.title}" updated`);
    }
}

console.log('\n🎉 Done! All localhost URLs have been replaced with the production URL.');
console.log('⚠️  NOTE: The actual MP3/image files need to be re-uploaded on production');
console.log('    since Render.com does NOT persist the uploads/ folder between deploys.');

await mongoose.disconnect();
