module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
		"node": true
    },
    "globals": {
        "console": true,
        "process": true,
		"describe": true,
		"it": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-console": 0,
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            1,
			"single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
