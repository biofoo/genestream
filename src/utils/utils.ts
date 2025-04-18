// src/types/utils.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type AsyncData<T> = {
    data: Optional<T>;
    isLoading: boolean;
    error: Optional<Error>;
};

export type WithMetadata<T> = T & {
    metadata: {
        created_at: string;
        updated_at: string;
    };
};