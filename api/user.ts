import { privateApi } from '@/api/client';
import { UserInfo } from '@/types/UserInfo';
import { apiUrl } from '@/api/apiUrl';

export type UpdateUserInfoParams = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string;
    profileImageUri: string;
};

export const getUserInfo = async (): Promise<UserInfo> => {
    const { data } = await privateApi.get<UserInfo>('/users/info');
    return data;
};


export const updateUserInfo = async (params: UpdateUserInfoParams): Promise<UserInfo> => {
    const formData = new FormData();
    formData.append('firstName', params.firstName);
    formData.append('lastName', params.lastName);
    formData.append('birthDate', params.birthDate);
    formData.append('phoneNumber', params.phoneNumber);

    const uri = params.profileImageUri;
    const filename = uri.split('/').pop()!;
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('photo', {
        uri,
        name: filename,
        type: mimeType,
    } as any);

    const { data } = await privateApi.post<UserInfo>(
        '/users/info',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            },
            timeout: 30000
        }
    );

    return data;
};

export const getUserPhoto = async (userId: string): Promise<string | null> => {
    try {
        const photoUri = `${apiUrl}/users/info/${userId}/photo`;
        await privateApi.get(`/users/info/${userId}/photo`, { responseType: 'blob' });
        return photoUri;
    } catch (error) {
        console.error('Error loading photo:', error);
        return null;
    }
};