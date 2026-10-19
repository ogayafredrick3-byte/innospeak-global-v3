import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'InnoSpeak Global';
const DEFAULT_DESCRIPTION = 'InnoSpeak Global — Transforming communication, technical and leadership skills for the next generation.';

export default function Seo({ title, description, path }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || DEFAULT_DESCRIPTION} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || DEFAULT_DESCRIPTION} />
      <meta property="og:type" content="website" />
      <link rel="canonical" href={`https://innospeak.global${path || ''}`} />
    </Helmet>
  );
}
