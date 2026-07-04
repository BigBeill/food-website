// all service functions should return this to force idle handling and preventing slow reactions waiting for API responses

type ServiceState<T> =
   | { status: 'idle' }
   | { status: 'loading' }
   | { status: 'ready'; data: T }
   | { status: 'not-found' }
   | { status: 'error'; error: unknown };

type PaginatedListType<T> = {
   list: T[];
   count: number;
   groupNumber: number;
   groupSize: number;
};