module.exports = {
	packagerConfig: {
		icon: './src/assets/api_FILL0_wght400_GRAD0_opsz48.png'
	},
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {
				icon: './src/assets/api_FILL0_wght400_GRAD0_opsz48.png'
			}
		},
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin"]
		},
		{
			name: "@electron-forge/maker-deb",
			config: {}
		},
		{
			name: "@electron-forge/maker-rpm",
			config: {}
		}
	]
};
