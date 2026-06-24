import fs from 'fs';
import https from 'https';
import path from 'path';

const url = "https://nda.edu.ng/wp-content/uploads/2020/06/logo.png";
const fallbackUrl = "https://upload.wikimedia.org/wikipedia/en/4/4e/Nigerian_Defence_Academy_logo.png";
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const dest = path.join(publicDir, 'logo.png');

function download(downloadUrl: string, isFallback = false) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  https.get(downloadUrl, options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Failed to download: ${res.statusCode} from ${downloadUrl}`);
      if (!isFallback) {
        console.log('Attempting fallback download...');
        download(fallbackUrl, true);
      } else {
        process.exit(1);
      }
      return;
    }
    
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Logo downloaded successfully to public/logo.png ${isFallback ? '(Fallback)' : ''}`);
    });
  }).on('error', (err) => {
    console.error('Error downloading logo:', err.message);
    if (!isFallback) {
      console.log('Attempting fallback download...');
      download(fallbackUrl, true);
    }
  });
}

download(url);
