export const transformAndValidateFile = (config, file) => {
    const errors = [];

    if (!file) {
        return { isValid: false, errors: ['No file provided'], transformedFile: null };
    }

    // Transform file to ensure size is in KB
    const transformedFile = transformFile(file);
    const fileSize = transformedFile.size;

    // Check extension (empty string or empty array means all types supported)
    const extensions = config?.supportedExtensions;
    const hasExtensionRestriction = extensions && extensions !== '' && Array.isArray(extensions) && extensions.length > 0;

    if (hasExtensionRestriction) {
        const ext = transformedFile.name ? transformedFile.name.split('.').pop().toLowerCase() : '';
        if (!extensions.some((e) => e.toLowerCase() === '.' + ext)) {
            errors.push(`Invalid file type. Allowed: ${extensions.join(', ')}`);
        }
    }

    // Check minimum size (fileSize and config values are in KB)
    if (config?.minValue && fileSize < config.minValue) {
        errors.push(`File too small. Minimum: ${formatFileSize(config.minValue)}`);
    }

    // Check maximum size (fileSize and config values are in KB)
    if (config?.maxValue && fileSize > config.maxValue) {
        errors.push(`File too large. Maximum: ${formatFileSize(config.maxValue)}`);
    }

    return { isValid: errors.length === 0, errors, transformedFile };
};
export const transformFile = (file) => {
    if (file.path) {
        return file;
    }
    const sizeInKB = file.size / 1024;

    // Shadow the read-only size property with KB value
    Object.defineProperty(file, 'size', {
        value: sizeInKB,
        writable: false,
        configurable: true
    });
    return file;
};
export const formatFileSize = (kb) => {
    if (kb === 0) return '0 KB';

    // Handle files smaller than 1 KB (convert to bytes)
    if (kb < 1) {
        const bytes = Math.round(kb * 1024);
        return bytes + ' Bytes';
    }

    const k = 1024;
    const sizes = ['KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(kb) / Math.log(k));

    // Ensure index is within bounds
    const sizeIndex = Math.max(0, Math.min(i, sizes.length - 1));

    return Math.round((kb / Math.pow(k, sizeIndex)) * 100) / 100 + ' ' + sizes[sizeIndex];
};

export const bytesToKB = (bytes) => {
    let sizeInKB = bytes / 1000;
    return sizeInKB;
};

export const toCreateFormat = (files) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return null;
    }

    return files.map((file) => ({
        Path: file.path
    }));
};

export const toUpdateFormat = (files) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return null;
    }

    return files.map((file) => {
        const formatted = {
            Path: file.path
        };

        // If file has an Id, it's an existing file - include the Id
        if (file.Id) {
            formatted.Id = file.id;
        }

        return formatted;
    });
};
