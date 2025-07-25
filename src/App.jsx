
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/Routes.jsx';

import { CartProvider } from './contexts/cartReducer';
import './App.css';
import { Provider } from 'react-redux';
import store from './stores/index';
import LoadingComponent from './pages/component/LoadingComponent';


function App() {
  return (
    
    <Provider store={store}>
      <CartProvider>
        <LoadingComponent />
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
    </CartProvider>
    </Provider>
  );
}

export default App;