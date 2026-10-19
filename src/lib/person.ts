// schema.org data that search engines and recruiting tools read.
export function personJsonLd(s: {
  name: string;
  description: string;
  email: string;
  github: string;
  linkedin?: string;
  location: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: s.name,
    url: 'https://bencohen.com.au/',
    email: `mailto:${s.email}`,
    description: s.description,
    jobTitle: 'Cybersecurity & Networking Student',
    address: { '@type': 'PostalAddress', addressLocality: 'Sydney', addressRegion: 'NSW', addressCountry: 'AU' },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'University of Technology Sydney' },
      { '@type': 'CollegeOrUniversity', name: 'Beijing Institute of Technology' },
    ],
    worksFor: { '@type': 'Organization', name: 'Code4Fun Sydney Programming School' },
    knowsAbout: [
      'Cybersecurity',
      'Computer networking',
      'Python',
      'C',
      'C++',
      'JavaScript',
      'SQL',
      'Linux',
      'Machine learning',
      'Data science',
      'Software testing',
      'Technical writing',
    ],
    knowsLanguage: ['English', 'Mandarin Chinese'],
    sameAs: [s.github, s.linkedin].filter(Boolean),
  };
}
