import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class CategoryService {
    constructor() {
        this.tableName = 'category_c';
        this.updateableFields = ['Name', 'icon_c', 'color_c', 'order_c'];
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
                    { field: { Name: 'icon_c' } },
                    { field: { Name: 'color_c' } },
                    { field: { Name: 'order_c' } }
                ],
                orderBy: [
                    {
                        fieldName: 'order_c',
                        sorttype: 'ASC'
                    }
                ]
            });

            if (!response.success) {
                console.error('Failed to fetch categories:', response);
                toast.error(response.message);
                return [];
            }

            return response.data || [];
        } catch (error) {
            console.error('Error fetching categories:', error?.response?.data?.message || error);
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
                    { field: { Name: 'icon_c' } },
                    { field: { Name: 'color_c' } },
                    { field: { Name: 'order_c' } }
                ]
            });

            if (!response.success) {
                console.error(`Failed to fetch category with Id: ${id}:`, response);
                toast.error(response.message);
                return null;
            }

            return response.data;
        } catch (error) {
            console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
            return null;
        }
    }

    async create(categoryData) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return null;
            }

            const recordData = {
                Name: categoryData.name || categoryData.Name || '',
                icon_c: categoryData.icon || categoryData.icon_c || 'Folder',
                color_c: categoryData.color || categoryData.color_c || '#6366f1',
                order_c: categoryData.order || categoryData.order_c || 1
            };

            const response = await apperClient.createRecord(this.tableName, {
                records: [recordData]
            });

            if (!response.success) {
                console.error('Failed to create category:', response);
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
            console.error('Error creating category:', error?.response?.data?.message || error);
            return null;
        }
    }

    async update(id, categoryData) {
        try {
            const apperClient = getApperClient();
            if (!apperClient) {
                console.error('Failed to get ApperClient instance');
                return null;
            }

            const recordData = {
                Id: parseInt(id),
                Name: categoryData.name || categoryData.Name,
                icon_c: categoryData.icon || categoryData.icon_c,
                color_c: categoryData.color || categoryData.color_c,
                order_c: categoryData.order || categoryData.order_c
            };

            // Remove undefined fields
            Object.keys(recordData).forEach((key) => {
                if (recordData[key] === undefined) {
                    delete recordData[key];
                }
            });

            const response = await apperClient.updateRecord(this.tableName, {
                records: [recordData]
            });

            if (!response.success) {
                console.error('Failed to update category:', response);
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
            console.error('Error updating category:', error?.response?.data?.message || error);
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
                console.error('Failed to delete category:', response);
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
            console.error('Error deleting category:', error?.response?.data?.message || error);
            return false;
        }
    }
}

export default new CategoryService();
