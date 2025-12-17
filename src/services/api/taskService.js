import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';
import { toCreateFormat, toUpdateFormat } from '@/utils/File';

class TaskService {
    constructor() {
        this.tableName = 'task_c';
        this.updateableFields = [
            'Name',
            'title_c',
            'description_c',
            'priority_c',
            'category_id_c',
            'due_date_c',
            'status_c',
            'completed_at_c',
            'files_c'
        ];
    }

    async delay() {
        return new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 200));
    }

    async getAll() {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return [];
            }

            const response = await apperClient.fetchRecords(this.tableName, {
                fields: [
                    { field: { Name: 'Id' } },
                    { field: { Name: 'Name' } },
                    { field: { Name: 'title_c' } },
                    { field: { Name: 'description_c' } },
                    { field: { Name: 'priority_c' } },
                    { field: { Name: 'category_id_c' } },
                    { field: { Name: 'due_date_c' } },
                    { field: { Name: 'status_c' } },
                    { field: { Name: 'completed_at_c' } },
                    { field: { Name: 'files_c' } },
                    { field: { Name: 'CreatedOn' } }
                ]
            });

            if (!response.success) {
                console.error('Failed to fetch tasks:', response);
                toast.error(response.message);
                return [];
            }

            return response.data || [];
        } catch (error) {
            console.error('Error fetching tasks:', error?.response?.data?.message || error);
            return [];
        }
    }

    async getById(id) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return null;
            }

            const response = await apperClient.getRecordById(this.tableName, parseInt(id), {
                fields: [
                    { field: { Name: 'Id' } },
                    { field: { Name: 'Name' } },
                    { field: { Name: 'title_c' } },
                    { field: { Name: 'description_c' } },
                    { field: { Name: 'priority_c' } },
                    { field: { Name: 'category_id_c' } },
                    { field: { Name: 'due_date_c' } },
                    { field: { Name: 'status_c' } },
                    { field: { Name: 'completed_at_c' } },
                    { field: { Name: 'files_c' } },
                    { field: { Name: 'CreatedOn' } }
                ]
            });

            if (!response.success) {
                console.error(`Failed to fetch task with Id: ${id}:`, response);
                toast.error(response.message);
                return null;
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
            return null;
        }
    }

    async getByCategory(categoryId) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return [];
            }

            const response = await apperClient.fetchRecords(this.tableName, {
                fields: [
                    { field: { Name: 'Id' } },
                    { field: { Name: 'Name' } },
                    { field: { Name: 'title_c' } },
                    { field: { Name: 'description_c' } },
                    { field: { Name: 'priority_c' } },
                    { field: { Name: 'category_id_c' } },
                    { field: { Name: 'due_date_c' } },
                    { field: { Name: 'status_c' } },
                    { field: { Name: 'completed_at_c' } },
                    { field: { Name: 'files_c' } },
                    { field: { Name: 'CreatedOn' } }
                ],
                where: [
                    {
                        FieldName: 'category_id_c',
                        Operator: 'EqualTo',
                        Values: [parseInt(categoryId)],
                        Include: true
                    }
                ]
            });

            if (!response.success) {
                console.error('Failed to fetch tasks by category:', response);
                return [];
            }

            return response.data || [];
        } catch (error) {
            console.error('Error fetching tasks by category:', error?.response?.data?.message || error);
            return [];
        }
    }

    async getByStatus(status) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return [];
            }

            const response = await apperClient.fetchRecords(this.tableName, {
                fields: [
                    { field: { Name: 'Id' } },
                    { field: { Name: 'Name' } },
                    { field: { Name: 'title_c' } },
                    { field: { Name: 'description_c' } },
                    { field: { Name: 'priority_c' } },
                    { field: { Name: 'category_id_c' } },
                    { field: { Name: 'due_date_c' } },
                    { field: { Name: 'status_c' } },
                    { field: { Name: 'completed_at_c' } },
                    { field: { Name: 'files_c' } },
                    { field: { Name: 'CreatedOn' } }
                ],
                where: [
                    {
                        FieldName: 'status_c',
                        Operator: 'EqualTo',
                        Values: [status],
                        Include: true
                    }
                ]
            });

            if (!response.success) {
                console.error('Failed to fetch tasks by status:', response);
                return [];
            }

            return response.data || [];
        } catch (error) {
            console.error('Error fetching tasks by status:', error?.response?.data?.message || error);
            return [];
        }
    }

    async getToday() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const apperClient = getApperClient();
            if (!apperClient) return [];

            const response = await apperClient.fetchRecords(this.tableName, {
                fields: [
                    { field: { Name: 'Id' } },
                    { field: { Name: 'Name' } },
                    { field: { Name: 'title_c' } },
                    { field: { Name: 'description_c' } },
                    { field: { Name: 'priority_c' } },
                    { field: { Name: 'category_id_c' } },
                    { field: { Name: 'due_date_c' } },
                    { field: { Name: 'status_c' } },
                    { field: { Name: 'completed_at_c' } },
                    { field: { Name: 'files_c' } },
                    { field: { Name: 'CreatedOn' } }
                ],
                whereGroups: [
                    {
                        operator: 'AND',
                        subGroups: [
                            {
                                conditions: [
                                    {
                                        fieldName: 'status_c',
                                        operator: 'EqualTo',
                                        values: ['active']
                                    },
                                    {
                                        fieldName: 'due_date_c',
                                        operator: 'EqualTo',
                                        values: [today]
                                    }
                                ],
                                operator: 'AND'
                            }
                        ]
                    }
                ]
            });

            if (!response.success) {
                console.error('Failed to fetch today tasks:', response);
                return [];
            }

            return response.data || [];
        } catch (error) {
            console.error('Error fetching today tasks:', error?.response?.data?.message || error);
            return [];
        }
    }

    async getUpcoming() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const apperClient = getApperClient();
            if (!apperClient) return [];

            const response = await apperClient.fetchRecords(this.tableName, {
                fields: [
                    { field: { Name: 'Id' } },
                    { field: { Name: 'Name' } },
                    { field: { Name: 'title_c' } },
                    { field: { Name: 'description_c' } },
                    { field: { Name: 'priority_c' } },
                    { field: { Name: 'category_id_c' } },
                    { field: { Name: 'due_date_c' } },
                    { field: { Name: 'status_c' } },
                    { field: { Name: 'completed_at_c' } },
                    { field: { Name: 'files_c' } },
                    { field: { Name: 'CreatedOn' } }
                ],
                whereGroups: [
                    {
                        operator: 'AND',
                        subGroups: [
                            {
                                conditions: [
                                    {
                                        fieldName: 'status_c',
                                        operator: 'EqualTo',
                                        values: ['active']
                                    },
                                    {
                                        fieldName: 'due_date_c',
                                        operator: 'GreaterThan',
                                        values: [today]
                                    }
                                ],
                                operator: 'AND'
                            }
                        ]
                    }
                ]
            });

            if (!response.success) {
                console.error('Failed to fetch upcoming tasks:', response);
                return [];
            }

            return response.data || [];
        } catch (error) {
            console.error('Error fetching upcoming tasks:', error?.response?.data?.message || error);
            return [];
        }
    }

    async create(taskData) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return null;
            }

            const recordData = {
                Name: taskData.title || taskData.title_c || '',
                title_c: taskData.title || taskData.title_c || '',
                description_c: taskData.description || taskData.description_c || '',
                priority_c: taskData.priority || taskData.priority_c || 'medium',
                // category_id_c: taskData.categoryId ? parseInt(taskData.categoryId) : (taskData.category_id_c ? parseInt(taskData.category_id_c) : null),
                category_id_c: 1,
                due_date_c: taskData.dueDate || taskData.due_date_c || '',
                status_c: 'active',
                completed_at_c: null,
                files_c: toCreateFormat(taskData.files)
            };

            // Remove empty fields
            Object.keys(recordData).forEach((key) => {
                if (recordData[key] === '' || recordData[key] === null || recordData[key] === undefined) {
                    delete recordData[key];
                }
            });

            const response = await apperClient.createRecord(this.tableName, {
                records: [recordData]
            });

            if (!response.success) {
                console.error('Failed to create task:', response);
                toast.error(response.message);
                return null;
            }

            if (response.results) {
                const successful = response.results.filter((r) => r.success);
                const failed = response.results.filter((r) => !r.success);

                if (failed.length > 0) {
                    console.error(`Failed to create ${failed.length} records:`, failed);
                    failed.forEach((record) => {
                        record.errors?.forEach((error) => toast.error(`${error.fieldLabel}: ${error}`));
                        if (record.message) toast.error(record.message);
                    });
                }
                return successful.length > 0 ? successful[0].data : null;
            }
        } catch (error) {
            console.error('Error creating task:', error?.response?.data?.message || error);
            return null;
        }
    }

    async update(id, taskData) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return null;
            }

            const recordData = {
                Id: parseInt(id)
            };

            // Map old field names to new ones
            if (taskData.title !== undefined) recordData.title_c = taskData.title;
            if (taskData.description !== undefined) recordData.description_c = taskData.description;
            if (taskData.priority !== undefined) recordData.priority_c = taskData.priority;
            if (taskData.files !== undefined) {
                recordData.files_c = toUpdateFormat(taskData.files);
            }
            if (taskData.categoryId !== undefined) recordData.category_id_c = parseInt(taskData.categoryId);
            if (taskData.dueDate !== undefined) recordData.due_date_c = taskData.dueDate;
            if (taskData.status !== undefined) {
                recordData.status_c = taskData.status;
                if (taskData.status === 'completed') {
                    recordData.completed_at_c = new Date().toISOString();
                } else if (taskData.status === 'active') {
                    recordData.completed_at_c = null;
                }
            }

            // Handle direct database field names
            if (taskData.title_c !== undefined) recordData.title_c = taskData.title_c;
            if (taskData.description_c !== undefined) recordData.description_c = taskData.description_c;
            if (taskData.priority_c !== undefined) recordData.priority_c = taskData.priority_c;
            if (taskData.category_id_c !== undefined) recordData.category_id_c = parseInt(taskData.category_id_c);
            if (taskData.due_date_c !== undefined) recordData.due_date_c = taskData.due_date_c;
            if (taskData.files_c !== undefined) recordData.files_c = toUpdateFormat(taskData.files_c);
            if (taskData.status_c !== undefined) recordData.status_c = taskData.status_c;
            if (taskData.completed_at_c !== undefined) recordData.completed_at_c = taskData.completed_at_c;

            // Update Name field with title for consistency
            if (recordData.title_c) recordData.Name = recordData.title_c;

            // Remove empty fields
            Object.keys(recordData).forEach((key) => {
                if (key !== 'Id' && (recordData[key] === '' || recordData[key] === undefined)) {
                    delete recordData[key];
                }
            });

            const response = await apperClient.updateRecord(this.tableName, {
                records: [recordData]
            });

            if (!response.success) {
                console.error('Failed to update task:', response);
                toast.error(response.message);
                return null;
            }

            if (response.results) {
                const successful = response.results.filter((r) => r.success);
                const failed = response.results.filter((r) => !r.success);

                if (failed.length > 0) {
                    console.error(`Failed to update ${failed.length} records:`, failed);
                    failed.forEach((record) => {
                        record.errors?.forEach((error) => toast.error(`${error.fieldLabel}: ${error}`));
                        if (record.message) toast.error(record.message);
                    });
                }
                return successful.length > 0 ? successful[0].data : null;
            }
        } catch (error) {
            console.error('Error updating task:', error?.response?.data?.message || error);
            return null;
        }
    }

    async delete(id) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return false;
            }

            const response = await apperClient.deleteRecord(this.tableName, {
                RecordIds: [parseInt(id)]
            });

            if (!response.success) {
                console.error('Failed to delete task:', response);
                toast.error(response.message);
                return false;
            }

            if (response.results) {
                const successful = response.results.filter((r) => r.success);
                const failed = response.results.filter((r) => !r.success);

                if (failed.length > 0) {
                    console.error(`Failed to delete ${failed.length} records:`, failed);
                    failed.forEach((record) => {
                        if (record.message) toast.error(record.message);
                    });
                }
                return successful.length > 0;
            }

            return true;
        } catch (error) {
            console.error('Error deleting task:', error?.response?.data?.message || error);
            return false;
        }
    }

    async search(query) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) return [];

            const response = await apperClient.fetchRecords(this.tableName, {
                fields: [
                    { field: { Name: 'Id' } },
                    { field: { Name: 'Name' } },
                    { field: { Name: 'title_c' } },
                    { field: { Name: 'description_c' } },
                    { field: { Name: 'priority_c' } },
                    { field: { Name: 'category_id_c' } },
                    { field: { Name: 'due_date_c' } },
                    { field: { Name: 'status_c' } },
                    { field: { Name: 'completed_at_c' } },
                    { field: { Name: 'files_c' } },
                    { field: { Name: 'CreatedOn' } }
                ],
                whereGroups: [
                    {
                        operator: 'OR',
                        subGroups: [
                            {
                                conditions: [
                                    {
                                        fieldName: 'title_c',
                                        operator: 'Contains',
                                        values: [query]
                                    },
                                    {
                                        fieldName: 'description_c',
                                        operator: 'Contains',
                                        values: [query]
                                    }
                                ],
                                operator: 'OR'
                            }
                        ]
                    }
                ]
            });

            if (!response.success) {
                console.error('Failed to search tasks:', response);
                return [];
            }

            return response.data || [];
        } catch (error) {
            console.error('Error searching tasks:', error?.response?.data?.message || error);
            return [];
        }
    }
}

export default new TaskService();
