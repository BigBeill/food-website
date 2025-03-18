import { ReactNode } from 'react';

export default interface PageObject {
   content: (...args: any[]) => ReactNode; // Function that has dynamic props
   props: { [key: string]: any }; // Json object with dynamic content
}