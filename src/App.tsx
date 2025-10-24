

import { useState, useEffect, useCallback } from 'react';
import './App.css'; 

const tg = (window as any).Telegram.WebApp;
const baseUrl = 'https://68fab9d8ef8b2e621e80b43e.mockapi.io/users'; // Змініть на вашого бота

function App() {
// Визначимо тип для наших кнопок
type Button = {
  id: string;
  buttonIndex: string;
  message: string;
};



const [inputText, setInputText] = useState('');
// Змінюємо стан для зберігання масиву об'єктів кнопок
const [buttons, setButtons] = useState<Button[]>([]);
// Стан для відстеження редагованої кнопки та її нового тексту
const [editingId, setEditingId] = useState<string | null>(null);
const [editingText, setEditingText] = useState('');


  // Функція для відправки даних боту
  const onSendData = useCallback(() => {
    if (buttons.length === 0) {
      tg.showAlert('Будь ласка, додайте хоча б одну кнопку.');
      return;
    }
    const data = {
      buttons: buttons.map(b => `${b.buttonIndex} - ${b.message}`),
    };
    tg.sendData(JSON.stringify(data));
  }, [buttons]);

  useEffect(() => {
    // Повідомляємо Telegram, що Web App готовий
    tg.ready();

    // Завантажуємо існуючі кнопки з API при відкритті
    const fetchButtons = async () => {
      try {
        const response = await fetch(baseUrl);
        if (!response.ok) throw new Error('Не вдалося завантажити кнопки');
        const data: Button[] = await response.json();
        setButtons(data);
      } catch (error) {
        console.error(error);
        tg.showAlert('Помилка при завантаженні списку кнопок.');
      }
    };


    fetchButtons();
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
    const text = inputText.trim();
    const number = (buttons.length + 1).toString(); // Простий спосіб нумерації

    if (number !== '' && text !== '') {
      try {
        // 1. Відправляємо дані на ваш API
        const response = await fetch(baseUrl, { // Використовуємо оновлений baseUrl
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ buttonIndex: number, message: text }),
        });

        if (!response.ok) {
          throw new Error('Помилка мережі або сервера');
        }

        const newButton: Button = await response.json();

        // 2. Якщо дані успішно відправлено, оновлюємо стан у додатку
        setButtons((prev) => [...prev, newButton]);
        setInputText('');
      } catch (error) {
        console.error('Не вдалося додати кнопку:', error);
        tg.showAlert('Сталася помилка при збереженні кнопки. Спробуйте ще раз.');
      }
    }
  };
  const handleRemoveButton = async (idToRemove: string) => {
    try {
      const response = await fetch(`${baseUrl}/${idToRemove}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Помилка при видаленні на сервері');
      }

      // Якщо на сервері видалено успішно, оновлюємо локальний стан
      setButtons((prev) => prev.filter((button) => button.id !== idToRemove));
    } catch (error) {
      console.error('Не вдалося видалити кнопку:', error);
      tg.showAlert('Сталася помилка при видаленні кнопки.');
    }
  };
  
  // Функція для початку редагування
  const handleEdit = (button: Button) => {
    setEditingId(button.id);
    setEditingText(button.message);
  };

  // Функція для скасування редагування
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // Функція для збереження змін
  const handleSaveEdit = async (buttonToUpdate: Button) => {
    try {
      const response = await fetch(`${baseUrl}/${buttonToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buttonToUpdate, message: editingText }),
      });

      if (!response.ok) throw new Error('Помилка при оновленні');

      // Оновлюємо локальний стан
      setButtons(buttons.map(b => 
        b.id === buttonToUpdate.id ? { ...b, message: editingText } : b
      ));

      // Виходимо з режиму редагування
      handleCancelEdit();
    } catch (error) {
      console.error('Не вдалося зберегти зміни:', error);
      tg.showAlert('Не вдалося зберегти зміни.');
    }
  };

  return (
    <div className="App">
      <h2>Редактор кнопок</h2>
      <p className="user-info">
        Привіт, {tg.initDataUnsafe?.user?.first_name || 'користувач'}!
      </p>
      <div className="form">
      
        <input className='buttonsText'
          type="text"
          placeholder="Текст для кнопки"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        
        <button onClick={handleAddButton}>Додати</button>
      </div>
      <div className="button-list">
        {buttons.map((button) => (
          <div key={button.id} className="button-item">
            {editingId === button.id ? (
              // --- Режим редагування ---
              <>
                <input 
                  type="text" 
                  value={editingText} 
                  onChange={(e) => setEditingText(e.target.value)} 
                  className="edit-input"
                />
                <button onClick={() => handleSaveEdit(button)} className="save-btn">✓</button>
                <button onClick={handleCancelEdit} className="cancel-btn">×</button>
              </>
            ) : (
              // --- Режим перегляду ---
              <>
                <span>{`${button.buttonIndex} - ${button.message}`}</span>
                <div>
                  <button onClick={() => handleEdit(button)} className="edit-btn">✎</button>
                  <button onClick={() => handleRemoveButton(button.id)} className="delete-btn">×</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;
