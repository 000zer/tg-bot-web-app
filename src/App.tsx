// import { useState } from 'react'
import {useEffect } from 'react';
import './App.css'
const tg=(window as any).Telegram.WebApp;
function App() {
  // const [count, setCount] = useState(0)
useEffect(()=>{
  tg.ready();
},[])
  
  
  // Налаштування головної кнопки
  tg.MainButton.text = "Відправити";
  tg.MainButton.color = "#2481cc";
  tg.MainButton.textColor = "#ffffff";
  tg.MainButton.show();
  
  // Обробка натискання
  tg.MainButton.onClick(() => {
    // Ваш код
    tg.sendData(JSON.stringify({ action: 'submit' }));
  });
  
  // Показ індикатора завантаження
  tg.MainButton.showProgress();
  
  // Приховування індикатора
  tg.MainButton.hideProgress();
  
  // Вимкнення кнопки
  tg.MainButton.disable();
  
  // Приховування кнопки
  tg.MainButton.hide();
  // Показати кнопку назад
  tg.BackButton.show();
  
  // Обробка натискання
  tg.BackButton.onClick(() => {
    // Повернутися на попередню сторінку
    window.history.back();
  });
  
  // Приховати кнопку
  tg.BackButton.hide();
  // Показати кнопку налаштувань
  tg.SettingsButton.show();
  
  // Обробка натискання
  tg.SettingsButton.onClick(() => {
    // Відкрити налаштування
    console.log('Settings clicked');
  });
  
  // Приховати
  tg.SettingsButton.hide();
  tg.expand();
  
  // Налаштувати MainButton
  tg.MainButton.text = "Готово";
  tg.MainButton.show();
  
  tg.MainButton.onClick(() => {
    // Відправити дані боту
    tg.sendData(JSON.stringify({
      message: "Користувач натиснув кнопку"
    }));
  });
  
  // Показати BackButton
  tg.BackButton.show();
  tg.BackButton.onClick(() => {
    tg.close();
  });
  
  // Обробка звичайної кнопки
  // document.getElementById('myButton').addEventListener('click', () => {
  //   tg.showAlert('Привіт з Web App!');
  // });
  return (
    <>
      <div>
        {/* hay there! this is a telegram web app
        <button onClick={onClose}>X</button> */}
      </div>
    </>
  )
}

export default App
