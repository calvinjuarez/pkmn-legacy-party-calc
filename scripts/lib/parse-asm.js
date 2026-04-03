/**
 * Mechanical ASM file reading and low-level parse helpers (no display transforms).
 */

import fs from 'fs'
import path from 'path'

/**
 * @param {string} legacyRoot Absolute path to ROM hack source tree
 * @returns {{ readAsm: (rel: string) => string, readAsmLines: (rel: string) => string[] }}
 */
export function createAsmReaders(legacyRoot) {
	function readAsm(relativePath) {
		const fullPath = path.join(legacyRoot, relativePath)
		return fs.readFileSync(fullPath, 'utf-8')
	}

	function readAsmLines(relativePath) {
		return readAsm(relativePath).split('\n')
	}

	return { readAsm, readAsmLines }
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
