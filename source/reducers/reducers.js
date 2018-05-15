import { combineReducers } from 'redux'
import reduceReducers from 'reduce-reducers'
import { reducer as formReducer, formValueSelector } from 'redux-form'
import reduceSteps from './reduceSteps'
import computeThemeColours from 'Components/themeColours'
import { formatInputs } from 'Engine/rules'

import { popularTargetNames } from 'Components/TargetSelection'

function themeColours(state = computeThemeColours(), { type, colour }) {
	if (type == 'CHANGE_THEME_COLOUR') return computeThemeColours(colour)
	else return state
}

function explainedVariable(state = null, { type, variableName = null }) {
	switch (type) {
		case 'EXPLAIN_VARIABLE':
			return variableName
		default:
			return state
	}
}

function currentExample(state = null, { type, situation, name }) {
	switch (type) {
		case 'SET_EXAMPLE':
			return name != null ? { name, situation } : null
		default:
			return state
	}
}

function conversationStarted(state = false, { type }) {
	switch (type) {
		case 'START_CONVERSATION':
		case 'LOAD_PREVIOUS_SIMULATION':
			return true
		case 'RESET_SIMULATION':
			return false
		default:
			return state
	}
}
function activeTargetInput(state = null, { type, name }) {
	switch (type) {
		case 'SET_ACTIVE_TARGET_INPUT':
			return name
		case 'RESET_SIMULATION':
			return null
		default:
			return state
	}
}
function foldedSteps(state = [], { type }) {
	switch (type) {
		case 'RESET_SIMULATION':
			return []
		default:
			return state
	}
}

function analysis(state = null, { type }) {
	switch (type) {
		case 'RESET_SIMULATION':
			return null
		default:
			return state
	}
}
export default (tracker, initialRules) =>
	reduceReducers(
		combineReducers({
			sessionId: (id = Math.floor(Math.random() * 1000000000000) + '') => id,
			//  this is handled by redux-form, pas touche !
			form: formReducer,

			/* Have forms been filled or ignored ?
		false means the user is reconsidering its previous input */
			foldedSteps,
			currentQuestion: (state = null) => state,
			nextSteps: (state = []) => state,
			missingVariablesByTarget: (state = {}) => state,

			parsedRules: (state = null) => state,
			flatRules: (state = null) => state,
			analysis,

			targetNames: (state = popularTargetNames) => state,

			situationGate: (state = () => null) => state,

			iframe: (state = false) => state,

			themeColours,

			explainedVariable,

			currentExample,
			conversationStarted,
			activeTargetInput
		}),
		// cross-cutting concerns because here `state` is the whole state tree
		reduceSteps(
			tracker,
			initialRules,
			formatInputs(initialRules, formValueSelector)
		)
	)