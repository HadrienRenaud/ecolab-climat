import { expect } from 'chai'
import { enrichRule } from '../source/engine/rules'
import { analyseMany, parseAll } from '../source/engine/traverse'

describe('controls', function() {
	let rawRules = [
			{
				nom: 'net',
				formule: 'brut - cotisation'
			},
			{ nom: 'cotisation', formule: 235 },
			{ nom: 'résident en France', formule: 'oui' },
			{
				nom: 'brut',
				unité: '€',
				question: 'Quel est le salaire brut ?',
				contrôles: [
					{
						si: 'brut < 300',
						niveau: 'bloquant',
						message:
							'Malheureux, je crois que vous vous êtes trompé dans votre saisie.'
					},
					{
						si: 'brut < 1000',
						niveau: 'bloquant',
						message: 'Toujours pas, nous avons des standards en France !'
					},
					{
						si: 'brut < 1500',
						niveau: 'avertissement',
						message: 'Toujours pas, nous avons des standards en France !'
					},
					{
						si: 'brut > 100000',
						niveau: 'information',
						message: 'Oulah ! Oulah !'
					},
					{
						si: {
							'toutes ces conditions': ['brut > 1000000', 'résident en France']
						},
						niveau: 'information',
						message: 'Vous êtes un contribuable hors-pair !'
					}
				]
			}
		],
		rules = rawRules.map(enrichRule),
		parsedRules = parseAll(rules)

	it('Should parse blocking controls', function() {
		let controls = Object.values(parsedRules).find(r => r.contrôles).contrôles
		expect(
			controls.filter(({ level }) => level == 'bloquant')
		).to.have.lengthOf(2)
	})

	it('Should allow imbricated conditions', function() {
		let controls = analyseMany(parsedRules, ['net'])(
			dottedName => ({ brut: 2000000 }[dottedName])
		).controls
		expect(
			controls.find(
				({ message }) => message === 'Vous êtes un contribuable hors-pair !'
			)
		).to.exist

		let controls2 = analyseMany(parsedRules, ['net'])(
			dottedName => ({ brut: 100001 }[dottedName])
		).controls
		expect(controls2.find(({ message }) => message === 'Oulah ! Oulah !')).to
			.exist

		let controls3 = analyseMany(parsedRules, ['net'])(
			dottedName => ({ brut: 100 }[dottedName])
		).controls
		expect(
			controls3.find(
				({ message }) =>
					message ===
					'Malheureux, je crois que vous vous êtes trompé dans votre saisie.'
			)
		).to.exist
	})
})
