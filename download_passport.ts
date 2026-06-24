import fs from 'fs';
import https from 'https';
import path from 'path';

const url = "https://ui-avatars.com/api/?name=Aisha+Bello&size=150&background=e9d5ff&color=6b21a8&format=png";
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const dest = path.join(publicDir, 'passport-placeholder.png');

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download: ${res.statusCode}`);
    process.exit(1);
  }
  
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('Passport downloaded successfully to public/passport-placeholder.png');
  });
}).on('error', (err) => {
  console.error('Error downloading passport:', err.message);
});
