import { useState, useRef } from 'react';

export function useImageUpload(initialPreview = null) {
    const [preview, setPreview] = useState(initialPreview);
    const fileInputRef = useRef(null);

    const handleChange = (e, setData) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const triggerInput = () => fileInputRef.current?.click();

    return { preview, fileInputRef, handleChange, triggerInput };
}
