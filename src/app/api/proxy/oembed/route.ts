import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
  }

  try {
    let oembedUrl = "";

    // Detect platform
    if (url.includes("tiktok.com")) {
      oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (url.includes("instagram.com")) {
      // Instagram requires App ID / Access Token for oEmbed now, 
      // so we might just return a generic response or try a simple fetch if possible.
      return NextResponse.json({ error: 'Instagram requires authentication' }, { status: 403 });
    } else {
      return NextResponse.json({ error: 'Platform not supported for auto-thumbnail' }, { status: 400 });
    }

    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from platform' }, { status: response.status });
    }

    const data = await response.json();
    
    // Normalize response for our UI
    return NextResponse.json({
      thumbnail_url: data.thumbnail_url || data.thumbnail,
      title: data.title,
      author_name: data.author_name,
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
