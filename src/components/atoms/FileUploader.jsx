import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';
import { getApperClient } from '@/services/apperClient';
import { transformAndValidateFile, formatFileSize } from '@/utils/File';

const FileUploader = ({ value = [], onChange, accept, className, error, ...props }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState([]); // Track files being uploaded
    const [validationErrors, setValidationErrors] = useState([]);
    const fileInputRef = useRef(null);
    const fieldConfig = {
        id: 1321383,
        name: 'files_c',
        minValue: 1,
        maxValue: 5120,
        supportMultipleValues: true,
        supportedExtensions: ['.png']
    };

    const files = Array.isArray(value) ? value : [];

    // Upload file to Apper Storage
    const uploadFile = (file, callbacks = {}) => {
        console.log('&&uploadFile', file);

        const apperClient = getApperClient();
        if (!apperClient) {
            throw new Error('ApperClient not available');
        }

        return apperClient.storage.uploadFile(
            file,
            {
                canvasUniqueId: import.meta.env.VITE_APPER_PROJECT_ID,
                purpose: 'RecordAttachment'
            },
            {
                onProgress: (progress) => {
                    console.log('progress in callback', progress);
                    callbacks?.onProgress?.(progress);
                },
                onSuccess: (result) => {
                    console.log('upload success in callback', result);
                    callbacks.onSuccess?.(result);
                },
                onFailure: (failure) => {
                    console.error('upload error in callback', failure);
                    callbacks.onFailure?.(failure);
                }
            }
        );
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFileChange(droppedFiles);
    };

    const handleFileInputChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        handleFileChange(selectedFiles);
    };

    const handleFileChange = async (newFiles) => {
        if (newFiles.length === 0) return;

        // Clear previous validation errors
        setValidationErrors([]);

        // Check if multiple files are allowed
        if (!fieldConfig.supportMultipleValues && newFiles.length > 1) {
            toast.error('Only one file is allowed');
            return;
        }

        // Validate each file individually
        const validationResults = newFiles.map((file) => {
            const validation = transformAndValidateFile(fieldConfig, file);
            return {
                file: validation.transformedFile || file,
                isValid: validation.isValid,
                errors: validation.errors
            };
        });

        // Separate valid and invalid files
        const validFiles = validationResults.filter((result) => result.isValid);
        const invalidFiles = validationResults.filter((result) => !result.isValid);

        // Handle single file mode with validation error
        if (!fieldConfig.supportMultipleValues && invalidFiles.length > 0) {
            // Show toast error for single file mode
            invalidFiles[0].errors.forEach((error) => {
                toast.error(error);
            });
            return;
        }

        // Create entries for all files (valid will upload, invalid will show errors)
        const uploadingEntries = validationResults.map((result, index) => ({
            id: `${Date.now()}-${index}`,
            file: result.file,
            progress: 0,
            status: result.isValid ? 'uploading' : 'validation-error',
            error: result.isValid ? null : result.errors.join(', '),
            result: null
        }));

        setUploadingFiles((prev) => [...prev, ...uploadingEntries]);

        // Only upload valid files
        const validEntries = uploadingEntries.filter((entry) => entry.status === 'uploading');

        if (validEntries.length === 0) {
            // All files failed validation - keep them in the list to show errors
            return;
        }

        // Upload valid files in parallel
        const uploadPromises = validEntries.map(async (entry) => {
            return new Promise((resolve) => {
                uploadFile(entry.file, {
                    onProgress: (progress) => {
                        // Update progress in real-time
                        setUploadingFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, progress } : f)));
                    },
                    onSuccess: (result) => {
                        // Mark as successful and store result
                        setUploadingFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: 'success', result, progress: 100 } : f)));

                        // Return uploaded file info
                        resolve({
                            success: true,
                            fileInfo: {
                                name: entry.file.name || entry.file.Name,
                                size: entry.file.size || entry.file.Size, // Size in KB
                                type: entry.file.type || entry.file.Type,
                                path: result?.data?.key,
                                uploadedAt: new Date().toISOString()
                            }
                        });
                    },
                    onFailure: (failure) => {
                        console.error('File upload failed:', failure);

                        // Mark as failed
                        setUploadingFiles((prev) =>
                            prev.map((f) => (f.id === entry.id ? { ...f, status: 'error', error: failure.message || 'Upload failed' } : f))
                        );

                        resolve({
                            success: false,
                            error: failure.message || 'Upload failed'
                        });
                    }
                }).catch((error) => {
                    // Fallback error handler in case promise is rejected
                    console.error('File upload failed (promise rejected):', error);

                    setUploadingFiles((prev) =>
                        prev.map((f) => (f.id === entry.id ? { ...f, status: 'error', error: error.message || 'Upload failed' } : f))
                    );

                    resolve({
                        success: false,
                        error: error.message || 'Upload failed'
                    });
                });
            });
        });

        // Wait for all uploads to complete
        const results = await Promise.allSettled(uploadPromises);

        // Collect successfully uploaded files
        const uploadedFiles = results
            .filter((result) => result.status === 'fulfilled' && result.value.success)
            .map((result) => result.value.fileInfo);

        // Update form with all successfully uploaded files at once
        if (uploadedFiles.length > 0) {
            if (fieldConfig.supportMultipleValues) {
                onChange?.([...files, ...uploadedFiles]);
            } else {
                onChange?.([uploadedFiles[uploadedFiles.length - 1]]);
            }
        }

        // Remove successful uploads after delay, keep validation errors and upload errors
        setTimeout(() => {
            setUploadingFiles((prev) =>
                prev.filter((f) => {
                    const isInCurrentBatch = uploadingEntries.some((e) => e.id === f.id);
                    // Only remove if it's in current batch AND status is success
                    if (isInCurrentBatch) {
                        return f.status !== 'success'; // Keep errors, remove success
                    }
                    return true; // Keep files from other batches
                })
            );
        }, 1000);
    };

    const removeFile = (indexToRemove) => {
        const updatedFiles = files.filter((_, index) => index !== indexToRemove);
        onChange?.(updatedFiles);
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Upload Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
                    isDragOver ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-slate-400',
                    error && 'border-red-300',
                    'group'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={fieldConfig.supportMultipleValues}
                    accept={fieldConfig.supportedExtensions}
                    onChange={handleFileInputChange}
                    className="hidden"
                    {...props}
                />

                <div className="flex flex-col items-center gap-2">
                    <div
                        className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                            isDragOver ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        )}
                    >
                        <ApperIcon name="Upload" className="w-6 h-6" />
                    </div>

                    <div>
                        <p className="text-sm font-medium text-slate-700">{isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {fieldConfig.supportMultipleValues ? 'Multiple files supported' : 'Single file only'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Messages */}
            {(error || validationErrors.length > 0) && (
                <div className="space-y-1">
                    {error && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <ApperIcon name="AlertCircle" className="w-4 h-4" />
                            {error}
                        </p>
                    )}
                    {validationErrors.map((err, idx) => (
                        <p key={idx} className="text-sm text-red-600 flex items-center gap-1">
                            <ApperIcon name="AlertCircle" className="w-4 h-4" />
                            {err}
                        </p>
                    ))}
                </div>
            )}

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700">
                        {uploadingFiles.some((f) => f.status === 'uploading')
                            ? 'Uploading:'
                            : uploadingFiles.some((f) => f.status === 'validation-error' || f.status === 'error')
                              ? 'Upload Failed'
                              : 'Upload Status:'}
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {uploadingFiles.map((uploadEntry) => {
                            const isValidationError = uploadEntry.status === 'validation-error';
                            const isUploadError = uploadEntry.status === 'error';
                            const isError = isValidationError || isUploadError;

                            return (
                                <div
                                    key={uploadEntry.id}
                                    className={cn(
                                        'flex items-center justify-between p-3 rounded-lg border',
                                        isError ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div
                                            className={cn(
                                                'w-8 h-8 rounded flex items-center justify-center flex-shrink-0',
                                                isError ? 'bg-red-200' : 'bg-blue-200'
                                            )}
                                        >
                                            {uploadEntry.status === 'uploading' && (
                                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                                            )}
                                            {uploadEntry.status === 'success' && <ApperIcon name="Check" className="w-4 h-4 text-green-600" />}
                                            {isError && <ApperIcon name="AlertCircle" className="w-4 h-4 text-red-600" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-700 truncate">{uploadEntry.file.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-slate-500">{formatFileSize(uploadEntry.file.size)}</p>
                                                {uploadEntry.status === 'uploading' && (
                                                    <p className="text-xs text-blue-600">{uploadEntry.progress}%</p>
                                                )}
                                            </div>
                                            {uploadEntry.error && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    {isValidationError ? 'Validation Error: ' : 'Upload Error: '}
                                                    {uploadEntry.error}
                                                </p>
                                            )}

                                            {uploadEntry.status === 'uploading' && (
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${uploadEntry.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {isError && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadEntry.id));
                                            }}
                                            className="flex-shrink-0 ml-2 text-slate-400 hover:text-red-600"
                                        >
                                            <ApperIcon name="X" className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Uploaded Files */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700">Uploaded Files:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 rounded bg-green-200 flex items-center justify-center flex-shrink-0">
                                        <ApperIcon name="Check" className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="flex-shrink-0 ml-2 text-slate-400 hover:text-red-600"
                                >
                                    <ApperIcon name="X" className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
