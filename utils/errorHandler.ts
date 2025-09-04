import { Alert } from "react-native";
import { ErrorResponse } from "@/types/ErrorResponse";

/**
 * Handles API errors by showing a user-friendly alert message.
 * @param error - The error object, typically from an Axios catch block.
 * @param title - Optional custom title for the alert. Defaults to 'Error'.
 * @returns The extracted error message string.
 */
export const handleApiError = (error: any, title = 'Błąd'): string => {
    const message = getErrorMessage(error);

    Alert.alert(
        title,
        message,
        [{ text: 'OK' }]
    );

    return message;
};

/**
 * Extracts a user-friendly error message from an API error object.
 * It prioritizes a structured message from the API response body.
 * @param error - The error object, typically from an Axios catch block.
 * @returns The extracted error message string.
 */
export const getErrorMessage = (error: any): string => {
    const errData = error?.response?.data as ErrorResponse;
    return errData?.message || error.message || 'Wystąpił nieoczekiwany błąd.';
};
