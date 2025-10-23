// import { useState } from 'react'
import {useEffect } from 'react';
import './App.css'
const tg=(window as any).Telegram.WebApp;
function App() {
  // const [count, setCount] = useState(0)
useEffect(()=>{
  tg.ready();
},[])
  const onClose=()=>{
  tg.close();
}
  return (
    <>
      <div>
        hay there! this is a telegram web app
        <button onClick={onClose}>X</button>
      </div>
    </>
  )
}

export default App
