var { safeLoad, safeDump } = require('js-yaml')
var fs = require('fs')
var path = require('path')
let R = require('ramda')

let externalizationPath = 'source/règles/externalized.yaml'

let rules = safeLoad(
	fs.readFileSync(path.resolve('source/règles/base.yaml'), 'utf-8')
)

let currentExternalization = safeLoad(
	fs.readFileSync(path.resolve(externalizationPath), 'utf-8')
)

let attributesToExternalize = [
	'titre',
	'description',
	'question',
	'résumé',
	'suggestions',
	'contrôles'
]

let resolved = Object.entries(rules)
	.map(([dottedName, rule]) => [
		dottedName,
		!rule || !rule.titre
			? { ...rule, titre: dottedName.split(' . ').slice(-1)[0] }
			: rule
	])
	.map(([dottedName, rule]) => ({
		[dottedName]: R.mergeAll(
			R.toPairs(rule)
				.filter(([, v]) => !!v)
				.map(([k, v]) => {
					let attrToTranslate = attributesToExternalize.find(R.equals(k))
					if (!attrToTranslate) return {}
					let enTrad = attrToTranslate + '.en',
						frTrad = attrToTranslate + '.fr'

					let currentTranslation = currentExternalization[dottedName]
					//Check if a human traduction exists already for this attribute
					if (currentTranslation && currentTranslation[enTrad])
						return {
							[enTrad]: currentTranslation[enTrad],
							[frTrad]: v
						}

					return {
						[enTrad]: '!!' + v,
						[frTrad]: v
					}
				})
		)
	}))
fs.writeFileSync(externalizationPath, safeDump(R.mergeAll(resolved)))
