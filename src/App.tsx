import { AppBar, Container, Typography  } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, useEffect, useCallback } from 'react';
import './App.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import SvgIcon from '@mui/material/SvgIcon';

const tg = (window as any).Telegram.WebApp;
const baseUrl = 'https://68fab9d8ef8b2e621e80b43e.mockapi.io/users'; // Змініть на вашого бота
const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
  },
  appBar: {
    // minWidth: '100vw',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 0',
    margin: '0',
  },
  buttonList: {
    marginTop: '20px',
    width: '100%',
  },
  buttonItem: {
    display: 'flex',
    // justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '8px',
    margin: '0px 10px 10px',
    minHeight: '40px', boxShadow: 'none',

    padding: '6px 12px',
    border: '1px solid',
    backgroundColor: '#0063cc',
    borderColor: '#0063cc',
    '&:hover': {
      backgroundColor: '#0069d9',
      borderColor: '#0062cc',
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: '#0062cc',
      borderColor: '#005cbf',
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
    },
  },
  buttonText: {
    textTransform: 'none',
    fontSize: 24,
    fontWeight: 400,
paddingLeft: 16,
    lineHeight: 1.5,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  buttonsContainer: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '8px',
  },
  btn: {
    borderRadius:'50%',
    border: 'none',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',

  },
  main: {

    // marginTop: `${theme.spacing(8)}px`,
  },
}));
function App() {
  const classes = useStyles();
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
  // Стан для видимості форми додавання
  const [isFormVisible, setFormVisible] = useState(false);


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

    // Режим переходу до форми додавання
    tg.MainButton.setText('Додати кнопку');
    tg.MainButton.show();
    tg.MainButton.onClick(() => setFormVisible(true));

    // Прибираємо слухача при демонтажі компонента або зміні onSendData
    return () => {
      // Важливо очистити обробник, щоб уникнути виклику старої функції
      tg.MainButton.offClick(onSendData);
      tg.MainButton.offClick(() => setFormVisible(true));
    };
  }, [buttons, onSendData, isFormVisible]);


  const handleAddButton = async () => {
    const text = inputText.trim();
    let number = (buttons.length + 1).toString(); // Простий спосіб нумерації

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
        // Ховаємо форму після успішного додавання
        setFormVisible(false);
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
    <>
      <AppBar position='static' className={classes.appBar}>
        <Container className={classes.header}>
          <Typography variant="h4">Редактор кнопок</Typography>
          <Typography variant='h6'>Привіт, {tg.initDataUnsafe?.user?.first_name || 'користувач'}!</Typography>
        </Container>
      </AppBar>
      <main className={classes.main}>
        <div>
          {isFormVisible && (
            <div className="form">
              <input
                className="buttonsText"
                type="text"
                placeholder="Текст для кнопки"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <button onClick={handleAddButton}>Зберегти</button>
              <button onClick={() => setFormVisible(false)} className="cancel-btn">
                Скасувати
              </button>
            </div>
          )}
          <div className={classes.buttonList}>
            {buttons.map((button) => (
              <div key={button.id} className={classes.buttonItem}>
                {editingId === button.id ? (
                  // --- Режим редагування ---
                  <>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="edit-input"
                    />
                    <div className={classes.buttonsContainer}>
                    <button onClick={() => handleSaveEdit(button)} className={classes.btn}><SvgIcon component={DoneIcon} inheritViewBox /></button>
                    <button onClick={handleCancelEdit} className={classes.btn}><SvgIcon component={CancelIcon} inheritViewBox /></button>
                    </div>
                  </>

                ) : (
                  // --- Режим перегляду ---
                  <>
                    <span className={classes.buttonText}>{`${button.message}`}</span>
                    <div className={classes.buttonsContainer}>
                      <button onClick={() => handleEdit(button)} className={classes.btn}><SvgIcon component={EditIcon} inheritViewBox /></button>
                      <button onClick={() => handleRemoveButton(button.id)} className={classes.btn}><SvgIcon component={DeleteIcon} inheritViewBox /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
export default App;
