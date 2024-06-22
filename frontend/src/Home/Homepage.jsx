import React, { useEffect, useState } from 'react';
import GameList from '../Component/GameList';

function Homepage() {

    return (
        <div className='p-6'>
            <h1 className='mb-4'>Store homepage</h1>

            <GameList />
        </div>
    );
}

export default Homepage;