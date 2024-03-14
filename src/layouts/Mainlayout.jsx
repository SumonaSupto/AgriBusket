import React from 'react';
import { Outlet } from 'react-router-dom';

const Mainlayout = () => {
    return (
        <>
        <Outlet></Outlet>
        </>
    );
};

export default Mainlayout;