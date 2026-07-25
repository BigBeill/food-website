export interface ChildFormContent<T> {
   getContent: () => T;
   setContent?: (newList: T) => void;
};

// all service functions should return this to force idle handling and preventing slow reactions waiting for API responses
export type ServiceStateType<T> =
   | { status: 'idle' }
   | { status: 'loading' }
   | { status: 'ready'; data: T }
   | { status: 'not-found' }
   | { status: 'error'; error: Error };

export type PaginatedListType<T> = {
   list: T[];
   count: number;
   groupNumber: number;
   groupSize: number;
};