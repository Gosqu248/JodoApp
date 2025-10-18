import {privateApi} from '@/api/client';
import {UserInfo} from '@/types/UserInfo';
import {Buffer} from 'buffer';
import * as SecureStore from "expo-secure-store";
import {apiUrl} from '@/api/apiUrl';

export type UpdateUserInfoParams = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    birthDate: string;
    profileImageUri: string;
};

export const getUserInfo = async (): Promise<UserInfo> => {
    const {data} = await privateApi.get<UserInfo>('/users/info');
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
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('photo', {
        uri: uri,
        name: filename,
        type: type,
    } as any);

    try {
        const token = await SecureStore.getItemAsync('accessToken');

        const response = await fetch(`${apiUrl}/users/info`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch upload failed:', error);
        throw error;
    }
};

export const getUserPhoto = async (userId: string): Promise<string | null> => {
    try {
        const response = await privateApi.get(`/users/info/${userId}/photo`, {
            responseType: 'arraybuffer',
        });

        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'] || 'image/jpeg';

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error('getUserPhoto error:', error);
        return null;
    }
};

export const updateUserPhoto = async (photoUri: string): Promise<UserInfo> => {
    const filename = photoUri.split('/').pop()!;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('photo', {
        uri: photoUri,
        name: filename,
        type: type,
    } as any);

    try {
        const token = await SecureStore.getItemAsync('accessToken');

        const response = await fetch(`${apiUrl}/users/info/photo`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};
