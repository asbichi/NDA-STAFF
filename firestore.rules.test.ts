import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: any;
const RULES = readFileSync('DRAFT_firestore.rules', 'utf8');

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-school-cbt',
    firestore: { rules: RULES },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Rules Security', () => {
  it('1. Create CBT Result with missing fields (Denied)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('cbt_results').doc('test').set({
      studentId: '123'
      // missing fields
    }));
  });

  it('2. Create CBT Result with extra "Ghost Field" (Denied)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('cbt_results').doc('test').set({
      studentId: '123',
      studentName: 'Test',
      class: 'SS3',
      score: 10,
      total: 20,
      percentage: 50,
      date: testEnv.firestore.FieldValue.serverTimestamp(),
      ghostField: 'ghost'
    }));
  });

  it('3. Create CBT Result with invalid score type (Denied)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('cbt_results').doc('test').set({
      studentId: '123',
      studentName: 'Test',
      class: 'SS3',
      score: "string_score",
      total: 20,
      percentage: 50,
      date: testEnv.firestore.FieldValue.serverTimestamp()
    }));
  });

  it('4. Create CBT Result with spoofed date (Denied)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('cbt_results').doc('test').set({
      studentId: '123',
      studentName: 'Test',
      class: 'SS3',
      score: 10,
      total: 20,
      percentage: 50,
      date: new Date('2020-01-01')
    }));
  });

  it('5. Create Student without being admin (Denied)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('students').doc('test').set({
      name: 'Test', admissionNo: '123', class: 'SS3', arm: 'A', gender: 'Male'
    }));
  });

  it('6. Update Student without being admin (Denied)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('students').doc('test').update({
      name: 'Test 2'
    }));
  });

  it('7. Delete Student without being admin (Denied)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('students').doc('test').delete());
  });

  // Similarly for Questions and Scores
  it('8. Create Question without being admin (Denied)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('questions').doc('test').set({
      subject: 'Math', class: 'SS3', text: '1+1?', options: {A:'1',B:'2',C:'3',D:'4'}, correctAnswer: 'B'
    }));
  });
});
