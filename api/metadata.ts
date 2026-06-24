import originals from '../src/mock/originals.json';
import artists from '../src/mock/artists.json';
import works from '../src/mock/works.json';
import festivals from '../src/mock/festivals.json';
import sets from '../src/mock/sets.json';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Example: /originals/og-1
    const [type, id] = pathSegments;
    
    let title = "FrameHouse | Living Cinema";
    let description = "FrameHouse is a premium platform celebrating cinema and everything around it. Experience the magic of the silver screen and immersive storytelling in one ecosystem.";
    let image = "https://framehouse-casa.vercel.app/icon-512.png";

    if (type === 'originals') {
      const item = originals.find(o => o.id === id);
      if (item) {
        title = `${item.title} | FrameHouse Original`;
        description = item.description;
        image = item.coverImage.startsWith('http') ? item.coverImage : `https://${url.host}${item.coverImage}`;
      }
    } else if (type === 'artists') {
      const item = artists.find(a => a.id === id);
      if (item) {
        title = `${item.name} | FrameHouse Artist`;
        description = item.bio || description;
        image = item.image.startsWith('http') ? item.image : `https://${url.host}${item.image}`;
      }
    } else if (type === 'festivals') {
      const item = festivals.find(f => f.id === id);
      if (item) {
        title = `${item.title} | FrameHouse Festival`;
        description = item.description;
        image = item.coverImage.startsWith('http') ? item.coverImage : `https://${url.host}${item.coverImage}`;
      }
    } else if (type === 'sets') {
      const item = sets.find(s => s.id === id);
      if (item) {
        title = `${item.name} | FrameHouse Set`;
        description = item.description;
        image = item.coverImage.startsWith('http') ? item.coverImage : `https://${url.host}${item.coverImage}`;
      }
    } else if (type === 'works') {
      const item = works.find(w => w.id === id);
      if (item) {
        title = `${item.title} | FrameHouse Works`;
        description = item.description || description;
        if (item.image) {
          image = item.image.startsWith('http') ? item.image : `https://${url.host}${item.image}`;
        }
      }
    }

    // Fetch base HTML
    // We fetch from /index.html explicitly to ensure we get the static file
    // rather than falling back into the dynamic rewrite loop.
    const response = await fetch(`https://${url.host}/index.html`);
    if (!response.ok) {
      throw new Error(`Failed to fetch base HTML: ${response.statusText}`);
    }
    
    let html = await response.text();

    // Safely escape values to prevent injection
    const safeTitle = title.replace(/"/g, '&quot;');
    const safeDescription = description.replace(/"/g, '&quot;');
    const safeImage = image.replace(/"/g, '&quot;');
    const safeUrl = url.href.replace(/"/g, '&quot;');

    // Replace Meta Tags
    html = html.replace(/<title>.*<\/title>/g, `<title>${safeTitle}</title>`);
    html = html.replace(/<meta name="title" content="[^"]*"/g, `<meta name="title" content="${safeTitle}" />`);
    html = html.replace(/<meta name="description" content="[^"]*"/g, `<meta name="description" content="${safeDescription}" />`);
    
    html = html.replace(/<meta property="og:title" content="[^"]*"/g, `<meta property="og:title" content="${safeTitle}" />`);
    html = html.replace(/<meta property="og:description" content="[^"]*"/g, `<meta property="og:description" content="${safeDescription}" />`);
    html = html.replace(/<meta property="og:image" content="[^"]*"/g, `<meta property="og:image" content="${safeImage}" />`);
    html = html.replace(/<meta property="og:url" content="[^"]*"/g, `<meta property="og:url" content="${safeUrl}" />`);
    
    html = html.replace(/<meta property="twitter:title" content="[^"]*"/g, `<meta property="twitter:title" content="${safeTitle}" />`);
    html = html.replace(/<meta property="twitter:description" content="[^"]*"/g, `<meta property="twitter:description" content="${safeDescription}" />`);
    html = html.replace(/<meta property="twitter:image" content="[^"]*"/g, `<meta property="twitter:image" content="${safeImage}" />`);
    html = html.replace(/<meta property="twitter:url" content="[^"]*"/g, `<meta property="twitter:url" content="${safeUrl}" />`);

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Metadata edge function failed', error);
    
    // Fallback to fetching basic index.html on failure
    try {
      const fallbackUrl = new URL(req.url);
      const res = await fetch(`https://${fallbackUrl.host}/index.html`);
      return new Response(res.body, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    } catch (e) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}
