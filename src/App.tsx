
import { useEffect } from 'react';
import './App.css';

const tg = (window as any).Telegram.WebApp;

function App() {
  // const [count, setCount] = useState(0)

  useEffect(() => {
    // Повідомляємо Telegram, що Web App готовий
    tg.ready();

    // Налаштовуємо головну кнопку
    tg.MainButton.setText('Відправити дані');
    tg.MainButton.show();

    // Функція, яка буде викликана при натисканні на головну кнопку
    const onMainButtonClick = () => {
      const data = {
        message: 'Привіт з Web App!',
        timestamp: new Date().toISOString(),
      };
      // Відправляємо дані боту
      tg.sendData(JSON.stringify(data));
    };

    // Додаємо слухача події
    tg.MainButton.onClick(onMainButtonClick);

    // Прибираємо слухача при демонтажі компонента
    return () => {
      tg.MainButton.offClick(onMainButtonClick);
    };
  }, []);

  return (
    <>
      <div>Привіт! Це веб-додаток Telegram. Натисніть кнопку внизу.</div>
    </>
  );
}

export default App;
