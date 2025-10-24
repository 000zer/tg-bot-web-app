

import { useState, useEffect, useCallback } from 'react';
import './App.css'; 

const tg = (window as any).Telegram.WebApp;
const baseUrl = 'https://68fab9d8ef8b2e621e80b43e.mockapi.io/'; // Змініть на вашого бота
function App() {


const [inputText, setInputText] = useState('');
const [inputNumber, setInputNumber] = useState('');
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


  const handleAddButton = async () => {
    const number = inputNumber.trim();
    const text = inputText.trim();

    if (number !== '' && text !== '') {
      try {
        // 1. Відправляємо дані на ваш API
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ buttonNumber: number, message: text }),
        });

        if (!response.ok) {
          throw new Error('Помилка мережі або сервера');
        }

        // 2. Якщо дані успішно відправлено, оновлюємо стан у додатку
        setButtons((prev) => [...prev, `${number} - ${text}`]);
        setInputNumber('');
        setInputText('');
      } catch (error) {
        console.error('Не вдалося додати кнопку:', error);
        tg.showAlert('Сталася помилка при збереженні кнопки. Спробуйте ще раз.');
      }
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
        <input className='buttonsNumber'
          type="number"
          placeholder="Номер кнопки"
          value={inputNumber}
          onChange={(e) => setInputNumber(e.target.value)}
        />

        <input className='buttonsText'
          type="text"
          placeholder="Текст для кнопки"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
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
