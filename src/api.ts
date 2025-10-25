// Читаємо базовий URL зі змінних середовища.
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Перевірка, чи змінна середовища визначена.
if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL не визначено. Будь ласка, створіть файл .env та додайте цю змінну.");
}

// Визначимо тип для кнопки, щоб його можна було використовувати в усьому додатку
export type Button = {
  id: string;
  buttonIndex: string;
  message: string;
};

/**
 * Завантажує всі кнопки з сервера.
 */
export const getButtons = async (): Promise<Button[]> => {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      // Створюємо помилку зі статусом, якщо сервер відповів, але з помилкою
      throw new Error(`Помилка сервера: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    // Перехоплюємо помилки мережі (Failed to fetch) і кидаємо їх далі
    console.error('Помилка мережевого запиту в getButtons:', error);
    // Можна кинути кастомну помилку, щоб обробити її в компоненті
    throw new Error('Не вдалося виконати запит. Перевірте URL API та з\'єднання з мережею.');
  }
};

/**
 * Додає нову кнопку на сервер.
 * @param buttonData - Дані для нової кнопки.
 */
export const addButton = async (buttonData: { buttonIndex: string; message: string }): Promise<Button> => {
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buttonData),
    });
    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Помилка при додаванні кнопки:', error);
    throw new Error('Не вдалося додати кнопку. Перевірте з\'єднання.');
  }
};

/**
 * Оновлює існуючу кнопку на сервері.
 * @param button - Об'єкт кнопки з оновленими даними.
 */
export const updateButton = async (button: Button): Promise<Button> => {
  try {
    const response = await fetch(`${baseUrl}/${button.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(button),
    });
    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Помилка при оновленні кнопки:', error);
    throw new Error('Не вдалося оновити кнопку. Перевірте з\'єднання.');
  }
};

/**
 * Видаляє кнопку з сервера за її ID.
 * @param id - ID кнопки для видалення.
 */
export const deleteButton = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Помилка сервера: ${response.status}`);
    }
  } catch (error) {
    console.error('Помилка при видаленні кнопки:', error);
    throw new Error('Не вдалося видалити кнопку. Перевірте з\'єднання.');
  }
};
