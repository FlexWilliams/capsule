import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_TEST_ACTIVATED: {
		public: true,
		static: true,
		description: 'Flag used to allow mocks into api e2e testing'
	},
	DATABASE_URL: {
		description: 'The database connection string.'
	}
});
