import { defineConfig } from 'vitest/config';
export default defineConfig({ oxc: { jsx: { runtime: 'automatic' } }, test: { include: ['tests/unit/**/*.test.js', 'tests/components/**/*.test.jsx'], environment: 'node', setupFiles: ['./tests/setup.js'] } });
