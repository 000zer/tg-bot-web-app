

import { useState, useEffect, useCallback } from 'react';
import './App.css'; 

const tg = (window as any).Telegram.WebApp;

function App() {


  const [inputValue, setInputValue] = useState('');
  const [buttons, setButtons] = useState<string[]>([]);

  // Функція для відправки даних боту
  const onSendData = useCallback(() => {
    if (buttons.length === 0) {
      tg.showAlert('Будь ласка, додайте хоча б одну кнопку.');
      return;
    }
    const data = {
      buttons: buttons,
    };
    tg.sendData(JSON.stringify(data));
  }, [buttons]);

  useEffect(() => {
    // Повідомляємо Telegram, що Web App готовий
    tg.ready();

    // Читаємо початкові дані з URL
    const urlParams = new URLSearchParams(window.location.search);
    const startParams = urlParams.get('start_params');

    if (startParams) {
      try {
        const initialData = JSON.parse(startParams);
        if (initialData.initialButtons && Array.isArray(initialData.initialButtons)) {
          setButtons(initialData.initialButtons);
        }
      } catch (e) { console.error("Failed to parse start_params", e); }
    }
  }, []);

  useEffect(() => {
    // Налаштовуємо головну кнопку Telegram
    if (buttons.length > 0) {
      tg.MainButton.setText(`Відправити ${buttons.length} кнопки`);
      tg.MainButton.show();
    } else {
      tg.MainButton.hide();
    }

    // Додаємо слухача події на головну кнопку
    tg.onEvent('mainButtonClicked', onSendData);

    // Прибираємо слухача при демонтажі компонента або зміні onSendData
    return () => {
      tg.offEvent('mainButtonClicked', onSendData);
    };
  }, [buttons, onSendData]);

  const handleAddButton = () => {
    if (inputValue.trim() !== '') {
      setButtons((prev) => [...prev, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveButton = (indexToRemove: number) => {
    setButtons((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="App">
      <h2>Редактор кнопок</h2>
      <p className="user-info">
        Привіт, {tg.initDataUnsafe?.user?.first_name || 'користувач'}!
        (ID: {tg.initDataUnsafe?.user?.id})
      </p>
      <div className="form">
        <input
          type="text"
          placeholder="Текст для кнопки"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleAddButton}>Додати</button>
      </div>
      <div className="button-list">
        {buttons.map((text, index) => (
          <div key={index} className="button-item">
            <span>{text}</span>
            <button onClick={() => handleRemoveButton(index)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
