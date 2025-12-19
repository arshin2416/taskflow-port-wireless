/**
 * Validates a single file against field configuration
 * @param {File} file - File to validate
 * @param {Object} config - Field configuration
 * @returns {Object} - { isValid: boolean, errors: string[], transformedFile: File }
 */
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

/**
 * Transforms file objects to Pascal case and validates them against field configuration
 * @param {File[]} files - Array of files to transform and validate
 * @param {Object} config - Field configuration
 * @returns {Object} - { isValid: boolean, errors: string[], transformedFiles: Array }
 */
// export const transformAndValidate = (config, files) => {
//     const errors = [];
//     const fileArray = Array.isArray(files) ? files : [files];

//     // If no files and not required, it's valid
//     if (fileArray.length === 0) {
//         return { isValid: true, errors: [], transformedFiles: [] };
//     }

//     // Check multiple files
//     if (!config?.supportMultipleValues && fileArray.length > 1) {
//         errors.push('Only one file is allowed');
//     }

//     // Transform and validate each file
//     const transformedFiles = fileArray.map((file, index) => {
//         // Transform file to Pascal case
//         // const transformedFile = transformFileToPascalCase(file);
//         const transformedFile = transformFile(file);

//         const fileSize = transformedFile.size;
//         const fileNum = fileArray.length > 1 ? `File ${index + 1}: ` : '';

//         // Check extension (empty string or empty array means all types supported)
//         const extensions = config?.supportedExtensions;
//         const hasExtensionRestriction = extensions && extensions !== '' && Array.isArray(extensions) && extensions.length > 0;

//         if (hasExtensionRestriction) {
//             const ext = transformedFile.name ? transformedFile.name.split('.').pop().toLowerCase() : '';
//             if (!extensions.some((e) => e.toLowerCase() === ext)) {
//                 errors.push(`${fileNum}Invalid file type. Allowed: ${extensions.join(', ')}`);
//             }
//         }

//         // Check minimum size (fileSize and config values are in KB)
//         if (config?.minValue && fileSize < config.minValue) {
//             errors.push(`${fileNum}File too small. Minimum: ${formatFileSize(config.minValue)}`);
//         }

//         // Check maximum size (fileSize and config values are in KB)
//         if (config?.maxValue && fileSize > config.maxValue) {
//             errors.push(`${fileNum}File too large. Maximum: ${formatFileSize(config.maxValue)}`);
//         }

//         return transformedFile;
//     });

//     return { isValid: errors.length === 0, errors, transformedFiles };
// };

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
/**
 * Transforms file object keys to Pascal case and converts size to KB
 * @param {Object} file - File object with lowercase or mixed case keys
 * @returns {Object} - Transformed file with Pascal case keys
 */
export const transformFileToPascalCase = (file) => {
    // Property mappings from camelCase to PascalCase
    const propertyMappings = [
        { camel: 'name', pascal: 'Name' },
        { camel: 'size', pascal: 'Size', transform: (value) => value / 1024 }, // convert bytes to KB
        { camel: 'type', pascal: 'Type' },
        { camel: 'lastModified', pascal: 'LastModified' },
        { camel: 'lastModifiedDate', pascal: 'LastModifiedDate' },
        { camel: 'webkitRelativePath', pascal: 'WebkitRelativePath' }
    ];

    // Check if file already has PascalCase properties or is from server
    const hasPascalCase = propertyMappings.some(({ pascal }) => file[pascal] !== undefined);
    if (hasPascalCase || file.Id) {
        return file;
    }

    // Transform camelCase properties to PascalCase
    propertyMappings.forEach(({ camel, pascal, transform }) => {
        if (file[camel] !== undefined) {
            file[pascal] = transform ? transform(file[camel]) : file[camel];
        }
    });

    return file;
};

/**
 * Formats KB to human readable size
 * @param {number} kb - File size in kilobytes
 * @returns {string} - Formatted size
 */
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

/**
 * Converts bytes to kilobytes
 * @param {number} bytes - File size in bytes
 * @returns {number} - Size in KB (rounded to 2 decimal places)
 */
export const bytesToKB = (bytes) => {
    let sizeInKB = bytes / 1000;
    return sizeInKB;
};

/**
 * Formats files for record creation
 * When creating a record, only the Path is needed
 * @returns {Array} - Formatted array for create: [{ "Path": "..." }, ...]
 */
export const toCreateFormat = (files) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
        return null;
    }

    return files.map((file) => ({
        Path: file.path
    }));
};

/**
 * Formats files for record update
 * Existing files include Id + Path, new files only include Path
 * @param {Array} files - Array of file objects, some may have Id property
 * @returns {Array} - Formatted array for update: [{ "Id": 14, "Path": "..." }, { "Path": "..." }]
 */
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
