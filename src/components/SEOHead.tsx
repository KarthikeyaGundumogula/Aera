import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const DEFAULT_TITLE = 'FrameHouse | Living Cinema';
const DEFAULT_DESCRIPTION =
  'FrameHouse is a premium platform celebrating cinema and everything around it. Experience the magic of the silver screen and immersive storytelling in one ecosystem.';
const DEFAULT_IMAGE = 'https://framehouse-casa.vercel.app/icon-512.png';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = typeof window !== 'undefined' ? window.location.href : '',
}: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | FrameHouse` : DEFAULT_TITLE;
    document.title = fullTitle;

    const updateMeta = (nameOrProperty: string, value: string, isProperty = false) => {
      const selector = isProperty
        ? `meta[property="${nameOrProperty}"]`
        : `meta[name="${nameOrProperty}"]`;
      let element = document.querySelector(selector);

      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', nameOrProperty);
        } else {
          element.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', value);
    };

    updateMeta('title', fullTitle);
    updateMeta('description', description);

    // OpenGraph
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);

    // Twitter
    updateMeta('twitter:title', fullTitle, true);
    updateMeta('twitter:description', description, true);
    updateMeta('twitter:image', image, true);
    updateMeta('twitter:url', url, true);
  }, [title, description, image, url]);

  return null;
}
