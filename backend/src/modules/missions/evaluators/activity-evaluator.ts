import { Injectable } from '@nestjs/common';
import { ActivityType } from '@prisma/client';

/**
 * Activity Evaluator
 *
 * Evaluates learner responses for different activity types
 * Returns: { correct, score, feedback }
 */

export interface EvaluationResult {
  correct: boolean;
  score: number;
  feedback: string;
  partialCredit?: boolean;
}

@Injectable()
export class ActivityEvaluator {
  /**
   * Evaluate an activity response based on type
   */
  evaluate(
    activityType: ActivityType,
    activityContent: any,
    response: any,
  ): EvaluationResult {
    switch (activityType) {
      case 'SELECT':
        return this.evaluateSelect(activityContent, response);
      case 'MATCH':
        return this.evaluateMatch(activityContent, response);
      case 'SEQUENCE':
        return this.evaluateSequence(activityContent, response);
      case 'CODE':
        return this.evaluateCode(activityContent, response);
      case 'EXPLAIN':
        return this.evaluateExplain(activityContent, response);
      case 'CREATE':
        return this.evaluateCreate(activityContent, response);
      case 'SOLVE':
        return this.evaluateSolve(activityContent, response);
      default:
        throw new Error(`Unknown activity type: ${activityType}`);
    }
  }

  /**
   * SELECT: Multiple choice or checkbox
   * Content: { question, options, correctAnswers }
   * Response: { selectedAnswers }
   */
  private evaluateSelect(content: any, response: any): EvaluationResult {
    const correct = content.correctAnswers || [];
    const selected = response.selectedAnswers || [];

    // Check if arrays are equal
    const isCorrect = this.arraysEqual(
      correct.sort(),
      selected.sort(),
    );

    if (isCorrect) {
      return {
        correct: true,
        score: 1.0,
        feedback: 'Perfect! You got it right!',
      };
    }

    // Partial credit if some answers correct
    const correctCount = selected.filter((s) => correct.includes(s)).length;
    const incorrectCount = selected.filter((s) => !correct.includes(s)).length;
    const missedCount = correct.length - correctCount;

    if (correctCount > 0 && incorrectCount === 0 && missedCount > 0) {
      // Some correct, none wrong, but missed some
      const score = correctCount / correct.length;
      return {
        correct: false,
        score,
        feedback: `You got ${correctCount} out of ${correct.length} correct. You missed some answers.`,
        partialCredit: true,
      };
    }

    return {
      correct: false,
      score: 0.0,
      feedback: 'Not quite. Try again!',
    };
  }

  /**
   * MATCH: Match pairs of items
   * Content: { pairs: [{left, right}] }
   * Response: { matches: [{left, right}] }
   */
  private evaluateMatch(content: any, response: any): EvaluationResult {
    const correctPairs = content.pairs || [];
    const userMatches = response.matches || [];

    let correctCount = 0;
    for (const userMatch of userMatches) {
      const isCorrect = correctPairs.some(
        (pair) => pair.left === userMatch.left && pair.right === userMatch.right,
      );
      if (isCorrect) correctCount++;
    }

    const score = correctCount / correctPairs.length;
    const isCorrect = score === 1.0;

    if (isCorrect) {
      return {
        correct: true,
        score: 1.0,
        feedback: 'Excellent! All matches are correct!',
      };
    } else if (score > 0) {
      return {
        correct: false,
        score,
        feedback: `You matched ${correctCount} out of ${correctPairs.length} correctly.`,
        partialCredit: true,
      };
    }

    return {
      correct: false,
      score: 0.0,
      feedback: 'Try matching the items again.',
    };
  }

  /**
   * SEQUENCE: Put items in correct order
   * Content: { items, correctOrder }
   * Response: { orderedItems }
   */
  private evaluateSequence(content: any, response: any): EvaluationResult {
    const correctOrder = content.correctOrder || [];
    const userOrder = response.orderedItems || [];

    const isCorrect = this.arraysEqual(correctOrder, userOrder);

    if (isCorrect) {
      return {
        correct: true,
        score: 1.0,
        feedback: 'Perfect sequence!',
      };
    }

    // Calculate how many items are in correct positions
    let correctPositions = 0;
    for (let i = 0; i < correctOrder.length; i++) {
      if (correctOrder[i] === userOrder[i]) {
        correctPositions++;
      }
    }

    const score = correctPositions / correctOrder.length;

    if (score > 0.5) {
      return {
        correct: false,
        score,
        feedback: `${correctPositions} out of ${correctOrder.length} items are in the right place.`,
        partialCredit: true,
      };
    }

    return {
      correct: false,
      score,
      feedback: 'Try reordering the items.',
    };
  }

