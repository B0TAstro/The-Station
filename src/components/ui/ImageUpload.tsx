'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value?: string | null;
    onChange: (file: File | null) => void;
    maxSize?: number;
    className?: string;
}

export default function ImageUpload({ value, onChange, maxSize = 2, className }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        if (!file.type.startsWith('image/')) {
            setError('Le fichier doit être une image');
            return;
        }

        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`L'image est trop grande (max ${maxSize}MB)`);
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        onChange(file);
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={cn('w-full', className)}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
            />

            <div className="flex items-center gap-4">
                <div className="relative">
                    <div
                        className={cn(
                            'w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors',
                            preview ? 'border-freelance' : 'border-border hover:border-freelance/50',
                        )}
                    >
                        {preview ? (
                            <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : (
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>

                    {preview && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                <div className="flex-1">
                    <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer inline-block px-4 py-2 rounded-lg border border-border bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        {preview ? 'Changer la photo' : 'Ajouter une photo'}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">Optionnel • Max {maxSize}MB • JPG, PNG, WEBP</p>
                </div>
            </div>

            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
    );
}
