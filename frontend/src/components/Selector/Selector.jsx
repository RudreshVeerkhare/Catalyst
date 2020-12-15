import React, { useRef } from 'react';
import CompilerOptions from './CompilerOptions';
import './Selector.css';


const Selector = ({language, setSubmitSelect, onSubmit}) => {

    const selectRef = useRef();


    const divHandleClick = (e) => {
        if (e.target.classList.contains('backdrop')){
            setSubmitSelect(false);
        }
    }

    const submitClickHandler = e => {
        if(!selectRef) return;
        setSubmitSelect(false);
        onSubmit(selectRef.current.value);
    }

    return(
        <div className="backdrop" onClick={divHandleClick}>
            <div className="selector-wrap">
                <div className="selector">
                    <span className="field-name">Language: </span>
                    <select ref={selectRef}>
                        {CompilerOptions[language].map((item, index) => {
                            return <option key={index} value={item.value}>{item.text}</option>
                        })}
                    </select>
                </div>
                <button className="selector-submit" onClick={submitClickHandler}>Submit</button>
            </div>
        </div>
    );
}

export default Selector;

