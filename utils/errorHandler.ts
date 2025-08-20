import { Alert } from "react-native";
import { ErrorResponse } from "@/types/ErrorResponse";

export const handleApiError = (error: any, title = 'Błąd') => {
    const errData = error?.response?.data as ErrorResponse;
    const message = errData?.message || error.message || 'Wystąpił nieoczekiwany błąd.';

    Alert.alert(
        title,
        message,
        [{ text: 'OK' }]
    );

    return message;
};