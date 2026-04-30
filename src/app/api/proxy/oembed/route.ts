import { NextResponse } from 'next/server';

async function resolveTikTokUrl(url: string): Promise<string> {
  if (url.includes('vt.tiktok.com') || url.match(/tiktok\.com\/t\//)) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      return res.url || url;
    } catch {
      return url;
    }
  }
  return url;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
  }

  try {
    if (url.includes('tiktok.com')) {
      const resolvedUrl = await resolveTikTokUrl(url);
      
      // Try TikTok oEmbed FIRST (official way)
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(resolvedUrl)}`;
      const oembedRes = await fetch(oembedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      let title = "";
      let author = "";
      let thumb = "";
      let videoId = resolvedUrl.match(/video\/(\d+)/)?.[1] || "";

      if (oembedRes.ok) {
        const data = await oembedRes.json();
        title = data.title || "";
        author = data.author_name || "";
        thumb = data.thumbnail_url || "";
        if (!videoId) videoId = data.embed_product_id || "";
      }

      // If oEmbed didn't give a thumbnail (common now), try tikwm API (fallback)
      if (!thumb) {
        try {
          const tikwmRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(resolvedUrl)}`);
          if (tikwmRes.ok) {
            const klData = await tikwmRes.json();
            if (klData.data && klData.data.cover) {
              thumb = klData.data.cover;
              if (!title) title = klData.data.title || "";
              if (!author) author = klData.data.author?.nickname || "";
            }
          }
        } catch (e) {
          console.error("TikWM failed");
        }
      }

      // If still no thumb, use our local proxy with the videoId as a last resort
      if (!thumb && videoId) {
        thumb = `/api/proxy/thumb?id=${videoId}`;
      }

      return NextResponse.json({
        thumbnail_url: thumb,
        title: title,
        author_name: author,
        video_id: videoId
      });

    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Extract YouTube video ID
      const ytMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
      const videoId = ytMatch ? ytMatch[1] : '';

      if (videoId) {
        return NextResponse.json({
          thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          title: '',
          author_name: '',
        });
      }

      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          thumbnail_url: data.thumbnail_url || '',
          title: data.title || '',
          author_name: data.author_name || '',
        });
      }
    } else {
      // Universal fallback: use Microlink to extract thumbnail from any URL (Instagram, Twitter, etc.)
      try {
        const microlinkRes = await fetch(
          `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        if (microlinkRes.ok) {
          const mlData = await microlinkRes.json();
          const image =
            mlData.data?.image?.url ||
            mlData.data?.logo?.url ||
            '';
          const title = mlData.data?.title || '';
          if (image) {
            return NextResponse.json({
              thumbnail_url: image,
              title,
              author_name: mlData.data?.author || '',
            });
          }
        }
      } catch (e) {
        console.error('Microlink fallback failed:', e);
      }
    }

    return NextResponse.json({ error: 'Platform not supported' }, { status: 400 });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
