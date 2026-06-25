export const coachingEntries = [
  {
    keywords: ['protein', 'muscle', 'gain'],
    title: 'Protein and growth',
    answer: 'To support muscle gain, keep protein high, train with progressive overload, and eat enough total calories.',
  },
  {
    keywords: ['fat loss', 'cut', 'lose weight'],
    title: 'Fat-loss setup',
    answer: 'For fat loss, keep a modest calorie deficit, keep protein high, and maintain resistance training.',
  },
  {
    keywords: ['knee', 'pain', 'injury'],
    title: 'Pain-aware adaptation',
    answer: 'If an exercise hurts, swap to a joint-friendlier variation, reduce load, or use a machine with a stable path.',
  },
  {
    keywords: ['tired', 'sleep', 'recovery'],
    title: 'Recovery adjustment',
    answer: 'If recovery is low, reduce volume, choose lighter work, and prioritize sleep and hydration first.',
  },
  {
    keywords: ['calorie', 'food', 'eat'],
    title: 'Nutrition logging',
    answer: 'Search the Indian food library, match the meal, and compare the logged calories to the daily target.',
  },
];

export function getCoachAnswer(message) {
  const text = message.toLowerCase();
  const match = coachingEntries.find((entry) => entry.keywords.some((k) => text.includes(k)));
  if (match) return match.answer;
  return 'I would classify the intent, search the knowledge base, and answer with the user\'s goal, recovery, and logged history in mind.';
}
