import React, { useState } from 'react'
import './TestButton.css'

const TestButton = () => {
    const [ count, setCount ] = useState(0)
    console.log('count: ', count)
    return (
        <div className='test-button-container'>
            <button onClick={() => setCount(count + 1)}>
                Click Me
            </button>
        </div>
    )
}

export default TestButton