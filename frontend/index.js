import React from 'react';
import { render } from 'react-dom';
import './index.css';
import App from './src/App.jsx';
import { ThemeProvider } from './src/contexts/ThemeContext';

render(
    <ThemeProvider><App /></ThemeProvider>,
    document.getElementById('root')
)