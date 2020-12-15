import React from 'react';
import { ProblemStatement } from './components';
import styles from './App.module.css';

export const vscode = window.acquireVsCodeApi();


function App(){
    
    return(
        <div className={styles.app}>
            <ProblemStatement/>
        </div>
    )
}

export default App;