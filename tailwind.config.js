/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'main': {
					50: '#f4f6fb',
					100: '#e7edf7',
					200: '#cad7ed',
					300: '#9bb6de',
					400: '#6590cb',
					500: '#4172b6',
					600: '#2d538f',
					700: '#28477c',
					800: '#243d68',
					900: '#233657',
					950: '#17223a'
				},
        'secondary': {
          '50': '#f0f9fb',
          '100': '#d9eff4',
          '200': '#b8dfe9',
          '300': '#86c7da',
          '400': '#4ea7c2',
          '500': '#328ba8',
          '600': '#2d728f',
          '700': '#2a5c74',
          '800': '#2a4e60',
          '900': '#274252',
          '950': '#152a37',
      },

			}
		}
	},
	plugins: [require('@tailwindcss/typography')],
	darkMode: 'class'
};
