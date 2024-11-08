'use client';
import dynamic from 'next/dynamic';
import React, { memo, useEffect, useState } from 'react';
import { DocRenderer } from 'react-doc-viewer';

const DocViewer = dynamic(
  () => import('react-doc-viewer').then((mod) => mod.default),
  { ssr: false },
);

const useDocViewerRenderers = () => {
  const [DocViewerRenderers, setDocViewerRenderers] = useState<DocRenderer[]>(
    [],
  );

  useEffect(() => {
    import('react-doc-viewer')
      .then((mod) => {
        setDocViewerRenderers(mod.DocViewerRenderers);
      })
      .catch((err) => {
        console.error('Failed to load DocViewerRenderers:', err);
      });
  }, []);

  return DocViewerRenderers;
};

interface DocumentViewerProps {
  url: string;
}

export const DocumentViewer = memo((props: DocumentViewerProps) => {
  const renderers = useDocViewerRenderers();
  return (
    <div>
      <DocViewer
        documents={[{ uri: props.url, fileType: 'docx' }]}
        pluginRenderers={renderers}
        style={{ width: '100%', height: '80vh' }}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
            retainURLParams: true,
          },
        }}
      />
    </div>
  );
});

DocumentViewer.displayName = 'DocumentViewer';
