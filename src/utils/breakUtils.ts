import { Break } from '../interfaces/break';

/**
 * Определяет активную паузу из массива пауз на основе текущего времени
 * @param breaks - Массив пауз с временем начала и окончания
 * @param currentTime - Текущее время для проверки
 * @returns Активная пауза или null, если пауза не активна
 */
export function getActiveBreak(breaks: Break[], currentTime: Date): Break | null {
  // Проверяем каждую паузу на активность
  for (const breakItem of breaks) {
    // Пропускаем паузы без времени начала или окончания
    if (!breakItem.start || !breakItem.end) {
      continue;
    }

    // Пауза активна, если текущее время >= времени начала и < времени окончания
    if (currentTime >= breakItem.start && currentTime < breakItem.end) {
      return breakItem;
    }
  }

  return null;
}

/**
 * Определяет режим отображения на основе активной паузы
 * @param activeBreak - Активная пауза или null
 * @returns 'break' если есть активная пауза, 'work' в противном случае
 */
export function getDisplayMode(activeBreak: Break | null): 'work' | 'break' {
  return activeBreak ? 'break' : 'work';
}

