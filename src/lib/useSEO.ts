import { useEffect } from 'react';

/**
 * useSEO Hook: Programmatically manages metadata for the VEKTR Studio Vision 2.0 suite.
 * High-functioning metadata ensures visibility for the Independent Artist.
 */
export function useSEO(title: string, description?: string) {
  useEffect(() => {
    // 1. Title Tag
    const prevTitle = document.title;
    document.title = title.startsWith('VEKTR') ? title : `VEKTR Studio | ${title}`;

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.getAttribute('content');
    if (description) {
      metaDesc.setAttribute('content', description);
    }

    // 3. Cleanup to restore previous tags if needed (optional for SPAs)
    return () => {
      document.title = prevTitle;
      if (prevDesc) metaDesc?.setAttribute('content', prevDesc);
    };
  }, [title, description]);
}
