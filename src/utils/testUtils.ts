// src/utils/testUtils.ts
export const logResponse = (response: any) => {
    console.group('API Response');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Headers:', response.headers);
    console.groupEnd();
};

export const validateResponse = <T>(response: T, schema: any) => {
    try {
        schema.parse(response);
        return true;
    } catch (error) {
        console.error('Validation failed:', error);
        return false;
    }
};