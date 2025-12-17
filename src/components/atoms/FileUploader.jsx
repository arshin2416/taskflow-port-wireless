import { useState, useRef } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';
import { getApperClient } from '@/services/apperClient';
import { transformAndValidate, formatFileSize } from '@/utils/File';

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
        supportedExtensions: ''
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
                onError: (error) => {
                    console.error('upload error in callback', error);
                    callbacks.onError?.(error);
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

        // Transform and validate files before upload
        let transformedNewFiles = newFiles;
        if (fieldConfig) {
            // Combine existing files + new files for validation
            const totalFiles = [...files, ...newFiles];
            const validation = transformAndValidate(fieldConfig, totalFiles);
            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                return;
            }
            // Use only the transformed new files (last N files from transformedFiles)
            transformedNewFiles = validation.transformedFiles.slice(-newFiles.length);
        }

        // Create uploading file entries with progress tracking
        const uploadingEntries = transformedNewFiles.map((file, index) => ({
            id: `${Date.now()}-${index}`,
            file,
            progress: 0,
            status: 'uploading', // 'uploading', 'success', 'error'
            error: null,
            result: null
        }));

        setUploadingFiles((prev) => [...prev, ...uploadingEntries]);

        // Upload files in parallel
        const uploadPromises = uploadingEntries.map(async (entry) => {
            return new Promise((resolve) => {
                uploadFile(entry.file, {
                    onProgress: (progress) => {
                        // Update progress in real-time
                        setUploadingFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, progress } : f)));
                    },
                    onSuccess: (result) => {
                        // Mark as successful and store result
                        setUploadingFiles((prev) => prev.map((f) => (f.id === entry.id ? { ...f, status: 'success', result, progress: 100 } : f)));

                        // Return uploaded file info (using Pascal case)
                        resolve({
                            success: true,
                            fileInfo: {
                                Name: entry.file.Name || entry.file.name,
                                Size: entry.file.Size || (entry.file.size ? entry.file.size / 1024 : 0), // Size in KB
                                Type: entry.file.Type || entry.file.type,
                                uploadResult: result,
                                uploadedAt: new Date().toISOString()
                            }
                        });
                    },
                    onError: (error) => {
                        console.error('File upload failed:', error);

                        // Mark as failed
                        setUploadingFiles((prev) =>
                            prev.map((f) => (f.id === entry.id ? { ...f, status: 'error', error: error.message || 'Upload failed' } : f))
                        );

                        resolve({
                            success: false,
                            error: error.message || 'Upload failed'
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

        setTimeout(() => {
            setUploadingFiles((prev) =>
                prev.filter((f) => {
                    const isInCurrentBatch = uploadingEntries.some((e) => e.id === f.id);
                    // Only remove if it's in current batch AND status is success
                    if (isInCurrentBatch) {
                        return f.status === 'error'; // Keep if error, remove if success
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
                    accept={accept}
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
                    <h4 className="text-sm font-medium text-slate-700">Uploading:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {uploadingFiles.map((uploadEntry) => (
                            <div key={uploadEntry.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center flex-shrink-0">
                                        {uploadEntry.status === 'uploading' && (
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                                        )}
                                        {uploadEntry.status === 'success' && <ApperIcon name="Check" className="w-4 h-4 text-green-600" />}
                                        {uploadEntry.status === 'error' && <ApperIcon name="AlertCircle" className="w-4 h-4 text-red-600" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-700 truncate">{uploadEntry.file.Name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-slate-500">{formatFileSize(uploadEntry.file.Size)}</p>
                                            {uploadEntry.status === 'uploading' && <p className="text-xs text-blue-600">{uploadEntry.progress}%</p>}
                                        </div>
                                        {uploadEntry.status === 'error' && <p className="text-xs text-red-600">{uploadEntry.error}</p>}

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
                            </div>
                        ))}
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
                                        <p className="text-sm font-medium text-slate-700 truncate">{file.Name}</p>
                                        <p className="text-xs text-slate-500">{formatFileSize(file.Size)}</p>
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
