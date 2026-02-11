module.exports = {
    RAG_ANSWER_PROMPT: `You are a strict learning assistant. Answer the user's question ONLY using the provided context from their uploaded study materials.

CRITICAL RULES:
1. Use ONLY information from the context below
2. If the context doesn't contain enough information, respond: "This topic is not covered in your uploaded materials."
3. Do NOT use external knowledge or make assumptions
4. Cite which source the information comes from when possible

Context:
{context}

Question: {question}

Answer:`,

    SUMMARY_PROMPT: `Generate structured study notes for the topic: {topic}

Use ONLY the following materials:
{context}

Create notes in this format:

## Topic Overview
[Brief overview]

## Key Concepts
[List main concepts]

## Important Definitions
[Key terms and definitions]

## Core Explanation
[Detailed explanation]

## Examples
[Relevant examples from materials]

## Common Mistakes
[If mentioned in materials]

## Quick Revision Points
[Bullet points for quick review]`,

    QUIZ_GENERATION_PROMPT: `Generate a {difficulty} level {question_type} question based on this material:

{context}

Topic: {topic}

Requirements:
- Question must be answerable from the provided context
- Difficulty: {difficulty}
- Type: {question_type}
- Include correct answer
- For MCQ: provide 4 options

Format your response as JSON:
{
  "question": "...",
  "type": "{question_type}",
  "options": ["A", "B", "C", "D"], // Only for MCQ
  "correct_answer": "...",
  "topic": "{topic}",
  "difficulty": "{difficulty}"
}`,

    EVALUATION_PROMPT: `Evaluate the student's answer to this question.

Question: {question}
Correct Answer: {correct_answer}
Student's Answer: {user_answer}

Evaluate as:
- "correct" if the answer is accurate and complete
- "partial" if the answer is partially correct or incomplete
- "incorrect" if the answer is wrong

Provide a brief explanation.

Format as JSON:
{
  "evaluation": "correct|partial|incorrect",
  "explanation": "..."
}`,

    SMART_NOTES_PROMPT: `Generate personalized study notes based on the student's performance.

Weak Topics: {weak_topics}
Strong Topics: {strong_topics}
Recent Mistakes: {recent_mistakes}

Study Materials:
{context}

Create personalized notes with:

## High Priority Topics
[Topics needing immediate attention]

## Simplified Explanations
[Break down weak concepts simply]

## Memory Anchors
[Mnemonics or memory aids]

## Focused Practice Questions
[3-5 questions on weak areas]

## Recommended Revision Order
[Optimal study sequence]

{youtube_timestamps}`,

    PERFORMANCE_ANALYSIS_PROMPT: `Analyze the quiz performance and provide insights.

Quiz Results:
{quiz_results}

Provide:
1. Overall assessment
2. Strong areas
3. Weak areas
4. Conceptual gaps identified
5. Specific improvement suggestions
6. Recommended focus areas

Be specific and actionable.`,
};
