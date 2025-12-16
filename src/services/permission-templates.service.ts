import { api } from '@/lib/api';

export interface PermissionTemplate {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    isSystem: boolean;
}

export const permissionTemplatesService = {
    async getAll(): Promise<PermissionTemplate[]> {
        const response = await api.get('/permission-templates');
        return response.data;
    },

    async evaluate(id: number): Promise<number[]> {
        const response = await api.post(`/permission-templates/${id}/evaluate`);
        return response.data;
    }
};
