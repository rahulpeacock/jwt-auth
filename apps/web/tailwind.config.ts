import baseConfig from '@kittyo/ui/tailwind.config';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  presets: [baseConfig],
  plugins: [],
} satisfies Config;
