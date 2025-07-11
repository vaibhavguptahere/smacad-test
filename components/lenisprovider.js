// components/lenisprovider.jsx

'use client';

import { ReactLenis } from 'lenis/react';

export default function LenisProvider({ children }) {
    return <ReactLenis root>{children}</ReactLenis>;
}
