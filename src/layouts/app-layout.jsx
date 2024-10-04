import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/header';

const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen"> {/* Set full height for the layout */}
      <Header />
      <main className='flex-grow container mx-auto'> {/* Ensure the main section expands */}
        <Outlet />
      </main>
      
    </div>
  );
};

export default AppLayout;
