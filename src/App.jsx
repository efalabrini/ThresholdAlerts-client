import { useState } from 'react'
import './App.css'
import AlertServiceStatus from './components/AlertServiceStatus';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
            <AlertServiceStatus />
    </div>
  )
}

export default App
