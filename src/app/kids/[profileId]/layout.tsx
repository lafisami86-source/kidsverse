// Child Layout Wrapper
// TODO: Implement child-friendly layout with mascot, navigation, and age-appropriate UI

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KidsVerse',
  description: 'A fun learning adventure for kids',
};

export default function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
