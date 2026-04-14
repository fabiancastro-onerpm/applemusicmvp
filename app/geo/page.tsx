"use client";

// Redirect to main page — all geo functionality is now in the main dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GeoPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return null;
}
