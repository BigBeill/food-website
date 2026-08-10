import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles/inputs.module.scss';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ButtonInline } from './Button.components';
import useServiceState from '../hooks/useServiceState';
import { Ref, useImperativeHandle, useState } from 'react';
import { DataHandle } from '../shared.types';





/*
   In the event that you only want to let text be editable under specific conditions (edit mode enabled) you can supply readOnlyOptions,
   otherwise the component will always be in edit mode
*/
type InputTextParams = React.ComponentPropsWithoutRef<'input'> & {
   label: string;
   dataRef?: Ref<DataHandle<string>>
   readOnlyOptions?: {
      condition: boolean;
      placeholder: string;
   }
}

export function InputText({ label, dataRef, readOnlyOptions, ...rest }: InputTextParams) {
   const [value, setValue] = useState(String(rest.value) || '');

   useImperativeHandle(dataRef, () => ({
      getData: () => value,
      setData: setValue,
   }),[value]);

   return (
      <div className={ styles.inputTextWrapper }>
         { (readOnlyOptions?.condition === true) ? (<>
            <h4>{ label }</h4>
            <p>{ value || readOnlyOptions.placeholder }</p>
         </>) : (<>
            <label>{ label }</label>
            <input type='text' value={ value } onChange={ (event) => setValue(event.target.value) } { ...rest } />
         </>) }
      </div>
   )
}






interface InputTextAreaParams {
   label: string;
   placeholder: string;
   dataRef: Ref<DataHandle<string>>
   initial?: string;
   readOnly?: boolean;
   substitute?: string;
}

export function InputTextArea({ label, placeholder, dataRef, initial, readOnly, substitute }: InputTextAreaParams) {
   const [value, setValue] = useState<string>(initial || '');

   useImperativeHandle(dataRef, () => ({
      getData: () => value,
      setData: setValue
   }), [value]);

   return (
      <div className={ styles.inputTextAreaWrapper }>
         { readOnly ? (<>
            <h4>{ label }</h4>
            <p>{ value || substitute }</p>
         </>) : (<>
            <label>{ label }</label>
            <textarea value={ value } placeholder={ placeholder } onChange={ (event) => { setValue(event.target.value) } } />
         </>) }
      </div>
   );
}






interface InputTextWithInlineButtonParams<T> {
   label: string;
   placeholder: string
   buttonAction: (item: T) => void;
   fetcher: (value: string) => Promise<T[]>;
   renderListItem: (item: T, index: number) => React.ReactNode;
   onItemSelect?: (item: T, index: number) => void;
}

export function InputSearch<T>({ label, placeholder, buttonAction, fetcher, renderListItem, onItemSelect }: InputTextWithInlineButtonParams<T>) {

   const [ selectedItem, setSelectedItem ] = useState<T | null>(null);
   const [value, setValue] = useState<string>('');
   const listState = useServiceState<T[]>(() => {
      if(value.length >= 3) { return fetcher(value); } 
      else { return Promise.resolve([]); }
   }, []);

   function callButtonAction() {
      if ( selectedItem == null ) { return; }
      buttonAction(selectedItem);
   }

   function selectItem(item: T, index: number) {
      if (onItemSelect) { onItemSelect(item, index); }
      setSelectedItem(item)
   }
   
   return (
      <div className={ styles.inputText }>
         <div className={ `${ styles.activeSearchBar } ${ styles.bottom }` }>
            <label>{ label }</label>
            <input type='text' value={ value } placeholder={ placeholder } onChange={ (event) => setValue(event.target.value) } />
            { listState.status === 'ready' &&
               <ul>
                  { listState.data.map((item, index) => (
                     <li onClick={ () => selectItem(item, index) }>
                        { renderListItem(item, index) }
                     </li>
                  )) }
               </ul>
            }
         </div>
         <ButtonInline onClick={ () => callButtonAction() }>
            <FontAwesomeIcon icon={faCircleCheck} />
         </ButtonInline>
      </div>
   )
}