'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { User, Upload } from 'lucide-react';

interface AvatarProps {
    src?: string;
    onChange: (file: File) => void;
    loading?: boolean;
}

export function Avatar({ src, onChange, loading }: AvatarProps) {
    const [hovered, setHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
        }
    };

    return (
        <div
            className="relative cursor-pointer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => !loading && fileInputRef.current?.click()}
        >
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-border bg-muted flex items-center justify-center">
                {src ? (
                    <Image src={src} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                )}
            </div>
            <div
                className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity duration-150 ${
                    hovered ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <Upload className="h-5 w-5 text-white" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
    );
}
