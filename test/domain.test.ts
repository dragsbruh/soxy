import { describe, it, expect } from 'vitest';
import { validDomain } from '../src/domain';

describe('isValidDomain', () => {

    it('should return true for a valid domain', () => {
        expect(validDomain('example.com')).toBe(true);
        expect(validDomain('subdomain.example.com')).toBe(true);
    });

    it('should return false for invalid domains', () => {
        expect(validDomain('')).toBe(false);
        expect(validDomain('a'.repeat(254))).toBe(false);
        expect(validDomain('example..com')).toBe(false);
        expect(validDomain('example@com')).toBe(false);
        expect(validDomain('-.example.com')).toBe(false);
        expect(validDomain('example-.com')).toBe(false);
    });

    it('should return false for domains without a dot', () => {
        expect(validDomain('example')).toBe(false);
        expect(validDomain('localhost')).toBe(false);
    });

    it('should return false for domain that is just a dot', () => {
        expect(validDomain('.')).toBe(false);
    });

    it('should return true for domain with valid TLD', () => {
        expect(validDomain('example.co')).toBe(true);
        expect(validDomain('example.org')).toBe(true);
    });
});


it('should benchmark validDomain execution time', () => {
    const N = 100000;
    const samples = [
        'example.com',
        'sub.example.com',
        'a'.repeat(63) + '.com',
        'invalid_domain',
        '',
        'localhost',
        'example..com',
    ];

    const start = performance.now();

    for (let i = 0; i < N; i++) {
        validDomain(samples[i % samples.length]);
    }

    const end = performance.now();
    const avgTime = (end - start) / N;

    console.log(`validDomain avg time: ${avgTime.toFixed(12)} ms`);
});