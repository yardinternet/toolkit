module.exports = {
	extends: [
		'stylelint-config-recommended',
		'stylelint-config-idiomatic-order',
	],
	rules: {
		'media-query-no-invalid': null,
		'at-rule-no-unknown': null,
		'function-no-unknown': null,
		'no-descending-specificity': null,
		'no-invalid-position-at-import-rule': null,
		'selector-pseudo-element-colon-notation': 'double',
		'font-family-no-missing-generic-family-keyword': [
			true,
			{
				ignoreFontFamilies: [ '/Font Awesome/' ],
			},
		],
		'rule-empty-line-before': [
			'always-multi-line',
			{
				ignore: [ 'after-comment' ],
				except: [ 'first-nested' ],
			},
		],
		'comment-empty-line-before': [
			'always',
			{
				except: [ 'first-nested' ],
				ignore: [ 'after-comment', 'stylelint-commands' ],
			},
		],
		'annotation-no-unknown': [
			true,
			{
				ignoreAnnotations: [ 'default' ],
			},
		],
	},
};
