/**
 * Shared utilities for parsing ASM files from the Yellow Legacy ROM hack.
 */

import fs from 'fs'
import path from 'path'

const LEGACY_ROOT = path.join(process.cwd(), 'yellow-legacy-v1.0.9')

export function readAsm(relativePath) {
	const fullPath = path.join(LEGACY_ROOT, relativePath)
	return fs.readFileSync(fullPath, 'utf-8')
}

export function readAsmLines(relativePath) {
	return readAsm(relativePath).split('\n')
}

/**
 * Parse const_def/const blocks to build a name->value mapping.
 * Handles: const_def, const_def N, const NAME, const_skip, const_next N
 */
export function parseConstants(lines) {
	const result = {}
	let value = 0
	for (const line of lines) {
		const trimmed = line.trim()
		const constDef = trimmed.match(/^const_def\s+(\d+)/)
		const constDefEmpty = trimmed.match(/^const_def\s*$/)
		const constSkip = trimmed.match(/^const_skip/)
		const constNext = trimmed.match(/^const_next\s+(\d+)/)
		const constLine = trimmed.match(/^\s*const\s+(\w+)/)

		if (constDef) {
			value = parseInt(constDef[1], 10)
		} else if (constDefEmpty) {
			value = 0
		} else if (constSkip) {
			value++
		} else if (constNext) {
			value = parseInt(constNext[1], 10)
		} else if (constLine) {
			result[constLine[1]] = value
			value++
		}
	}
	return result
}

/**
 * Parse list_start/li blocks for string lists.
 */
export function parseLiList(lines) {
	const result = []
	let inList = false
	for (const line of lines) {
		if (line.includes('list_start')) {
			inList = true
			continue
		}
		if (inList) {
			const match = line.match(/li\s+"([^"]*)"/)
			if (match) {
				result.push(match[1].trim())
			} else if (line.includes('assert_list_length') || line.includes('assert_table_length')) {
				break
			}
		}
	}
	return result
}

/**
 * Parse db "NAME" lines (MonsterNames format).
 */
export function parseDbStrings(lines) {
	const result = []
	for (const line of lines) {
		const match = line.match(/db\s+"([^"]*)"/)
		if (match) {
			result.push(match[1].trim().replace(/@+$/, ''))
		}
	}
	return result
}

/**
 * Convert a string to Title Case for display.
 * Handles: "SWORDS DANCE" -> "Swords Dance", "MR.MIME" -> "Mr. Mime"
 */
export function toTitleCase(str) {
	const cleaned = (str ?? '').replace(/@+$/, '').trim()
	if (!cleaned) return ''
	return cleaned
		.toLowerCase()
		.replace(/(?:^|\s|[-._])\w/g, c => c.toUpperCase())
}

/**
 * ROM decode overrides for strings that don't title-case well due to charset constraints.
 * Key: raw ROM string (uppercase for matching). Value: mechanically normalized display name.
 * Editorial renames (e.g. RIVAL3 -> Champion) belong in the app layer, not here.
 */
export const ROM_NAME_OVERRIDES = {
	// Pokemon
	'NIDORAN♂': 'Nidoran ♂',
	'NIDORAN♀': 'Nidoran ♀',
	'MR.MIME': 'Mr. Mime',
	"FARFETCH'D": "Farfetch'd",
	// Moves (ROM uses different spelling)
	'SAND-ATTACK': 'Sand Attack',
	'DOUBLE-EDGE': 'Double-Edge',
	'HI JUMP KICK': 'High Jump Kick',
	// Trainers
	'JR.TRAINER♂': 'Jr. Trainer ♂',
	'JR.TRAINER♀': 'Jr. Trainer ♀',
	'LT.SURGE': 'Lt. Surge',
	'PROF.OAK': 'Prof. Oak',
	'COOLTRAINER♂': 'Cooltrainer ♂',
	'COOLTRAINER♀': 'Cooltrainer ♀',
	'OFF.JENNY': 'Officer Jenny',
}

export function toDisplayName(rawStr, overrides = ROM_NAME_OVERRIDES) {
	const key = (rawStr ?? '').replace(/@+$/, '').trim().toUpperCase()
	if (overrides[key]) return overrides[key]
	return toTitleCase(rawStr)
}
