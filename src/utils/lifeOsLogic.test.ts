/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHabitStreak,
  calculateDailyFocusProgress,
  categorizeEisenhower,
  calculateRejectionTargetProgress,
  generateDailyActionableInsight,
} from './lifeOsLogic';

test('calculateHabitStreak counts consecutive days accurately', () => {
  const today = '2026-10-26';
  
  // Streak with today included
  const dates1 = ['2026-10-26', '2026-10-25', '2026-10-24'];
  assert.equal(calculateHabitStreak(dates1, today), 3);

  // Streak with yesterday done (maintaining streak before today's completion)
  const dates2 = ['2026-10-25', '2026-10-24'];
  assert.equal(calculateHabitStreak(dates2, today), 2);

  // Broken streak (gap 2 days ago)
  const dates3 = ['2026-10-23', '2026-10-22'];
  assert.equal(calculateHabitStreak(dates3, today), 0);

  // Empty dates
  assert.equal(calculateHabitStreak([], today), 0);
});

test('calculateDailyFocusProgress produces valid Apple ring percentages', () => {
  const result = calculateDailyFocusProgress(3, 5, 2, 4, 1, 10);
  assert.equal(result.habitsPct, 60);
  assert.equal(result.tasksPct, 50);
  assert.equal(result.couragePct, 50); // 1 out of 2 daily target
  assert.ok(result.overallScore > 0 && result.overallScore <= 100);
});

test('categorizeEisenhower places tasks in the right quadrant', () => {
  assert.equal(categorizeEisenhower(true, true), 'q1_do_now');
  assert.equal(categorizeEisenhower(false, true), 'q2_schedule');
  assert.equal(categorizeEisenhower(true, false), 'q3_delegate');
  assert.equal(categorizeEisenhower(false, false), 'q4_eliminate');
});

test('calculateRejectionTargetProgress tracks quota of 10 No\'s', () => {
  const progress4 = calculateRejectionTargetProgress(4, 10);
  assert.equal(progress4.percentage, 40);
  assert.equal(progress4.remaining, 6);
  assert.equal(progress4.isGoalReached, false);

  const progress10 = calculateRejectionTargetProgress(10, 10);
  assert.equal(progress10.percentage, 100);
  assert.equal(progress10.remaining, 0);
  assert.equal(progress10.isGoalReached, true);
});

test('generateDailyActionableInsight flags when more than 2 fronts are open', () => {
  const insight = generateDailyActionableInsight({
    activeFrontsCount: 4,
    tasksDueTodayCount: 3,
    rejectionsThisWeek: 0,
    uncomfortableActionDone: false,
    hoursUntilEvening: 6,
  });

  assert.equal(insight.tag, 'focus');
  assert.match(insight.title, /Fronti Aperti/);
});
