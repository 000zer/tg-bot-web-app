import { AppBar, Container, TextField, Typography, Button, Box, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Stack } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import './App.css'; // Залишаємо, якщо є глобальні стилі або стилі, не покриті MUI
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
// import SvgIcon from '@mui/material/SvgIcon';

// Імпортуємо функції для роботи з API та тип Button
import { getButtons, addButton, deleteButton, updateButton} from './api';
import { type Button as ApiButtonType } from './api'; // Перейменовуємо тип, щоб уникнути конфлікту з MUI Button

const tg = (window as any).Telegram.WebApp;
function App() {
  const [inputText, setInputText] = useState('');
  const [inputName, setInputName] = useState('');
  // Змінюємо стан для зберігання масиву об'єктів кнопок
  const [buttons, setButtons] = useState<ApiButtonType[]>([]); // Використовуємо перейменований тип
  // Стан для відстеження редагованої кнопки та її нового тексту
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingText, setEditingText] = useState('');
  // Стан для видимості форми додавання
  const [isFormVisible, setFormVisible] = useState(false);


  useEffect(() => {
    // Повідомляємо Telegram, що Web App готовий
    tg.ready();

    // Завантажуємо існуючі кнопки з API при відкритті
    const fetchButtons = async () => {
      try {
        const data = await getButtons(); // Використовуємо функцію з api.ts
        setButtons(data);
      } catch (error) {
        // Сюди потраплять помилки мережі (TypeError) або кинуті вище помилки
        console.error('Помилка завантаження кнопок:', error);
        tg.showAlert('Не вдалося завантажити список кнопок. Перевірте з\'єднання або URL API.');
      }
    };


    fetchButtons();
  }, []);

  // Функція для відправки даних боту
  const onSendData = useCallback(() => {
    if (buttons.length === 0) {
      tg.showAlert('Будь ласка, додайте хоча б одну кнопку.');
      return;
    }
    const data = {
      // Надсилаємо масив об'єктів, а не просто рядки
      buttons: buttons.map(b => ({ buttonName: b.buttonName, message: b.message })),
    };
    tg.sendData(JSON.stringify(data));
  }, [buttons]);

  useEffect(() => {
    const handleMainButtonClick = () => setFormVisible(true);
    
    if (isFormVisible) {
      tg.MainButton.setText('Надіслати список');
      tg.MainButton.onClick(onSendData);
    } else {
      tg.MainButton.setText('Додати кнопку');
      tg.MainButton.onClick(handleMainButtonClick);
    }
    
    if (!tg.MainButton.isVisible) {
      tg.MainButton.show();
    }
    
    return () => {
      tg.MainButton.offClick(onSendData);
      tg.MainButton.offClick(handleMainButtonClick);
    };
  }, [isFormVisible, onSendData]);

  const handleAddButton = async () => {
    const text = inputText.trim();
    const name = inputName.trim(); // Простий спосіб нумерації

    if (name !== '' && text !== '') {
      try {
        // 1. Викликаємо функцію для додавання кнопки
        const newButton = await addButton({ buttonName: name, message: text });
        // 2. Якщо дані успішно відправлено, оновлюємо стан у додатку
        setButtons((prev) => [...prev, newButton]);
        setInputName('');
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
      await deleteButton(idToRemove); // Викликаємо функцію для видалення
      setButtons((prev) => prev.filter((button) => button.id !== idToRemove));
    } catch (error) {
      console.error('Не вдалося видалити кнопку:', error);
      tg.showAlert('Сталася помилка при видаленні кнопки.');
    }
  };

  // Функція для початку редагування
  const handleEdit = (button: ApiButtonType) => { // Використовуємо перейменований тип
    setEditingId(button.id);
    setEditingName(button.buttonName);
    setEditingText(button.message);
  };

  // Функція для скасування редагування
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingText('');
  };

  // Функція для збереження змін
  const handleSaveEdit = async (buttonToUpdate: ApiButtonType) => { // Використовуємо перейменований тип
    try {
      const updatedButtonData = { ...buttonToUpdate, buttonName: editingName, message: editingText };
      await updateButton(updatedButtonData); // Викликаємо функцію для оновлення
      // Оновлюємо локальний стан
      setButtons(buttons.map(b =>
        b.id === buttonToUpdate.id ? updatedButtonData : b
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
      <AppBar position='static'>
        <Container sx={{ textAlign: 'center', padding: '10px' }}>
          <Typography variant="h4">Редактор кнопок</Typography>
        </Container>
      </AppBar>
      <Container sx={{p:'0'}}>
        <Box sx={{ mt: 2 }}> {/* Додаємо Box для відступу зверху */}
          {isFormVisible && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px', mb: 2 }}>
              <TextField
                // className="buttonsText" // Видаляємо кастомний клас
                label="Текст для кнопки" // Додаємо label для кращого UX
                variant="outlined"
                fullWidth
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
              />
              <TextField
                // className="buttonsText" // Видаляємо кастомний клас
                label="Текст для кнопки" // Додаємо label для кращого UX
                variant="outlined"
                fullWidth
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {/* <TextField
                // className="buttonsText" // Видаляємо кастомний клас
                label="Текст для кнопки" // Додаємо label для кращого UX
                variant="outlined"
                fullWidth
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              /> */}
              <Stack direction="row" spacing={2} justifyContent="flex-end"> {/* Використовуємо Stack для кнопок */}
                <Button variant="contained" onClick={handleAddButton}>Зберегти</Button>
                <Button variant="outlined" color="error" onClick={() => setFormVisible(false)}>
                  Скасувати
                </Button>
              </Stack>
            </Box>
          )}
          <List> {/* Використовуємо List для обгортання елементів */}
            {buttons.map((button) => (
              <ListItem 
                key={button.id} 
                sx={{ 
                  border: '1px solid #ccc', 
                  borderRadius: '4px', 
                  mb: 1, // Відступ між елементами списку
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 1 // Внутрішній відступ для ListItem
                }}
              >
                {editingId === button.id ? (
                  // --- Режим редагування ---
                  <>
                    <TextField
                      variant="outlined"
                      size="small" // Робимо меншим для вбудованого редагування
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      sx={{ flexGrow: 1, mr: 1 }} // Займає доступний простір
                    />
                     <TextField
                      variant="outlined"
                      size="small" // Робимо меншим для вбудованого редагування
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      sx={{ flexGrow: 1, mr: 1 }} // Займає доступний простір
                    />
                    <Stack direction="row" spacing={0.5}> {/* Використовуємо Stack для кнопок дій */}
                      <IconButton onClick={() => handleSaveEdit(button)} color="primary">
                        <DoneIcon />
                      </IconButton>
                      <IconButton onClick={handleCancelEdit} color="error">
                        <CancelIcon />
                      </IconButton>
                    </Stack>
                  </>
                ) : (
                  // --- Режим перегляду ---
                  <>
                    <ListItemText primary={button.message} sx={{ flexGrow: 1 }} /> {/* Використовуємо ListItemText */}
                    <ListItemText primary={button.buttonName} sx={{ flexGrow: 1 }}/> {/* Розміщуємо дії праворуч */}

                    <ListItemSecondaryAction> {/* Розміщуємо дії праворуч */}
                      <Stack direction="row" spacing={0.5}>
                        <IconButton onClick={() => handleEdit(button)} color="info">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleRemoveButton(button.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Container>
    </>
  );
}
export default App;
