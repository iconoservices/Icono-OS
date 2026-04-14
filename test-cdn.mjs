const tiktokUrl = 'https://www.tiktok.com/@las.bestiales/video/7622698417373891862';

// Test noembed.com
const noembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(tiktokUrl)}`;
fetch(noembedUrl)
  .then(r => r.json())
  .then(data => {
    console.log('noembed result:', JSON.stringify(data, null, 2).substring(0, 400));
  })
  .catch(e => console.error('noembed error:', e.message));
