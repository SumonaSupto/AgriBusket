import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../component/header/Header';
import Carousel from '../component/homeElements/Carousel';
import Cardes from '../component/homeElements/Cardes';
import Testimonial from '../component/homeElements/Testimonial';
import Footer from '../component/homeElements/Footer';

const Mainlayout = () => {
    return (
        <>
        <Header></Header>
        <Carousel></Carousel>
        <Cardes></Cardes>
        <Testimonial></Testimonial>
        <Outlet></Outlet>
        <Footer></Footer>
        
        </>
    );
};

export default Mainlayout;