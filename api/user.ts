import {privateApi} from '@/api/client';
import {UserInfo} from '@/types/UserInfo';
import { Buffer } from 'buffer';

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
        const response = await privateApi.get(`/users/info/${userId}/photo`, {
            responseType: 'arraybuffer',
        });

        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';

        return `data:${mimeType};base64,${base64}`;
};

export const updateUserPhoto = async (photoUri: string): Promise<UserInfo> => {
    const filename = photoUri.split('/').pop()!;
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('photo', {
        uri: photoUri,
        name: filename,
        type: mimeType,
    } as any);

        const { data } = await privateApi.patch<UserInfo>(
            '/users/info/photo',
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