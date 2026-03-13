'use client';

import LandingForm from '@/components/landing/LandingForm';

export default function Home() {
  return (
    <div className="paper-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="relative z-10 w-full max-w-xl">
        <header className="mb-10 text-center">
          <h1
            className="text-5xl md:text-6xl leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            Where are your
            <br />
            friends heading?
          </h1>
          <p className="mt-4 text-sm text-[#2B2B23]/60 tracking-wide uppercase">
            A social atlas of the future
          </p>
        </header>
        <LandingForm />
      </div>
    </div>
  );
}
