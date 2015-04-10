var config = {
	port: 3000,
	secret: 'secret',
	redisPort: 6379,
	redisHost: 'localhost',
	routes: {
		login: '/account/login',
		logout: '/account/logout',
		register: '/account/register',
		play: '/play',
		about: '/about',
		leaderboard: '/leaderboard',
		admin: '/admin',
		facebookAuth: '/auth/facebook',
		facebookAuthCallback: '/auth/facebook/callback',
		googleAuth: '/auth/google',
		googleAuthCallback: '/auth/google/callback'
	},
	host: 'http://localhost:3000',
	facebook: {
		appID: '1430943077216235',
		appSecret: 'e8dd3cfdc95c1796173787eed9346420',
	},
	google: {
		clientID: '54673976201-dsemnk4n29eid6ikcktp3v6b5o8afq9n.apps.googleusercontent.com',
		clientSecret: 'GRoni3kHEot4inBbyHJ-qAaA'
	},
	crypto: {
		workFactor: 5000,
		keylen: 32,
		randomSize: 256
	}
};

module.exports = config;
