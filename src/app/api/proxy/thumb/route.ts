import { NextResponse } from 'next/server';

// TikTok CDN URL patterns to try, in order of preference
const TIKTOK_CDN_PATTERNS = [
  (id: string) => `https://p19-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/${id}~tplv-photomode-image:480:640.jpeg`,
  (id: string) => `https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/${id}~tplv-photomode-image:480:640.jpeg`,
  (id: string) => `https://p77-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/${id}~tplv-photomode-image:480:640.jpeg`,
];

async function tryFetchImage(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Referer': 'https://www.tiktok.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });
    if (res.ok) return res;
  } catch (e) {
    // ignore
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId || !/^\d+$/.test(videoId)) {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
  }

  // Try each CDN pattern until one works
  for (const pattern of TIKTOK_CDN_PATTERNS) {
    const cdnUrl = pattern(videoId);
    const imgResponse = await tryFetchImage(cdnUrl);
    
    if (imgResponse) {
      const imageBuffer = await imgResponse.arrayBuffer();
      const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
      
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400', // cache 24h
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // If all CDN patterns fail, try fetching via TikTok's own embed thumbnail endpoint
  try {
    const tiktokVideoUrl = `https://www.tiktok.com/api/img/?itemId=${videoId}&location=0&aid=1988`;
    const res = await tryFetchImage(tiktokVideoUrl);
    if (res) {
      const buf = await res.arrayBuffer();
      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': res.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (e) {
    // ignore
  }

  return NextResponse.json({ error: 'Could not fetch thumbnail' }, { status: 404 });
}
