import mongoose from 'mongoose';

async function fixData() {
  await mongoose.connect('mongodb+srv://vicaxanh:v1tu%40nkhoa2007@cluster0.mvrcinq.mongodb.net/PulseWeb?retryWrites=true&w=majority&appName=Cluster0a');
  console.log('Connected');
  
  const artists = await mongoose.connection.collection('artists').find({}).toArray();
  console.log('Artists without userId:', artists.filter(a => !a.userId).length);

  const users = await mongoose.connection.collection('users').find({ role: 'artist' }).toArray();
  for (const u of users) {
    const linkedArtist = artists.find(a => String(a.userId) === String(u._id));
    if (!linkedArtist) {
      console.log('User', u.username, 'has no linked artist!');
      let match = artists.find(a => !a.userId && (a.stageName.toLowerCase() === u.fullName.toLowerCase() || a.stageName.toLowerCase() === u.username.toLowerCase()));
      
      if (!match && artists.filter(a => !a.userId).length > 0) {
         match = artists.find(a => !a.userId);
      }
      
      if (match) {
         console.log('Linking', u.username, 'to artist:', match.stageName);
         await mongoose.connection.collection('artists').updateOne({ _id: match._id }, { $set: { userId: u._id } });
      } else {
         // Create a new artist record for them
         console.log('No unlinked artist found, creating new artist for', u.username);
         const res = await mongoose.connection.collection('artists').insertOne({
             userId: u._id,
             stageName: u.fullName || u.username,
             bio: '',
             followers: 0,
             createdAt: new Date(),
             updatedAt: new Date()
         });
         console.log('Created artist', res.insertedId);
      }
    }
  }
  process.exit(0);
}

fixData().catch(console.error);
