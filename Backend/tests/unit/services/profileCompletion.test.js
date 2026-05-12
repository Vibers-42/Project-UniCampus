/**
 * @file profileCompletion.test.js — Unit Tests for Profile Completion Logic
 */

const { computeProfileCompletion } = require('../../../src/modules/users/users.service');

describe('computeProfileCompletion', () => {
  it('should return 0 for null user', () => {
    expect(computeProfileCompletion(null)).toBe(0);
  });

  it('should return 0 for empty user object', () => {
    expect(computeProfileCompletion({})).toBe(0);
  });

  it('should count department as filled', () => {
    const user = { department: 'CSE' };
    const result = computeProfileCompletion(user);
    expect(result).toBeGreaterThan(0);
  });

  it('should count yearOfStudy (number) as filled', () => {
    const user = { yearOfStudy: 3 };
    const result = computeProfileCompletion(user);
    expect(result).toBeGreaterThan(0);
  });

  it('should not count yearOfStudy = 0 as filled', () => {
    const user = { yearOfStudy: 0 };
    expect(computeProfileCompletion(user)).toBe(0);
  });

  it('should count array fields with values', () => {
    const user = { skills: ['react', 'node'] };
    const result = computeProfileCompletion(user);
    expect(result).toBeGreaterThan(0);
  });

  it('should not count empty arrays', () => {
    const user = { skills: [], interests: [] };
    expect(computeProfileCompletion(user)).toBe(0);
  });

  it('should not count empty strings', () => {
    const user = { bio: '', github: '  ' };
    expect(computeProfileCompletion(user)).toBe(0);
  });

  it('should count string fields with values', () => {
    const user = { bio: 'I love coding', avatar: 'https://example.com/avatar.jpg' };
    const result = computeProfileCompletion(user);
    expect(result).toBeGreaterThan(0);
  });

  it('should return 100 for fully completed profile', () => {
    const user = {
      department: 'CSE',
      yearOfStudy: 3,
      bio: 'Full stack developer',
      skills: ['react'],
      interests: ['ai'],
      techStack: ['node'],
      rolesPreferred: ['frontend'],
      availability: 'available',
      github: 'https://github.com/test',
      linkedin: 'https://linkedin.com/in/test',
      portfolio: 'https://portfolio.test.com',
      avatar: 'https://example.com/avatar.jpg',
    };
    expect(computeProfileCompletion(user)).toBe(100);
  });

  it('should calculate partial completion correctly', () => {
    // 6 out of 12 fields filled = 50%
    const user = {
      department: 'CSE',
      yearOfStudy: 2,
      bio: 'Student',
      skills: ['python'],
      interests: ['ml'],
      avatar: 'https://example.com/pic.jpg',
    };
    expect(computeProfileCompletion(user)).toBe(50);
  });
});