  /**
   * CODE: Write code to solve a problem
   * Content: { prompt, testCases, expectedOutput }
   * Response: { code }
   */
  private evaluateCode(content: any, response: any): EvaluationResult {
    // For MVP, we do simple checks
    // In production, this would run code in a sandbox

    const code = response.code || '';

    // Basic validation
    if (code.trim().length === 0) {
      return {
        correct: false,
        score: 0.0,
        feedback: 'Please write some code.',
      };
    }

    // Check for required keywords (simplified)
    const requiredKeywords = content.requiredKeywords || [];
    const hasRequiredKeywords = requiredKeywords.every((keyword) =>
      code.includes(keyword),
    );

    if (hasRequiredKeywords) {
      return {
        correct: true,
        score: 0.9, // Not perfect without actual execution
        feedback: 'Good job! Your code includes the required elements.',
        partialCredit: true,
      };
    }

    return {
      correct: false,
      score: 0.3,
      feedback: 'Your code is missing some required elements. Check the instructions.',
      partialCredit: true,
    };
  }

  /**
   * EXPLAIN: Explain a concept
   * Content: { question, keyPoints }
   * Response: { explanation }
   */
  private evaluateExplain(content: any, response: any): EvaluationResult {
    // For MVP, basic text length check
    // In production, this would use AI to evaluate

    const explanation = response.explanation || '';
    const keyPoints = content.keyPoints || [];

    if (explanation.trim().length < 20) {
      return {
        correct: false,
        score: 0.0,
        feedback: 'Please provide a more detailed explanation.',
      };
    }

    // Check if explanation mentions key points
    const mentionedPoints = keyPoints.filter((point) =>
      explanation.toLowerCase().includes(point.toLowerCase()),
    );

    const score = mentionedPoints.length / keyPoints.length;

    if (score >= 0.7) {
      return {
        correct: true,
        score: Math.max(score, 0.8),
        feedback: 'Great explanation! You covered the main points.',
      };
    } else if (score > 0) {
      return {
        correct: false,
        score: score * 0.7,
        feedback: `Good start! Try to include more about: ${keyPoints.filter(p => !mentionedPoints.includes(p)).join(', ')}`,
        partialCredit: true,
      };
    }

    return {
      correct: false,
      score: 0.3,
      feedback: 'Your explanation needs more detail. Try again!',
      partialCredit: true,
    };
  }

  /**
   * CREATE: Create something (drawing, project, etc.)
   * Content: { prompt, rubric }
   * Response: { submission, description }
   */
  private evaluateCreate(content: any, response: any): EvaluationResult {
    // Creative activities get credit for completion
    // Detailed evaluation would be done by teacher/AI

    const hasSubmission = response.submission || response.description;

    if (!hasSubmission) {
      return {
        correct: false,
        score: 0.0,
        feedback: 'Please submit your creation.',
      };
    }

    // Auto-approve with medium score (teacher can adjust later)
    return {
      correct: true,
      score: 0.8,
      feedback: 'Nice work! Your creation has been submitted.',
      partialCredit: true,
    };
  }

  /**
   * SOLVE: Solve a problem
   * Content: { problem, solution, acceptableAnswers }
   * Response: { answer }
   */
  private evaluateSolve(content: any, response: any): EvaluationResult {
    const correctAnswer = content.solution;
    const acceptableAnswers = content.acceptableAnswers || [correctAnswer];
    const userAnswer = response.answer;

    // Normalize and compare
    const normalizedUser = this.normalizeAnswer(userAnswer);
    const isCorrect = acceptableAnswers.some(
      (ans) => this.normalizeAnswer(ans) === normalizedUser,
    );

    if (isCorrect) {
      return {
        correct: true,
        score: 1.0,
        feedback: 'Correct! Well done!',
      };
    }

    return {
      correct: false,
      score: 0.0,
      feedback: 'Not quite right. Try again!',
    };
  }

  // Helper methods
  private arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  private normalizeAnswer(answer: any): string {
    if (typeof answer === 'number') return answer.toString();
    if (typeof answer === 'string') {
      return answer.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    return String(answer);
  }

  /**
   * Map ActivityType to EvidenceType for mastery tracking
   */
  getEvidenceType(activityType: ActivityType): string {
    const mapping = {
      SELECT: 'KNOWLEDGE',
      MATCH: 'APPLICATION',
      SEQUENCE: 'PROBLEM_SOLVING',
      CODE: 'CREATION',
      EXPLAIN: 'EXPLANATION',
      CREATE: 'CREATION',
      SOLVE: 'PROBLEM_SOLVING',
    };

    return mapping[activityType] || 'APPLICATION';
  }
}
