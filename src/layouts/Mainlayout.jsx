import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../component/header/Header';
import Carousel from '../component/homeElements/Carousel';
import Cardes from '../component/homeElements/Cardes';
import Testimonial from '../component/homeElements/Testimonial';

const Mainlayout = () => {
    return (
        <>
        <Header></Header>
        <Carousel></Carousel>
        <Cardes></Cardes>
        <Testimonial></Testimonial>
        <Outlet></Outlet>
        
        </>
    );
};

export default Mainlayout;