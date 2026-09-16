function calculateDimensions(width: number, height: number, maxWidth: number, maxHeight: number) {
    if (width <= maxWidth && height <= maxHeight) {
        return { width, height };
    }
    if (width > height) {
        return { width: maxWidth, height: Math.round((height * maxWidth) / width) };
    }
    return { width: Math.round((width * maxHeight) / height), height: maxHeight };
}

function renderImageToBlob(img: HTMLImageElement, width: number, height: number, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export async function compressImage(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.8): Promise<File> {
    if (!file || !file.type?.startsWith('image/')) {
        return file;
    }

    try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) || '');
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const img = await loadImage(dataUrl);
        const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
        const blob = await renderImageToBlob(img, width, height, quality);
        if (!blob) return file;

        return new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });
    } catch {
        return file;
    }
}
