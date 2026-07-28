import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles/inputs.module.scss';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ButtonInline } from './Button.components';
import useServiceState from '../hooks/useServiceState';
import { useState } from 'react';






interface InputTextParams {
   label: string;
   value: string;
   placeholder: string;
   onChange: (value: string) => void;
}

export function InputText({ label, value, placeholder, onChange }: InputTextParams) {
   return (
      <div className={ styles.inputTextWrapper }>
         <label>{ label }</label>
         <input type='text' value={ value } onChange={ (event) => onChange(event.target.value) } placeholder={ placeholder } />
      </div>
   )
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