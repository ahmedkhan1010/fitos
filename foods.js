export const foods = [
  { name: 'Plain roti', serving: '1 medium', calories: 120, protein: 3.5, carbs: 22, fat: 2 },
  { name: 'Tandoori roti', serving: '1 piece', calories: 130, protein: 4, carbs: 24, fat: 2.5 },
  { name: 'Phulka', serving: '1 piece', calories: 95, protein: 3, carbs: 18, fat: 1.2 },
  { name: 'Cooked white rice', serving: '1 cup', calories: 206, protein: 4.3, carbs: 45, fat: 0.4 },
  { name: 'Brown rice', serving: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
  { name: 'Jeera rice', serving: '1 cup', calories: 250, protein: 4, carbs: 45, fat: 6 },
  { name: 'Dal tadka', serving: '1 cup', calories: 220, protein: 12, carbs: 18, fat: 10 },
  { name: 'Moong dal', serving: '1 cup', calories: 180, protein: 13, carbs: 20, fat: 3 },
  { name: 'Rajma curry', serving: '1 cup', calories: 240, protein: 13, carbs: 34, fat: 6 },
  { name: 'Chana masala', serving: '1 cup', calories: 260, protein: 13, carbs: 38, fat: 7 },
  { name: 'Paneer bhurji', serving: '1 cup', calories: 320, protein: 22, carbs: 10, fat: 22 },
  { name: 'Paneer curry', serving: '1 cup', calories: 340, protein: 20, carbs: 12, fat: 24 },
  { name: 'Chicken curry', serving: '1 cup', calories: 280, protein: 28, carbs: 8, fat: 15 },
  { name: 'Chicken breast', serving: '100 g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Egg omelette', serving: '2 eggs', calories: 180, protein: 12, carbs: 2, fat: 13 },
  { name: 'Boiled eggs', serving: '2 eggs', calories: 156, protein: 13, carbs: 1, fat: 11 },
  { name: 'Idli', serving: '2 pieces', calories: 128, protein: 4, carbs: 28, fat: 1 },
  { name: 'Dosa', serving: '1 medium', calories: 170, protein: 4, carbs: 22, fat: 7 },
  { name: 'Masala dosa', serving: '1 piece', calories: 330, protein: 8, carbs: 38, fat: 16 },
  { name: 'Poha', serving: '1 bowl', calories: 250, protein: 6, carbs: 40, fat: 8 },
  { name: 'Upma', serving: '1 bowl', calories: 220, protein: 5, carbs: 34, fat: 7 },
  { name: 'Oats porridge', serving: '1 bowl', calories: 180, protein: 7, carbs: 30, fat: 4 },
  { name: 'Curd', serving: '1 cup', calories: 98, protein: 5, carbs: 7, fat: 5 },
  { name: 'Milk', serving: '1 cup', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: 'Banana', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Apple', serving: '1 medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Peanut chaat', serving: '1 bowl', calories: 240, protein: 11, carbs: 14, fat: 16 },
  { name: 'Samosa', serving: '1 piece', calories: 260, protein: 5, carbs: 28, fat: 15 },
  { name: 'Aloo paratha', serving: '1 piece', calories: 320, protein: 8, carbs: 45, fat: 12 },
  { name: 'Kadhi pakora', serving: '1 cup', calories: 210, protein: 7, carbs: 18, fat: 11 },
  { name: 'Lassi', serving: '1 glass', calories: 180, protein: 6, carbs: 24, fat: 6 },
  { name: 'Sprouts salad', serving: '1 bowl', calories: 140, protein: 9, carbs: 18, fat: 4 },
];

export function searchFoods(query) {
  const q = query.trim().toLowerCase();
  if (!q) return foods.slice(0, 12);
  return foods.filter((food) => {
    const text = `${food.name} ${food.serving}`.toLowerCase();
    return text.includes(q) || q.includes(food.name.toLowerCase().split(' ')[0]);
  }).slice(0, 12);
}
