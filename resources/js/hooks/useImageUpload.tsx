import { useState, useRef } from 'react';
import { compressImage } from '@/lib/imageCompressor';

export function useImageUpload(initialPreview = null) {
    const [preview, setPreview] = useState(initialPreview);
    const fileInputRef = useRef(null);

    const handleChange = async (e, setData) => {
        const file = e.target.files[0];
        if (file) {
            const optimized = await compressImage(file);
            setData('image', optimized);
            setPreview(URL.createObjectURL(optimized));
        }
    };

    const handleRemove = (setData) => {
        setData('image', null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerInput = () => fileInputRef.current?.click();

    return { preview, fileInputRef, handleChange, handleRemove, triggerInput };
}

