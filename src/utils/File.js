/**
 * Transforms file objects to Pascal case and validates them against field configuration
 * @param {File[]} files - Array of files to transform and validate
 * @param {Object} config - Field configuration
 * @returns {Object} - { isValid: boolean, errors: string[], transformedFiles: Array }
 */
export const transformAndValidate = (config, files) => {
    const errors = [];
    const fileArray = Array.isArray(files) ? files : [files];

    // If no files and not required, it's valid
    if (fileArray.length === 0) {
        return { isValid: true, errors: [], transformedFiles: [] };
    }

    // Check multiple files
    if (!config?.supportMultipleValues && fileArray.length > 1) {
        errors.push('Only one file is allowed');
    }

    // Transform and validate each file
    const transformedFiles = fileArray.map((file, index) => {
        // Transform file to Pascal case
        const transformedFile = transformFileToPascalCase(file);

        const fileSize = transformedFile.Size;
        const fileNum = fileArray.length > 1 ? `File ${index + 1}: ` : '';

        // Check extension (empty string or empty array means all types supported)
        const extensions = config?.supportedExtensions;
        const hasExtensionRestriction = extensions && extensions !== '' && Array.isArray(extensions) && extensions.length > 0;

        if (hasExtensionRestriction) {
            const ext = transformedFile.Name ? transformedFile.Name.split('.').pop().toLowerCase() : '';
            if (!extensions.some((e) => e.toLowerCase() === ext)) {
                errors.push(`${fileNum}Invalid file type. Allowed: ${extensions.join(', ')}`);
            }
        }

        // Check minimum size (fileSize and config values are in KB)
        if (config?.minValue && fileSize < config.minValue) {
            errors.push(`${fileNum}File too small. Minimum: ${formatFileSize(config.minValue)}`);
        }

        // Check maximum size (fileSize and config values are in KB)
        if (config?.maxValue && fileSize > config.maxValue) {
            errors.push(`${fileNum}File too large. Maximum: ${formatFileSize(config.maxValue)}`);
        }

        return transformedFile;
    });

    return { isValid: errors.length === 0, errors, transformedFiles };
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
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(kb) / Math.log(k));
    return Math.round((kb / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
        Path: file.Path
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
            Path: file.Path
        };

        // If file has an Id, it's an existing file - include the Id
        if (file.Id) {
            formatted.Id = file.Id;
        }

        return formatted;
    });
};
