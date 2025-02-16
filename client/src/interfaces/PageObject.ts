import { ReactNode } from 'react';

export default interface FolderObject {
   content: (...args: any[]) => ReactNode; // Function that has dynamic props
   props: { [key: string]: any }; // Json object with dynamic content
}