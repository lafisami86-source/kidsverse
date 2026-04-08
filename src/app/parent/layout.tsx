// Parent Dashboard Layout
// TODO: Implement parent dashboard layout with sidebar navigation

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Parent Dashboard',
  description: 'Manage your child profiles and monitor activity',
};

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
