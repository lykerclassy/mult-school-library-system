// backend/services/aiQuizService.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ← Must be here
});

const generateQuiz = async (subject, topic, numQuestions = 5) => {
  const prompt = `
Generate a ${numQuestions}-question multiple-choice quiz on "${topic}" in ${subject}.
Format strictly as JSON:
{
  "questions": [
    {
      "question": "Text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A) Correct option",
      "explanation": "Brief explanation"
    }
  ]
}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    throw new Error('Failed to parse AI response');
  }
};

const gradeQuiz = async (questions, answers) => {
  const prompt = `
Grade this quiz. Return JSON:
{
  "score": 8,
  "total": 10,
  "feedback": "You did well on X but missed Y...",
  "correct": [0, 2, 4],
  "incorrect": [1, 3]
}
Quiz:
${JSON.stringify(questions)}
Answers:
${JSON.stringify(answers)}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    throw new Error('Failed to grade quiz');
  }
};

export { generateQuiz, gradeQuiz };