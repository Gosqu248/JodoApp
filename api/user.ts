import { privateApi } from '@/api/client';
import { UserInfo } from '@/types/UserInfo';

export type UpdateUserInfoParams = {
    firstName: string;
    lastName: string;
    birthDate: string;
    profileImageUri: string;
};

export const getUserInfo = async (): Promise<UserInfo> => {
    const { data } = await privateApi.get<UserInfo>('/user/info');
    return data;
};


export const updateUserInfo = async (params: UpdateUserInfoParams): Promise<UserInfo> => {
    const formData = new FormData();
    formData.append('firstName', params.firstName);
    formData.append('lastName', params.lastName);
    formData.append('birthDate', params.birthDate);

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
        '/user/info',
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
