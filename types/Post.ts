export interface Post {
    id: string;
    content: string;
    imageUrl: string | null;
    videoUrl: string | null;
    facebookPostUrl: string | null;
    createdDate: string;
}