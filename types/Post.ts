export interface Post {
    id: string;
    title: string;
    content: string;
    postType: 'ZAMKNIĘCIE' | 'PROMOCJA' | 'OGŁOSZENIE' | 'NOWOŚĆ' | 'ZAJĘCIA' | 'WYDARZENIE';
    createdDate: string;
}